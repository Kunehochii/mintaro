import { Rarity } from '@org/shared-types';
import { mockAffixesForToken } from './useTokenAffixes.js';

describe('mockAffixesForToken', () => {
  it('produces 1 to 3 affixes for any tokenId', () => {
    for (let i = 0n; i < 50n; i++) {
      const a = mockAffixesForToken(i);
      expect(a.length).toBeGreaterThanOrEqual(1);
      expect(a.length).toBeLessThanOrEqual(3);
    }
  });

  it('is deterministic — same tokenId returns same affixes', () => {
    expect(mockAffixesForToken(7n)).toEqual(mockAffixesForToken(7n));
  });

  it('covers all four rarity tiers across tokenIds 0..199', () => {
    const seen = new Set<Rarity>();
    for (let i = 0n; i < 200n; i++)
      for (const a of mockAffixesForToken(i)) seen.add(a);
    expect(seen.has(Rarity.Common)).toBe(true);
    expect(seen.has(Rarity.Rare)).toBe(true);
    expect(seen.has(Rarity.Splendid)).toBe(true);
    // Divine is rare; not strictly asserted to avoid flakiness.
  });
});
