import { Rarity } from '@org/shared-types';
import { rarityFromUint8 } from './useTokenAffixes.js';

describe('rarityFromUint8', () => {
  it('maps 0 → Common', () => {
    expect(rarityFromUint8(0)).toBe(Rarity.Common);
  });
  it('maps 1 → Rare', () => {
    expect(rarityFromUint8(1)).toBe(Rarity.Rare);
  });
  it('maps 2 → Splendid', () => {
    expect(rarityFromUint8(2)).toBe(Rarity.Splendid);
  });
  it('maps 3 → Divine', () => {
    expect(rarityFromUint8(3)).toBe(Rarity.Divine);
  });
  it('falls back to Common for unknown values', () => {
    expect(rarityFromUint8(7)).toBe(Rarity.Common);
  });
  it('accepts bigint inputs', () => {
    expect(rarityFromUint8(2n)).toBe(Rarity.Splendid);
  });
});
