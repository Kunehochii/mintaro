import type { Rarity } from '@org/shared-types';
import type { FeedEntry } from './types.js';

export interface RawReveal {
  tokenId: bigint;
  uri: string;
  blockNumber: number;
  logIndex: number;
}

export interface RawMint {
  tokenId: bigint;
  minter: string;
}

export function joinFeedEntries(
  reveals: readonly RawReveal[],
  mints: readonly RawMint[],
  timestampsByBlock: ReadonlyMap<number, number>,
  affixesByToken: ReadonlyMap<bigint, Rarity[]>,
  cap: number,
): FeedEntry[] {
  const minterByToken = new Map<bigint, string>();
  for (const m of mints) minterByToken.set(m.tokenId, m.minter);

  const out: FeedEntry[] = [];
  for (const r of reveals) {
    const minter = minterByToken.get(r.tokenId);
    const timestampSec = timestampsByBlock.get(r.blockNumber);
    const affixes = affixesByToken.get(r.tokenId);
    if (!minter || timestampSec === undefined || !affixes) continue;
    out.push({
      tokenId: r.tokenId,
      tokenURI: r.uri,
      minter,
      timestampSec,
      blockNumber: r.blockNumber,
      logIndex: r.logIndex,
      affixes,
    });
  }

  out.sort((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex);
  return out.slice(0, cap);
}
