import { useState, useCallback, useEffect, useRef } from 'react';
import { Contract, type JsonRpcSigner, Interface, formatEther } from 'ethers';
import { AffixNFT__factory } from '@org/shared-types';

export interface AffixEntry {
  trait_type: string;
  value: string;
}

export interface MintState {
  status:
    | 'idle'
    | 'pending'
    | 'confirming'
    | 'revealing'
    | 'revealed'
    | 'failed';
  tokenId: number | null;
  txHash: string | null;
  error: string | null;
  imageUrl: string | null;
  tokenUri: string | null;
  affixes: AffixEntry[];
  animationPlayed: boolean;
}

const POLL_INTERVAL = 5_000;
const POLL_TIMEOUT = 120_000;

const MINT_REQUESTED_TOPIC =
  '0x32f62f6e38f01677299722b6f618d17026edcb8decf51f73dd4c6d8ffcebd74f';

const ANIMATION_STORAGE_KEY = 'mintaro_revealed_tokens';
const LAST_TOKEN_KEY = 'mintaro_last_token';

function getStoredTokenId(): number | null {
  try {
    const raw = sessionStorage.getItem(LAST_TOKEN_KEY);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id >= 0 ? id : null;
  } catch {
    return null;
  }
}

function storeLastTokenId(tokenId: number): void {
  try {
    sessionStorage.setItem(LAST_TOKEN_KEY, String(tokenId));
  } catch {
    // sessionStorage may be unavailable
  }
}

function getRevealedTokens(): Set<number> {
  try {
    const raw = sessionStorage.getItem(ANIMATION_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function markTokenRevealed(tokenId: number): void {
  try {
    const tokens = getRevealedTokens();
    if (tokens.has(tokenId)) return;
    tokens.add(tokenId);
    sessionStorage.setItem(ANIMATION_STORAGE_KEY, JSON.stringify([...tokens]));
  } catch {
    // sessionStorage may be unavailable
  }
}

function wasAnimationPlayed(tokenId: number): boolean {
  return getRevealedTokens().has(tokenId);
}

export function useAffixNFT(
  signer: JsonRpcSigner | null,
  contractAddress: string | null,
) {
  const [mintState, setMintState] = useState<MintState>({
    status: 'idle',
    tokenId: null,
    txHash: null,
    error: null,
    imageUrl: null,
    tokenUri: null,
    affixes: [],
    animationPlayed: false,
  });
  const [totalMinted, setTotalMinted] = useState<number>(0);
  const [mintPrice, setMintPrice] = useState<bigint | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getContract = useCallback((): Contract | null => {
    if (!signer || !contractAddress) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return AffixNFT__factory.connect(
      contractAddress,
      signer,
    ) as any as Contract;
  }, [signer, contractAddress]);

  const getRpcUrl = useCallback((): string => {
    if (typeof window !== 'undefined') {
      const envUrl = process.env.NEXT_PUBLIC_RPC_URL;
      if (envUrl) return envUrl;
    }
    return 'http://127.0.0.1:8545';
  }, []);

  const fetchMintPrice = useCallback(async () => {
    const contract = getContract();
    if (!contract) return;
    try {
      const price = await contract.mintPrice();
      setMintPrice(price);
    } catch {
      // contract may not have mintPrice yet (old deployment)
    }
  }, [getContract]);

  const fetchTotalMinted = useCallback(async () => {
    const contract = getContract();
    if (!contract) return;
    try {
      const count = await contract.totalMinted();
      setTotalMinted(Number(count));
    } catch {
      // silently fail
    }
  }, [getContract]);

  useEffect(() => {
    void fetchTotalMinted();
  }, [fetchTotalMinted]);

  useEffect(() => {
    void fetchMintPrice();
  }, [fetchMintPrice]);

  // Auto-recovery: check the last minted token on mount / when wallet connects
  useEffect(() => {
    if (!contractAddress || !signer) return;
    const lastId = getStoredTokenId();
    if (lastId != null) {
      void checkExistingToken(lastId);
    }
    // Run once when signer+address become available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress, !!signer]);

  const resolveTokenUri = useCallback(
    async (tokenId: number, txHash: string | null, skipAnimation: boolean) => {
      const iface = new Interface([
        'function tokenURI(uint256 tokenId) view returns (string)',
      ]);
      const rpcUrl = getRpcUrl();
      const startTime = Date.now();

      return new Promise<void>((resolve) => {
        pollRef.current = setInterval(async () => {
          try {
            if (!contractAddress) return;
            const data = iface.encodeFunctionData('tokenURI', [tokenId]);
            const res = await fetch(rpcUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{ to: contractAddress, data }, 'latest'],
                id: 1,
              }),
            });
            const json = await res.json();
            if (json.error) return;
            const decoded = iface.decodeFunctionResult('tokenURI', json.result);
            const uri: string = decoded[0];
            if (uri && uri !== '') {
              if (pollRef.current) clearInterval(pollRef.current);
              pollRef.current = null;

              const cid = uri.replace('ipfs://', '');
              const metadataUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

              try {
                const metaRes = await fetch(metadataUrl);
                const metadata: {
                  image?: string;
                  name?: string;
                  attributes?: AffixEntry[];
                } = await metaRes.json();
                const imageCid = metadata.image?.replace('ipfs://', '');
                const imageUrl = imageCid
                  ? `https://gateway.pinata.cloud/ipfs/${imageCid}`
                  : null;
                const affixes = metadata.attributes ?? [];

                const animationPlayed = skipAnimation
                  ? true
                  : wasAnimationPlayed(tokenId);

                setMintState({
                  status: 'revealed',
                  tokenId,
                  txHash,
                  error: null,
                  imageUrl,
                  tokenUri: uri,
                  affixes,
                  animationPlayed,
                });

                if (!animationPlayed) {
                  markTokenRevealed(tokenId);
                }
              } catch {
                setMintState({
                  status: 'revealed',
                  tokenId,
                  txHash,
                  error: null,
                  imageUrl: null,
                  tokenUri: uri,
                  affixes: [],
                  animationPlayed: skipAnimation,
                });
              }
              resolve();
            }

            if (Date.now() - startTime > POLL_TIMEOUT) {
              if (pollRef.current) clearInterval(pollRef.current);
              pollRef.current = null;
              setMintState((prev) => ({
                ...prev,
                status: 'failed',
                error:
                  'Reveal timed out after 2 minutes. Use the retry button below.',
              }));
              resolve();
            }
          } catch {
            // keep polling
          }
        }, POLL_INTERVAL);
      });
    },
    [contractAddress, getRpcUrl],
  );

  const doMint = useCallback(async () => {
    const contract = getContract();
    if (!contract) {
      setMintState((prev) => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    const currentPrice = mintPrice ?? 0n;

    setMintState({
      status: 'pending',
      tokenId: null,
      txHash: null,
      error: null,
      imageUrl: null,
      tokenUri: null,
      affixes: [],
      animationPlayed: false,
    });

    try {
      const tx = await contract.mint({ value: currentPrice });
      setMintState((prev) => ({
        ...prev,
        status: 'confirming',
        txHash: tx.hash,
      }));

      const receipt = await tx.wait();

      let tokenId = totalMinted;
      for (const log of receipt.logs) {
        if (log.topics[0] === MINT_REQUESTED_TOPIC && log.topics[1]) {
          tokenId = parseInt(log.topics[1], 16);
          break;
        }
      }

      storeLastTokenId(tokenId);

      setMintState((prev) => ({
        ...prev,
        status: 'revealing',
        tokenId,
      }));

      try {
        const mintBlock = Number(receipt.blockNumber);
        await fetch(
          `/api/reveal/watch?fromBlock=${mintBlock}&toBlock=${mintBlock}`,
        );
      } catch {
        // watch endpoint may not be running
      }

      void resolveTokenUri(tokenId, receipt.hash, false);
      void fetchTotalMinted();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Mint failed';
      const actionRejected =
        message.includes('ACTION_REJECTED') ||
        message.includes('user rejected');
      setMintState((prev) => ({
        ...prev,
        status: 'failed',
        error: actionRejected ? 'Transaction rejected in MetaMask.' : message,
      }));
    }
  }, [getContract, totalMinted, mintPrice, resolveTokenUri, fetchTotalMinted]);

  const checkExistingToken = useCallback(
    async (tokenId: number) => {
      if (!contractAddress) return;
      const rpcUrl = getRpcUrl();
      const iface = new Interface([
        'function tokenURI(uint256 tokenId) view returns (string)',
      ]);

      try {
        const data = iface.encodeFunctionData('tokenURI', [tokenId]);
        const res = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{ to: contractAddress, data }, 'latest'],
            id: 1,
          }),
        });
        const json = await res.json();
        if (json.error) return;
        const decoded = iface.decodeFunctionResult('tokenURI', json.result);
        const uri: string = decoded[0];

        if (uri && uri !== '') {
          const alreadyPlayed = wasAnimationPlayed(tokenId);

          const cid = uri.replace('ipfs://', '');
          const metadataUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
          let imageUrl: string | null = null;
          let affixes: AffixEntry[] = [];

          try {
            const metaRes = await fetch(metadataUrl);
            const metadata: {
              image?: string;
              attributes?: AffixEntry[];
            } = await metaRes.json();
            const imageCid = metadata.image?.replace('ipfs://', '');
            imageUrl = imageCid
              ? `https://gateway.pinata.cloud/ipfs/${imageCid}`
              : null;
            affixes = metadata.attributes ?? [];
          } catch {
            // metadata not yet available
          }

          setMintState({
            status: 'revealed',
            tokenId,
            txHash: null,
            error: null,
            imageUrl,
            tokenUri: uri,
            affixes,
            animationPlayed: alreadyPlayed,
          });
        }
      } catch {
        // token may not exist
      }
    },
    [contractAddress, getRpcUrl],
  );

  const retryReveal = useCallback(
    async (tokenId: number) => {
      setMintState((prev) => ({
        ...prev,
        status: 'revealing',
        tokenId,
        error: null,
        animationPlayed: false,
      }));

      try {
        await fetch(`/api/reveal/watch`);
      } catch {
        // ignore
      }

      void resolveTokenUri(tokenId, null, false);
    },
    [resolveTokenUri],
  );

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return {
    mint: mintState,
    doMint,
    totalMinted,
    mintPrice,
    mintPriceFormatted: mintPrice != null ? formatEther(mintPrice) : null,
    checkExistingToken,
    retryReveal,
  };
}
