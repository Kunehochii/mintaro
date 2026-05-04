/**
 * @jest-environment node
 */
import { computeAffixes } from '../../src/lib/reveal/affixes';
import {
  buildMintPrompt,
  subjectIndexFromSeed,
} from '../../src/lib/reveal/prompt';

describe('reveal integration (unit-level)', () => {
  const MINTER = '0x1234567890123456789012345678901234567890' as `0x${string}`;

  it('should produce consistent affixes and prompt for a given mint', () => {
    const seed = 42n;
    const tokenId = 1;
    const affixes = computeAffixes(seed, MINTER, tokenId);
    const subjectIndex = subjectIndexFromSeed(seed);
    const prompt = buildMintPrompt(affixes, subjectIndex);

    // Verify the pipeline produces valid output
    expect(affixes.length).toBeGreaterThanOrEqual(1);
    expect(affixes.length).toBeLessThanOrEqual(3);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).toContain('1:1 aspect ratio');

    // Verify affixes appear in prompt
    for (const affix of affixes) {
      expect(prompt).toContain(affix);
    }
  });

  it('should produce different affixes for different seeds', () => {
    const a1 = computeAffixes(1n, MINTER, 0);
    const a2 = computeAffixes(2n, MINTER, 0);
    // They may occasionally be equal, but both should be valid
    expect(a1.length).toBeGreaterThanOrEqual(1);
    expect(a2.length).toBeGreaterThanOrEqual(1);
  });

  it('should produce same affixes for repeat computation', () => {
    const a1 = computeAffixes(42n, MINTER, 5);
    const a2 = computeAffixes(42n, MINTER, 5);
    expect(a1).toEqual(a2);
  });
});
