import { useMemo } from 'react';
import { AffixNFT__factory, type AffixNFT } from '@org/shared-types';
import { useWallet } from '../wallet/useWallet.js';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function useAffixContract(): AffixNFT | null {
  const { provider, signer } = useWallet();

  return useMemo(() => {
    if (!CONTRACT_ADDRESS || !provider) return null;
    const runner = signer ?? provider;
    return AffixNFT__factory.connect(CONTRACT_ADDRESS, runner);
  }, [provider, signer]);
}
