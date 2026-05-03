import { Rarity } from '@org/shared-types';
import { affixesFromUint8s } from './usePublicFeed.js';

describe('affixesFromUint8s', () => {
  it('maps 0/1/2/3 to Rarity Common/Rare/Splendid/Divine', () => {
    expect(affixesFromUint8s([0n, 1n, 2n, 3n])).toEqual([
      Rarity.Common,
      Rarity.Rare,
      Rarity.Splendid,
      Rarity.Divine,
    ]);
  });

  it('also accepts a number array', () => {
    expect(affixesFromUint8s([0, 3])).toEqual([Rarity.Common, Rarity.Divine]);
  });

  it('throws on out-of-range values (defensive — contract should never emit these)', () => {
    expect(() => affixesFromUint8s([4n])).toThrow(/unknown affix value/i);
  });
});
