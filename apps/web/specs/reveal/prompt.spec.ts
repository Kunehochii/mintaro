/**
 * @jest-environment node
 */
import { Rarity } from '@org/shared-types';
import {
  buildMintPrompt,
  subjectIndexFromSeed,
} from '../../src/lib/reveal/prompt';

describe('buildMintPrompt', () => {
  it('should include all affixes in the prompt', () => {
    const prompt = buildMintPrompt(
      [Rarity.Divine, Rarity.Splendid, Rarity.Common],
      0,
    );
    expect(prompt).toContain('Divine');
    expect(prompt).toContain('Splendid');
    expect(prompt).toContain('Common');
  });

  it('should include a fantasy subject noun', () => {
    const subjects = [
      'dragon',
      'phoenix',
      'golem',
      'wyvern',
      'kraken',
      'griffin',
      'chimera',
      'leviathan',
      'shapeshifter',
      'celestial beast',
    ];

    for (let i = 0; i < subjects.length; i++) {
      const prompt = buildMintPrompt([Rarity.Common], i);
      expect(prompt).toContain(subjects[i]);
    }
  });

  it('should include 1:1 aspect ratio', () => {
    const prompt = buildMintPrompt([Rarity.Common], 0);
    expect(prompt).toContain('1:1 aspect ratio');
  });

  it('should include divine quality modifiers for divine affixes', () => {
    const prompt = buildMintPrompt([Rarity.Divine], 0);
    expect(prompt).toContain('divine radiance');
    expect(prompt).toContain('glowing runes');
    expect(prompt).toContain('celestial aura');
  });

  it('should include splendid quality modifiers for splendid affixes', () => {
    const prompt = buildMintPrompt([Rarity.Splendid], 0);
    expect(prompt).toContain('ornate details');
    expect(prompt).toContain('shimmering light');
    expect(prompt).toContain('intricate patterns');
  });

  it('should include basic quality modifiers for common/rare only', () => {
    const prompt = buildMintPrompt([Rarity.Common, Rarity.Rare], 0);
    expect(prompt).toContain('clean linework');
    expect(prompt).toContain('solid design');
  });

  it('should be a non-empty string', () => {
    const prompt = buildMintPrompt([], 0);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });
});

describe('subjectIndexFromSeed', () => {
  it('should return a value between 0 and 9', () => {
    for (let seed = 0n; seed < 100n; seed++) {
      const idx = subjectIndexFromSeed(seed);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(10);
    }
  });

  it('should be deterministic', () => {
    expect(subjectIndexFromSeed(42n)).toBe(subjectIndexFromSeed(42n));
  });
});
