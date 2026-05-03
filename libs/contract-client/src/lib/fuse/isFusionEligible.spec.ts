import { Rarity } from '@org/shared-types';
import { isFusionEligible } from './isFusionEligible.js';

describe('isFusionEligible', () => {
  it('returns true for an empty affix list', () => {
    expect(isFusionEligible([])).toBe(true);
  });

  it('returns true when only Common affixes are present', () => {
    expect(isFusionEligible([Rarity.Common, Rarity.Common])).toBe(true);
  });

  it('returns true when only Common and Rare affixes are present', () => {
    expect(isFusionEligible([Rarity.Common, Rarity.Rare])).toBe(true);
  });

  it('returns false when any affix is Splendid', () => {
    expect(isFusionEligible([Rarity.Common, Rarity.Splendid])).toBe(false);
  });

  it('returns false when any affix is Divine', () => {
    expect(isFusionEligible([Rarity.Rare, Rarity.Divine])).toBe(false);
  });
});
