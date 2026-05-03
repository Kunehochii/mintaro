import type { Rarity } from '@org/shared-types';

export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export interface UserToken {
  tokenId: bigint;
}

export interface GalleryToken {
  tokenId: bigint;
  tokenURI: string | null;
  metadata: NFTMetadata | null;
  affixes: Rarity[];
  isAffixesLoading: boolean;
  isRevealed: boolean;
  highestRarity: Rarity;
}
