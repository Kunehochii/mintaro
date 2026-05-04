import { useEffect, useState } from 'react';
import { useReadAffixContract } from '../contract/useReadAffixContract.js';

const cache = new Map<string, bigint>();
const inflight = new Map<string, Promise<bigint>>();

function contractCacheKey(address: string): string {
  return address.toLowerCase();
}

export interface UseMintPriceWeiResult {
  mintPriceWei: bigint | null;
  isLoading: boolean;
}

/** Single on-chain `mintPrice()` read per contract address; deduped across hook instances. */
export function useMintPriceWei(): UseMintPriceWeiResult {
  const contract = useReadAffixContract();
  const [mintPriceWei, setMintPriceWei] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!contract) {
      setMintPriceWei(null);
      setIsLoading(false);
      return;
    }

    const addr = contract.target as string;
    const key = contractCacheKey(addr);
    const hit = cache.get(key);
    if (hit !== undefined) {
      setMintPriceWei(hit);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    let p = inflight.get(key);
    if (!p) {
      p = contract.mintPrice().then((w) => {
        cache.set(key, w);
        return w;
      });
      inflight.set(key, p);
    }

    p.then((w) => {
      inflight.delete(key);
      if (!cancelled) {
        setMintPriceWei(w);
        setIsLoading(false);
      }
    }).catch(() => {
      inflight.delete(key);
      if (!cancelled) {
        setMintPriceWei(null);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [contract]);

  return { mintPriceWei, isLoading };
}
