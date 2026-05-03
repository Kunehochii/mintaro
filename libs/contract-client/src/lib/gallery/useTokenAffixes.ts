// TODO(US-2.2): Replace `mockAffixesForToken` with a call to
// `contract.getAffixes(tokenId)` once US-2.2 lands. The hook signature
// (returning `{ affixes: Rarity[]; isLoading: boolean }`) is stable —
// only the body of the effect needs to change.
//
import { useEffect, useState } from 'react';
import { Rarity } from '@org/shared-types';

const TIERS: Rarity[] = [
  Rarity.Common,
  Rarity.Rare,
  Rarity.Splendid,
  Rarity.Divine,
];

function pseudoRandom(seed: bigint, salt: number): number {
  // FNV-ish mix; cheap, deterministic, no crypto needed.
  let h = Number((seed ^ BigInt(salt * 2654435761)) & 0xffffffffn);
  h = (h ^ (h >>> 16)) >>> 0;
  // Additional mixing with salt to increase variance across the rarity range
  h = ((h * 73856093) ^ (salt * 19349663)) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0;
  return h / 0xffffffff;
}

export function mockAffixesForToken(tokenId: bigint): Rarity[] {
  const count = 1 + Math.floor(pseudoRandom(tokenId, 1) * 3); // 1..3
  const out: Rarity[] = [];
  for (let i = 0; i < count; i++) {
    const r = pseudoRandom(tokenId, i + 2);
    let tier: Rarity;
    if (r < 0.7) tier = Rarity.Common;
    else if (r < 0.9) tier = Rarity.Rare;
    else if (r < 0.98) tier = Rarity.Splendid;
    else tier = Rarity.Divine;
    out.push(tier);
  }
  return out;
}

export interface UseTokenAffixesResult {
  affixes: Rarity[];
  isLoading: boolean;
}

export function useTokenAffixes(tokenId: bigint | null): UseTokenAffixesResult {
  const [affixes, setAffixes] = useState<Rarity[]>([]);
  useEffect(() => {
    if (tokenId === null) {
      setAffixes([]);
      return;
    }
    setAffixes(mockAffixesForToken(tokenId));
  }, [tokenId]);
  return { affixes, isLoading: false };
}

// Sanity reference of what TIERS array order should be — kept to detect
// accidental changes in @org/shared-types' Rarity enum.
void TIERS;
