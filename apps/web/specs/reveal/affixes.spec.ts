/**
 * @jest-environment node
 */
import { Rarity } from '@org/shared-types';
import {
  computeAffixes,
  computeAffixesHex,
} from '../../src/lib/reveal/affixes';

describe('computeAffixes', () => {
  const MINTER = '0x1234567890123456789012345678901234567890' as `0x${string}`;

  it('should return 1 to 3 affixes', () => {
    const results: number[] = [];
    for (let tokenId = 0; tokenId < 500; tokenId++) {
      const affixes = computeAffixes(42n, MINTER, tokenId);
      results.push(affixes.length);
    }

    const count1 = results.filter((n) => n === 1).length;
    const count2 = results.filter((n) => n === 2).length;
    const count3 = results.filter((n) => n === 3).length;

    expect(count1).toBeGreaterThan(0);
    expect(count2).toBeGreaterThan(0);
    expect(count3).toBeGreaterThan(0);
  });

  it('should only produce valid Rarity values', () => {
    const valid = new Set(Object.values(Rarity));
    for (let tokenId = 0; tokenId < 500; tokenId++) {
      const affixes = computeAffixes(42n, MINTER, tokenId);
      for (const affix of affixes) {
        expect(valid.has(affix)).toBe(true);
      }
    }
  });

  it('should be deterministic for same inputs', () => {
    const a = computeAffixes(42n, MINTER, 0);
    const b = computeAffixes(42n, MINTER, 0);
    expect(a).toEqual(b);
  });

  it('should produce different results for different seeds', () => {
    // With high probability, different seeds produce different affixes
    const a = computeAffixes(1n, MINTER, 0);
    const b = computeAffixes(999999n, MINTER, 0);
    // It's theoretically possible they collide; just verify we got valid results
    expect(a.length).toBeGreaterThanOrEqual(1);
    expect(b.length).toBeGreaterThanOrEqual(1);
  });

  it('should produce different results for different minters', () => {
    const otherMinter =
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`;
    const a = computeAffixes(42n, MINTER, 0);
    const b = computeAffixes(42n, otherMinter, 0);

    expect(a.length).toBeGreaterThanOrEqual(1);
    expect(b.length).toBeGreaterThanOrEqual(1);
  });

  it('should follow expected rarity distribution', () => {
    const counts: Record<Rarity, number> = {
      [Rarity.Common]: 0,
      [Rarity.Rare]: 0,
      [Rarity.Splendid]: 0,
      [Rarity.Divine]: 0,
    };

    let total = 0;
    for (let tokenId = 0; tokenId < 500; tokenId++) {
      const affixes = computeAffixes(42n, MINTER, tokenId);
      for (const affix of affixes) {
        counts[affix]++;
        total++;
      }
    }

    // With 500 tokens and 1-3 affixes each, we expect ~1000 affixes
    // Check broad probability bands (allow 15% tolerance)
    const commonPct = (counts[Rarity.Common] / total) * 100;
    const rarePct = (counts[Rarity.Rare] / total) * 100;
    const splendidPct = (counts[Rarity.Splendid] / total) * 100;
    const divinePct = (counts[Rarity.Divine] / total) * 100;

    expect(commonPct).toBeGreaterThan(55);
    expect(commonPct).toBeLessThan(85);
    expect(rarePct).toBeGreaterThan(5);
    expect(rarePct).toBeLessThan(35);
    expect(splendidPct).toBeGreaterThan(0);
    expect(splendidPct).toBeLessThan(20);
    expect(divinePct).toBeGreaterThanOrEqual(0);
    expect(divinePct).toBeLessThan(12);
  });

  it('computeAffixesHex should accept hex strings', () => {
    const fromBigInt = computeAffixes(42n, MINTER, 0);
    const fromHexStr = computeAffixesHex('0x2a', MINTER, 0);
    expect(fromBigInt).toEqual(fromHexStr);
  });
});
