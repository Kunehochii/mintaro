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
 * Collapse duplicate tiers into one badge ordered by first occurrence, e.g.
 * Common, Common, Rare → Common 2x then Rare.
 */
export function stackAffixBadgeItems(
  items: AffixBadgeItem[],
): AffixBadgeItem[] {
  const order: Rarity[] = [];
  const counts = new Map<Rarity, number>();
  for (const item of items) {
    const next = (counts.get(item.rarity) ?? 0) + 1;
    counts.set(item.rarity, next);
    if (next === 1) order.push(item.rarity);
  }
  return order.map((rarity) => {
    const n = counts.get(rarity)!;
    return {
      rarity,
      label: n > 1 ? `${rarity} ${n}x` : rarity,
    };
  });
}

/**
 * One rarity per affix slot for valuation — matches {@link affixBadgeItems} source rules:
 * metadata `Affix` traits when present, otherwise on-chain tiers. Not stacked (use for `estimateNftValueWei`).
 */
export function affixRaritiesForPricing(
  metadata: NFTMetadata | null | undefined,
  chainAffixes: readonly Rarity[],
): Rarity[] {
  const attrs =
    metadata?.attributes?.filter((a) => a.trait_type === 'Affix') ?? [];
  if (attrs.length > 0) {
    return attrs.slice(0, MAX_METADATA_AFFIX_TRAITS).map((a) => {
      const label =
        a.value === undefined || a.value === null ? '' : String(a.value);
      return rarityFromTraitValue(label);
    });
  }
  return [...chainAffixes];
}

/**
 * Prefers IPFS metadata `attributes` with `trait_type === "Affix"` (max five).
 * Falls back to on-chain `getAffixes` tiers when metadata has no Affix rows.
 * Duplicate tiers are stacked with an `nx` suffix on the label.
 */
export function affixBadgeItems(
  metadata: NFTMetadata | null | undefined,
  chainAffixes: readonly Rarity[],
): AffixBadgeItem[] {
  const attrs =
    metadata?.attributes?.filter((a) => a.trait_type === 'Affix') ?? [];
  let flat: AffixBadgeItem[];
  if (attrs.length > 0) {
    flat = attrs.slice(0, MAX_METADATA_AFFIX_TRAITS).map((a) => {
      const label =
        a.value === undefined || a.value === null ? '' : String(a.value);
      return {
        rarity: rarityFromTraitValue(label),
        label,
      };
    });
  } else {
    flat = chainAffixes.map((r) => ({ rarity: r, label: r }));
  }
  return stackAffixBadgeItems(flat);
}
