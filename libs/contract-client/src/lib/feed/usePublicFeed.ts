import { useEffect, useMemo, useState } from 'react';
import { Rarity } from '@org/shared-types';
import { useReadAffixContract } from '../contract/useReadAffixContract.js';
import { createReadProvider } from '../contract/readProvider.js';
import { deploymentBlock } from '../gallery/constants.js';
import {
  joinFeedEntries,
  type RawReveal,
  type RawMint,
} from './joinFeedEntries.js';
import type { FeedEntry } from './types.js';

const FEED_CAP = 50;

const RARITY_BY_UINT8: Record<number, Rarity> = {
  0: Rarity.Common,
  1: Rarity.Rare,
  2: Rarity.Splendid,
  3: Rarity.Divine,
};

export function affixesFromUint8s(
  values: readonly (bigint | number)[],
): Rarity[] {
  return values.map((v) => {
    const n = typeof v === 'bigint' ? Number(v) : v;
    const r = RARITY_BY_UINT8[n];
    if (!r) throw new Error(`unknown affix value: ${n}`);
    return r;
  });
}

export interface UsePublicFeedResult {
  entries: FeedEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePublicFeed(): UsePublicFeedResult {
  const contract = useReadAffixContract();
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const provider = useMemo(() => createReadProvider(rpcUrl), [rpcUrl]);
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!contract || !provider) {
      setLoading(false);
      setError(
        'Public RPC is not configured. Set NEXT_PUBLIC_RPC_URL and NEXT_PUBLIC_CONTRACT_ADDRESS.',
      );
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const fromBlock = deploymentBlock();
        const revealedFilter = contract.filters.TokenRevealed();
        const fusedFilter = contract.filters.Fused();
        const [revealedEvents, fusedEvents] = await Promise.all([
          contract.queryFilter(revealedFilter, fromBlock),
          contract.queryFilter(fusedFilter, fromBlock),
        ]);

        // Tokens consumed by fuse() are burned, so subsequent getAffixes/tokenURI
        // reads revert. Drop them before the contract reads below.
        const burned = new Set<bigint>();
        for (const e of fusedEvents) {
          for (const id of e.args.burnedTokenIds) burned.add(id);
        }

        const reveals: RawReveal[] = revealedEvents
          .filter((e) => !burned.has(e.args.tokenId))
          .map((e) => ({
            tokenId: e.args.tokenId,
            uri: e.args.uri,
            blockNumber: e.blockNumber,
            logIndex: e.index,
          }));

        reveals.sort(
          (a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex,
        );
        const top = reveals.slice(0, FEED_CAP);

        if (top.length === 0) {
          if (!cancelled) {
            setEntries([]);
            setLoading(false);
          }
          return;
        }

        const tokenIds = Array.from(new Set(top.map((r) => r.tokenId)));
        const blockNumbers = Array.from(new Set(top.map((r) => r.blockNumber)));

        // ethers v6 supports OR-matching an indexed arg by passing an array,
        // but typechain types each indexed slot as a single value — cast through.
        const mintFilter = contract.filters.MintRequested(
          tokenIds as unknown as bigint,
        );

        const [mintEvents, blocks, affixesPerToken] = await Promise.all([
          contract.queryFilter(mintFilter, fromBlock),
          Promise.all(blockNumbers.map((bn) => provider.getBlock(bn))),
          Promise.all(tokenIds.map((tid) => contract.getAffixes(tid))),
        ]);

        const mints: RawMint[] = mintEvents.map((e) => ({
          tokenId: e.args.tokenId,
          minter: e.args.minter,
        }));

        const timestampsByBlock = new Map<number, number>();
        for (let i = 0; i < blocks.length; i++) {
          const b = blocks[i];
          if (b) timestampsByBlock.set(blockNumbers[i], Number(b.timestamp));
        }

        const affixesByToken = new Map<bigint, Rarity[]>();
        for (let i = 0; i < tokenIds.length; i++) {
          affixesByToken.set(
            tokenIds[i],
            affixesFromUint8s(affixesPerToken[i]),
          );
        }

        if (cancelled) return;
        setEntries(
          joinFeedEntries(
            top,
            mints,
            timestampsByBlock,
            affixesByToken,
            FEED_CAP,
          ),
        );
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [contract, provider, tick]);

  return { entries, isLoading, error, refresh: () => setTick((t) => t + 1) };
}
