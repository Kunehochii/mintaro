import { Rarity } from '@org/shared-types';
import type { NFTMetadata } from './types.js';

/** Cap Affix traits read from token metadata (OpenSea-style `attributes`). */
export const MAX_METADATA_AFFIX_TRAITS = 5;

export interface AffixBadgeItem {
  rarity: Rarity;
  /** Text from metadata `value` or chain tier name. */
  label: string;
}

export function rarityFromTraitValue(raw: string): Rarity {
  const n = raw.trim();
  const lower = n.toLowerCase();
  for (const r of Object.values(Rarity) as Rarity[]) {
    if (r.toLowerCase() === lower) return r;
  }
  return Rarity.Common;
}

/**
 * Prefers IPFS metadata `attributes` with `trait_type === "Affix"` (max five).
 * Falls back to on-chain `getAffixes` tiers when metadata has no Affix rows.
 */
export function affixBadgeItems(
  metadata: NFTMetadata | null | undefined,
  chainAffixes: readonly Rarity[],
): AffixBadgeItem[] {
  const attrs =
    metadata?.attributes?.filter((a) => a.trait_type === 'Affix') ?? [];
  if (attrs.length > 0) {
    return attrs.slice(0, MAX_METADATA_AFFIX_TRAITS).map((a) => {
      const label =
        a.value === undefined || a.value === null ? '' : String(a.value);
      return {
        rarity: rarityFromTraitValue(label),
        label,
      };
    });
  }
  return chainAffixes.map((r) => ({ rarity: r, label: r }));
}
