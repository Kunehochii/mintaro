import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import type { MetaMaskProvider } from './types.js';
import { SEPOLIA_CHAIN_CONFIG } from '@org/shared-types';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isMetaMaskInstalled: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  connect: () => Promise<void>;
  switchToSepolia: () => Promise<void>;
  error: string | null;
}

function getEthereum(): MetaMaskProvider | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as Record<string, unknown>).ethereum as
    | MetaMaskProvider
    | undefined;
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  const ethereum = getEthereum();
  const isMetaMaskInstalled =
    typeof window !== 'undefined' && Boolean(ethereum?.isMetaMask);
  const isConnected = address !== null && chainId !== null;
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_CONFIG.chainId;

  useEffect(() => {
    if (!ethereum) return;

    const bp = new BrowserProvider(ethereum);
    setProvider(bp);

    const hydrate = async () => {
      try {
        const network = await bp.getNetwork();
        setChainId(Number(network.chainId));

        const accounts = await bp.listAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0].address);
          setSigner(await bp.getSigner());
        }
      } catch {
        // Silently fail — MetaMask may not be authorized yet
      }
    };

    void hydrate();

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        setAddress(null);
        setSigner(null);
      } else {
        setAddress(accounts[0]);
        void bp.getSigner().then(setSigner);
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const newChainId = parseInt(args[0] as string, 16);
      setChainId(newChainId);
      void bp.getSigner().then(setSigner);
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!provider) return;
    setError(null);
    try {
      await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      const s = await provider.getSigner();
      setAddress(s.address);
      setSigner(s);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to connect');
    }
  }, [provider]);

  const switchToSepolia = useCallback(async () => {
    if (!provider) return;
    setError(null);
    try {
      await provider.send('wallet_switchEthereumChain', [
        { chainId: '0xaa36a7' },
      ]);
    } catch (err: unknown) {
      const errObj = err as { code?: number; message?: string };
      if (errObj.code === 4902) {
        try {
          await provider.send('wallet_addEthereumChain', [
            {
              chainId: `0x${SEPOLIA_CHAIN_CONFIG.chainId.toString(16)}`,
              chainName: SEPOLIA_CHAIN_CONFIG.chainName,
              nativeCurrency: SEPOLIA_CHAIN_CONFIG.nativeCurrency,
              rpcUrls: SEPOLIA_CHAIN_CONFIG.rpcUrls,
              blockExplorerUrls: SEPOLIA_CHAIN_CONFIG.blockExplorerUrls,
            },
          ]);
        } catch (addErr: unknown) {
          setError(
            addErr instanceof Error
              ? addErr.message
              : 'Failed to add Sepolia network',
          );
        }
      } else {
        setError(errObj.message ?? 'Failed to switch network');
      }
    }
  }, [provider]);

  return {
    address,
    chainId,
    isConnected,
    isCorrectNetwork,
    isMetaMaskInstalled,
    provider,
    signer,
    connect,
    switchToSepolia,
    error,
  };
}
