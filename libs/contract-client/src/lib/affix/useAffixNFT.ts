import { useState, useCallback, useEffect, useRef } from 'react';
import { Contract, type JsonRpcSigner, Interface } from 'ethers';
import { AffixNFT__factory } from '@org/shared-types';

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
}

const POLL_INTERVAL = 5_000; // 5 seconds
const POLL_TIMEOUT = 120_000; // 2 minutes

const MINT_REQUESTED_TOPIC =
  '0x32f62f6e38f01677299722b6f618d17026edcb8decf51f73dd4c6d8ffcebd74f';

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
  });
  const [totalMinted, setTotalMinted] = useState<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getContract = useCallback((): Contract | null => {
    if (!signer || !contractAddress) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return AffixNFT__factory.connect(
      contractAddress,
      signer,
    ) as any as Contract;
  }, [signer, contractAddress]);

  const fetchTotalMinted = useCallback(async () => {
    const contract = getContract();
    if (!contract) return;
    try {
      const count = await contract.totalMinted();
      setTotalMinted(Number(count));
    } catch {
      // silently fail — contract may not be deployed yet
    }
  }, [getContract]);

  // Fetch total minted on mount and when contract changes
  useEffect(() => {
    void fetchTotalMinted();
  }, [fetchTotalMinted]);

  const doMint = useCallback(async () => {
    const contract = getContract();
    if (!contract) {
      setMintState((prev) => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    setMintState({
      status: 'pending',
      tokenId: null,
      txHash: null,
      error: null,
      imageUrl: null,
      tokenUri: null,
    });

    try {
      const tx = await contract.mint();
      setMintState((prev) => ({
        ...prev,
        status: 'confirming',
        txHash: tx.hash,
      }));

      const receipt = await tx.wait();

      // Find MintRequested event to get tokenId
      // Parse MintRequested event to get the tokenId (keccak256 of MintRequested(uint256,address,uint256))
      // topics: [0]=eventSig, [1]=tokenId, [2]=minter, [3]=seed
      let tokenId = totalMinted;
      for (const log of receipt.logs) {
        if (log.topics[0] === MINT_REQUESTED_TOPIC && log.topics[1]) {
          tokenId = parseInt(log.topics[1], 16);
          break;
        }
      }

      setMintState((prev) => ({
        ...prev,
        status: 'revealing',
        tokenId,
      }));

      // Trigger the relayer watch endpoint BEFORE polling starts, passing the exact
      // mint block so the scanner finds the MintRequested event regardless of
      // stale last-block.json state (fixes: "confirmed but image never loads").
      try {
        const mintBlock = Number(receipt.blockNumber);
        await fetch(
          `/api/reveal/watch?fromBlock=${mintBlock}&toBlock=${mintBlock}`,
        );
      } catch {
        // watch endpoint might not be running locally — user can trigger manually
      }

      // Poll for tokenURI using direct RPC call (bypasses MetaMask which corrupts eth_call)
      const startTime = Date.now();
      const iface = new Interface([
        'function tokenURI(uint256 tokenId) view returns (string)',
      ]);
      const rpcUrl = 'http://127.0.0.1:8545';
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

            // Extract CID and fetch metadata for image URL
            const cid = uri.replace('ipfs://', '');
            const metadataUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
            try {
              const metaRes = await fetch(metadataUrl);
              const metadata: { image?: string } = await metaRes.json();
              const imageCid = metadata.image?.replace('ipfs://', '');
              const imageUrl = imageCid
                ? `https://gateway.pinata.cloud/ipfs/${imageCid}`
                : null;
              setMintState({
                status: 'revealed',
                tokenId,
                txHash: receipt.hash,
                error: null,
                imageUrl,
                tokenUri: uri,
              });
            } catch {
              // Metadata not yet available, but URI is set — still a success
              setMintState({
                status: 'revealed',
                tokenId,
                txHash: receipt.hash,
                error: null,
                imageUrl: null,
                tokenUri: uri,
              });
            }
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
          }
        } catch {
          // Keep polling — relayer may still be processing
        }
      }, POLL_INTERVAL);

      void fetchTotalMinted();
    } catch (e: unknown) {
      setMintState((prev) => ({
        ...prev,
        status: 'failed',
        error: e instanceof Error ? e.message : 'Mint failed',
      }));
    }
  }, [getContract, totalMinted, fetchTotalMinted]);

  // Cleanup poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return { mint: mintState, doMint, totalMinted };
}
