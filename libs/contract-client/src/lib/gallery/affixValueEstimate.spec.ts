import { Rarity } from '@org/shared-types';
import {
  estimateNftValueWei,
  formatEstimateEth,
} from './affixValueEstimate.js';

describe('estimateNftValueWei', () => {
  const base = 10n ** 16n; // 0.01 ether

  it('returns 0 when base is 0', () => {
    expect(estimateNftValueWei(0n, [Rarity.Divine])).toBe(0n);
  });

  it('treats empty affixes as a single Common slot', () => {
    expect(estimateNftValueWei(base, [])).toBe(base);
  });

  it('multiplies tiers in order (BPS)', () => {
    expect(estimateNftValueWei(base, [Rarity.Common, Rarity.Rare])).toBe(
      (base * 25_000n) / 10_000n,
    );
  });
});

describe('formatEstimateEth', () => {
  it('trims trailing zeros after decimal', () => {
    expect(formatEstimateEth(10n ** 16n)).toMatch(/^0\.01$/);
  });
});
