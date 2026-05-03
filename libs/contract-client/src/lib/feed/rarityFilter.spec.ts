import { Rarity } from '@org/shared-types';
import { applyRarityFilter } from './rarityFilter.js';
import type { FeedEntry } from './types.js';

const E = (tokenId: bigint, affixes: Rarity[]): FeedEntry => ({
  tokenId,
  tokenURI: 'ipfs://x',
  minter: '0xabc',
  timestampSec: 0,
  blockNumber: 0,
  logIndex: 0,
  affixes,
});

const COMMON = E(1n, [Rarity.Common]);
const RARE = E(2n, [Rarity.Common, Rarity.Rare]);
const SPLENDID = E(3n, [Rarity.Splendid]);
const DIVINE = E(4n, [Rarity.Common, Rarity.Divine]);
const ALL = [COMMON, RARE, SPLENDID, DIVINE];

describe('applyRarityFilter', () => {
  it('"All" returns the input unchanged', () => {
    expect(applyRarityFilter(ALL, 'All')).toEqual(ALL);
  });

  it('"Common" returns entries whose top tier is Common', () => {
    expect(applyRarityFilter(ALL, 'Common')).toEqual([COMMON]);
  });

  it('"Rare+" returns Rare, Splendid, and Divine entries', () => {
    expect(applyRarityFilter(ALL, 'Rare+')).toEqual([RARE, SPLENDID, DIVINE]);
  });

  it('"Splendid+" returns Splendid and Divine entries', () => {
    expect(applyRarityFilter(ALL, 'Splendid+')).toEqual([SPLENDID, DIVINE]);
  });

  it('"Divine" returns only Divine entries', () => {
    expect(applyRarityFilter(ALL, 'Divine')).toEqual([DIVINE]);
  });

  it('treats an entry with no affixes as Common', () => {
    const empty = E(5n, []);
    expect(applyRarityFilter([empty], 'Common')).toEqual([empty]);
    expect(applyRarityFilter([empty], 'Rare+')).toEqual([]);
  });
});
