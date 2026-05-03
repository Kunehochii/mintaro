import { keccak256, encodePacked, type Address } from 'viem';
import { Rarity, RARITY_PROBABILITIES, MAX_AFFIXES } from '@org/shared-types';

function rarityFromBucket(bucket: number): Rarity {
  if (bucket < RARITY_PROBABILITIES[Rarity.Common]) return Rarity.Common;
  if (
    bucket <
    RARITY_PROBABILITIES[Rarity.Common] + RARITY_PROBABILITIES[Rarity.Rare]
  )
    return Rarity.Rare;
  if (
    bucket <
    RARITY_PROBABILITIES[Rarity.Common] +
      RARITY_PROBABILITIES[Rarity.Rare] +
      RARITY_PROBABILITIES[Rarity.Splendid]
  )
    return Rarity.Splendid;
  return Rarity.Divine;
}

function hexByteAt(hash: Uint8Array, offset: number): number {
  return hash[offset % hash.length];
}

function hexUint16LEAt(hash: Uint8Array, offset: number): number {
  const i = offset % hash.length;
  const lo = hash[i];
  const hi = hash[(i + 1) % hash.length];
  return ((hi << 8) | lo) % 100;
}

export function computeAffixes(
  seed: bigint,
  minter: Address,
  tokenId: number,
): Rarity[] {
  const hash = keccak256(
    encodePacked(
      ['uint256', 'address', 'uint256'],
      [BigInt(seed), minter, BigInt(tokenId)],
    ),
  );

  const bytes = new Uint8Array(Buffer.from(hash.slice(2), 'hex'));

  const count = (hexByteAt(bytes, 0) % MAX_AFFIXES) + 1;

  const affixes: Rarity[] = [];
  for (let i = 0; i < count; i++) {
    const bucket = hexUint16LEAt(bytes, 2 + i * 2);
    affixes.push(rarityFromBucket(bucket));
  }

  return affixes;
}

export function computeAffixesHex(
  seedHex: string,
  minter: Address,
  tokenId: number,
): Rarity[] {
  const seed = BigInt(seedHex);
  return computeAffixes(seed, minter, tokenId);
}
