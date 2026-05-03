import { Rarity } from '@org/shared-types';

const RANK: Record<Rarity, number> = {
  [Rarity.Common]: 0,
  [Rarity.Rare]: 1,
  [Rarity.Splendid]: 2,
  [Rarity.Divine]: 3,
};

export function rarityFromAffixes(affixes: readonly Rarity[]): Rarity {
  if (affixes.length === 0) return Rarity.Common;
  return affixes.reduce(
    (best, a) => (RANK[a] > RANK[best] ? a : best),
    Rarity.Common,
  );
}
