import { Rarity } from '@org/shared-types';
import {
  joinFeedEntries,
  type RawReveal,
  type RawMint,
} from './joinFeedEntries.js';

const R = (
  tokenId: bigint,
  uri: string,
  blockNumber: number,
  logIndex: number,
): RawReveal => ({
  tokenId,
  uri,
  blockNumber,
  logIndex,
});
const M = (tokenId: bigint, minter: string): RawMint => ({ tokenId, minter });

describe('joinFeedEntries', () => {
  it('joins reveals with mints and timestamps and affixes', () => {
    const reveals = [R(1n, 'ipfs://a', 10, 0)];
    const mints = [M(1n, '0xMINTER')];
    const timestamps = new Map<number, number>([[10, 1700000000]]);
    const affixesByToken = new Map<bigint, Rarity[]>([[1n, [Rarity.Rare]]]);

    expect(
      joinFeedEntries(reveals, mints, timestamps, affixesByToken, 50),
    ).toEqual([
      {
        tokenId: 1n,
        tokenURI: 'ipfs://a',
        minter: '0xMINTER',
        timestampSec: 1700000000,
        blockNumber: 10,
        logIndex: 0,
        affixes: [Rarity.Rare],
      },
    ]);
  });

  it('sorts descending by blockNumber then logIndex', () => {
    const reveals = [
      R(1n, 'ipfs://a', 10, 0),
      R(2n, 'ipfs://b', 12, 1),
      R(3n, 'ipfs://c', 12, 0),
    ];
    const mints = [M(1n, '0x1'), M(2n, '0x2'), M(3n, '0x3')];
    const timestamps = new Map([
      [10, 100],
      [12, 200],
    ]);
    const affixes = new Map<bigint, Rarity[]>([
      [1n, []],
      [2n, []],
      [3n, []],
    ]);

    const out = joinFeedEntries(reveals, mints, timestamps, affixes, 50);
    expect(out.map((e) => e.tokenId)).toEqual([2n, 3n, 1n]);
  });

  it('caps the output to the limit', () => {
    const reveals: RawReveal[] = [];
    const mints: RawMint[] = [];
    const affixes = new Map<bigint, Rarity[]>();
    for (let i = 0; i < 100; i++) {
      reveals.push(R(BigInt(i), `ipfs://${i}`, i, 0));
      mints.push(M(BigInt(i), '0xabc'));
      affixes.set(BigInt(i), []);
    }
    const timestamps = new Map<number, number>(
      reveals.map((r) => [r.blockNumber, r.blockNumber]),
    );

    const out = joinFeedEntries(reveals, mints, timestamps, affixes, 50);
    expect(out).toHaveLength(50);
    expect(out[0].tokenId).toBe(99n);
  });

  it('drops reveals with no matching mint', () => {
    const reveals = [R(1n, 'ipfs://a', 10, 0)];
    const mints: RawMint[] = [];
    const timestamps = new Map([[10, 100]]);
    const affixes = new Map<bigint, Rarity[]>([[1n, []]]);
    expect(joinFeedEntries(reveals, mints, timestamps, affixes, 50)).toEqual(
      [],
    );
  });

  it('drops reveals with missing timestamp or affix data', () => {
    const reveals = [R(1n, 'ipfs://a', 10, 0), R(2n, 'ipfs://b', 11, 0)];
    const mints = [M(1n, '0x1'), M(2n, '0x2')];
    const timestamps = new Map([[10, 100]]);
    const affixes = new Map<bigint, Rarity[]>([[1n, []]]);
    const out = joinFeedEntries(reveals, mints, timestamps, affixes, 50);
    expect(out.map((e) => e.tokenId)).toEqual([1n]);
  });
});
