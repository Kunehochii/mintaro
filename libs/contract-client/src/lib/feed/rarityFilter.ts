import { Rarity } from '@org/shared-types';
import { rarityFromAffixes } from '../gallery/rarityFromAffixes.js';
import type { FeedEntry, RarityTierFilter } from './types.js';

const RANK: Record<Rarity, number> = {
  [Rarity.Common]: 0,
  [Rarity.Rare]: 1,
  [Rarity.Splendid]: 2,
  [Rarity.Divine]: 3,
};

export function applyRarityFilter(
  entries: readonly FeedEntry[],
  filter: RarityTierFilter,
): FeedEntry[] {
  if (filter === 'All') return [...entries];
  return entries.filter((e) => {
    const top = rarityFromAffixes(e.affixes);
    switch (filter) {
      case 'Common':
        return RANK[top] === RANK[Rarity.Common];
      case 'Rare+':
        return RANK[top] >= RANK[Rarity.Rare];
      case 'Splendid+':
        return RANK[top] >= RANK[Rarity.Splendid];
      case 'Divine':
        return RANK[top] === RANK[Rarity.Divine];
      default:
        return false;
    }
  });
}
