import { Rarity } from '@org/shared-types';
import { rarityFromAffixes } from './rarityFromAffixes.js';
import { useTokenAffixes } from './useTokenAffixes.js';
import { useTokenMetadata } from './useTokenMetadata.js';
import type { GalleryToken } from './types.js';

// Renders the per-token aggregated view (metadata + affixes + derived rarity).
// Consumers map over `useUserTokens().tokens` and render a child component
// per row that calls this hook, since React requires fixed hook order.
export function useGalleryRow(tokenId: bigint): GalleryToken {
  const { tokenURI, metadata } = useTokenMetadata(tokenId);
  const { affixes } = useTokenAffixes(tokenId);
  const isRevealed = Boolean(tokenURI && tokenURI.length > 0);
  return {
    tokenId,
    tokenURI,
    metadata,
    affixes,
    isRevealed,
    highestRarity: isRevealed ? rarityFromAffixes(affixes) : Rarity.Common,
  };
}
