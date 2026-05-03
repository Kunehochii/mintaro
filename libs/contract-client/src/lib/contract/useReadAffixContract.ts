import { useMemo } from 'react';
import { AffixNFT__factory, type AffixNFT } from '@org/shared-types';
import { createReadProvider } from './readProvider.js';

export function useReadAffixContract(): AffixNFT | null {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  return useMemo(() => {
    if (!address) return null;
    const provider = createReadProvider(rpcUrl);
    if (!provider) return null;
    return AffixNFT__factory.connect(address, provider);
  }, [address, rpcUrl]);
}
