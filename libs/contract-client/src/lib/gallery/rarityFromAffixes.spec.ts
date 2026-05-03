import { Rarity } from '@org/shared-types';
import { rarityFromAffixes } from './rarityFromAffixes.js';

describe('rarityFromAffixes', () => {
  it('returns Common when input is empty', () => {
    expect(rarityFromAffixes([])).toBe(Rarity.Common);
  });

  it('returns the single affix when only one is present', () => {
    expect(rarityFromAffixes([Rarity.Rare])).toBe(Rarity.Rare);
  });

  it('returns the highest-tier affix when multiple are present', () => {
    expect(rarityFromAffixes([Rarity.Common, Rarity.Divine, Rarity.Rare])).toBe(
      Rarity.Divine,
    );
  });

  it('orders Splendid above Rare and below Divine', () => {
    expect(rarityFromAffixes([Rarity.Rare, Rarity.Splendid])).toBe(
      Rarity.Splendid,
    );
    expect(rarityFromAffixes([Rarity.Splendid, Rarity.Divine])).toBe(
      Rarity.Divine,
    );
  });
});
