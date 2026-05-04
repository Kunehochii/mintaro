import { formatEther } from 'ethers';
import { Rarity } from '@org/shared-types';

/** Fixed-point multipliers per affix slot (basis points; 10_000 = 1× mint). Wider steps so estimates read clearly by tier. */
export const AFFIX_VALUE_MULTIPLIER_BPS: Readonly<Record<Rarity, bigint>> = {
  [Rarity.Common]: 10_000n,
  [Rarity.Rare]: 25_000n, // 2.5×
  [Rarity.Splendid]: 60_000n, // 6×
  [Rarity.Divine]: 150_000n, // 15×
};

const BPS_BASE = 10_000n;

/**
 * Heuristic “display value”: on-chain mint price multiplied across each affix tier.
 * Not a market or secondary price — UI-only.
 */
export function estimateNftValueWei(
  baseMintWei: bigint,
  affixes: readonly Rarity[],
): bigint {
  if (baseMintWei <= 0n) return 0n;
  const tiers = affixes.length === 0 ? [Rarity.Common] : affixes;
  let acc = baseMintWei;
  for (const a of tiers) {
    const bps =
      AFFIX_VALUE_MULTIPLIER_BPS[a] ??
      AFFIX_VALUE_MULTIPLIER_BPS[Rarity.Common];
    acc = (acc * bps) / BPS_BASE;
  }
  return acc;
}

/** Trimmed ETH string for UI (no scientific notation). */
export function formatEstimateEth(wei: bigint): string {
  const raw = formatEther(wei);
  if (!raw.includes('.')) return raw;
  const [i, f = ''] = raw.split('.');
  const fTrim = f.replace(/0+$/, '');
  return fTrim ? `${i}.${fTrim}` : i;
}
