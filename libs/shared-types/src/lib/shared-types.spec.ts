import { Rarity, RARITY_PROBABILITIES } from './shared-types.js';

describe('Rarity', () => {
  it('should have all four rarity tiers', () => {
    expect(Rarity.Common).toBe('Common');
    expect(Rarity.Rare).toBe('Rare');
    expect(Rarity.Splendid).toBe('Splendid');
    expect(Rarity.Divine).toBe('Divine');
  });
});

describe('RARITY_PROBABILITIES', () => {
  it('should sum to 100%', () => {
    const total = Object.values(RARITY_PROBABILITIES).reduce(
      (sum, p) => sum + p,
      0,
    );
    expect(total).toBe(100);
  });

  it('should have a probability defined for every rarity tier', () => {
    for (const rarity of Object.values(Rarity)) {
      expect(RARITY_PROBABILITIES[rarity]).toBeDefined();
    }
  });

  it('should have valid probabilities between 0 and 100', () => {
    for (const probability of Object.values(RARITY_PROBABILITIES)) {
      expect(probability).toBeGreaterThan(0);
      expect(probability).toBeLessThanOrEqual(100);
    }
  });
});
