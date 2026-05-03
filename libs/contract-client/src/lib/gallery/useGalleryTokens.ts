import { useMemo } from 'react';
import { Rarity } from '@org/shared-types';
import { rarityFromAffixes } from './rarityFromAffixes.js';
import { useTokenAffixes } from './useTokenAffixes.js';
import { useTokenMetadata } from './useTokenMetadata.js';
import { useUserTokens, type UseUserTokensResult } from './useUserTokens.js';
import type { GalleryToken } from './types.js';

export interface UseGalleryTokensResult extends UseUserTokensResult {
  galleryTokens: GalleryToken[];
}

// Renders one token entry. Used by the parent hook so each tokenId gets its own
// metadata/affixes hooks (React's rules require fixed hook order, so we render
// a child component per row; see `useGalleryTokens` below for the pattern).
function useGalleryRow(tokenId: bigint): GalleryToken {
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

export function useGalleryTokens(): UseGalleryTokensResult {
  const base = useUserTokens();
  // We can't call hooks in a loop with a variable count, so the consumer
  // (GalleryGrid) maps over `tokens` and renders a per-row component that
  // calls `useGalleryRow` internally. This composition hook just returns
  // the base plus an empty `galleryTokens` placeholder so the type stays
  // consistent. Components should use `<NFTCardConnected tokenId={...} />`
  // instead of pre-aggregating.
  return useMemo(() => ({ ...base, galleryTokens: [] }), [base]);
}

export { useGalleryRow };
