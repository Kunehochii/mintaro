import type { Rarity } from '@org/shared-types';

export interface FeedEntry {
  tokenId: bigint;
  tokenURI: string;
  minter: string;
  timestampSec: number;
  blockNumber: number;
  logIndex: number;
  affixes: Rarity[];
}

export type RarityTierFilter =
  | 'All'
  | 'Common'
  | 'Rare+'
  | 'Splendid+'
  | 'Divine';

export const RARITY_TIER_FILTERS: readonly RarityTierFilter[] = [
  'All',
  'Common',
  'Rare+',
  'Splendid+',
  'Divine',
] as const;
