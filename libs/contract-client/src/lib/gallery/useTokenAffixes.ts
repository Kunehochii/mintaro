import { useEffect, useState } from 'react';
import { Rarity } from '@org/shared-types';
import { useAffixContract } from '../contract/useAffixContract.js';

const TIER_BY_INDEX: readonly Rarity[] = [
  Rarity.Common,
  Rarity.Rare,
  Rarity.Splendid,
  Rarity.Divine,
];

export function rarityFromUint8(raw: number | bigint): Rarity {
  const n = typeof raw === 'bigint' ? Number(raw) : raw;
  return TIER_BY_INDEX[n] ?? Rarity.Common;
}

export interface UseTokenAffixesResult {
  affixes: Rarity[];
  isLoading: boolean;
}

export function useTokenAffixes(tokenId: bigint | null): UseTokenAffixesResult {
  const contract = useAffixContract();
  const [affixes, setAffixes] = useState<Rarity[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!contract || tokenId === null) {
      setAffixes([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const raw = await contract.getAffixes(tokenId);
        if (cancelled) return;
        setAffixes(raw.map((n) => rarityFromUint8(n)));
      } catch (err) {
        if (!cancelled) {
          console.warn(`useTokenAffixes: getAffixes(${tokenId}) failed`, err);
          setAffixes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contract, tokenId]);

  return { affixes, isLoading };
}
