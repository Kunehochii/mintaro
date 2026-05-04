import { Rarity } from '@org/shared-types';
import {
  affixBadgeItems,
  MAX_METADATA_AFFIX_TRAITS,
  rarityFromTraitValue,
} from './affixBadgeItems.js';

describe('rarityFromTraitValue', () => {
  it('parses standard tier strings', () => {
    expect(rarityFromTraitValue('Common')).toBe(Rarity.Common);
    expect(rarityFromTraitValue('rare')).toBe(Rarity.Rare);
    expect(rarityFromTraitValue(' SPLENDID ')).toBe(Rarity.Splendid);
    expect(rarityFromTraitValue('divine')).toBe(Rarity.Divine);
  });

  it('defaults to Common for unknown values', () => {
    expect(rarityFromTraitValue('')).toBe(Rarity.Common);
    expect(rarityFromTraitValue('Mythic')).toBe(Rarity.Common);
  });
});

describe('affixBadgeItems', () => {
  it('uses metadata Affix traits in order (standard JSON shape)', () => {
    const metadata = {
      name: 'Affix #5',
      description:
        'An AI-generated NFT with 3 rarity affixes: Common, Common, Rare.',
      image: 'ipfs://Qmcxfn672y5dkfS8Cv7j3scohoQiZyh5477GPMpmcszBbo',
      attributes: [
        { trait_type: 'Affix', value: 'Common' },
        { trait_type: 'Affix', value: 'Common' },
        { trait_type: 'Affix', value: 'Rare' },
      ],
    };
    const items = affixBadgeItems(metadata, [Rarity.Divine]);
    expect(items).toEqual([
      { rarity: Rarity.Common, label: 'Common' },
      { rarity: Rarity.Common, label: 'Common' },
      { rarity: Rarity.Rare, label: 'Rare' },
    ]);
  });

  it('ignores non-Affix attributes', () => {
    const metadata = {
      attributes: [
        { trait_type: 'Background', value: 'Void' },
        { trait_type: 'Affix', value: 'Rare' },
      ],
    };
    expect(affixBadgeItems(metadata, [Rarity.Common])).toEqual([
      { rarity: Rarity.Rare, label: 'Rare' },
    ]);
  });

  it('takes at most MAX_METADATA_AFFIX_TRAITS Affix rows', () => {
    const attributes = Array.from({ length: 8 }, (_, i) => ({
      trait_type: 'Affix' as const,
      value: i % 2 === 0 ? 'Common' : 'Rare',
    }));
    const items = affixBadgeItems({ attributes }, []);
    expect(items.length).toBe(MAX_METADATA_AFFIX_TRAITS);
  });

  it('falls back to chain affixes when metadata has no Affix traits', () => {
    expect(
      affixBadgeItems({ attributes: [{ trait_type: 'X', value: 'Y' }] }, [
        Rarity.Common,
        Rarity.Rare,
      ]),
    ).toEqual([
      { rarity: Rarity.Common, label: 'Common' },
      { rarity: Rarity.Rare, label: 'Rare' },
    ]);
    expect(affixBadgeItems(null, [Rarity.Divine])).toEqual([
      { rarity: Rarity.Divine, label: 'Divine' },
    ]);
  });
});
