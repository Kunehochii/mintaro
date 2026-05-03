import { useEffect, useState } from 'react';
import { useAffixContract } from '../contract/useAffixContract.js';
import { useWallet } from '../wallet/useWallet.js';
import { deploymentBlock } from './constants.js';
import type { UserToken } from './types.js';

export interface TransferEvent {
  from: string;
  to: string;
  tokenId: bigint;
  blockNumber: number;
  logIndex: number;
}

export function reduceOwnedTokens(
  events: readonly TransferEvent[],
  owner: string,
): UserToken[] {
  const ownerLc = owner.toLowerCase();
  // Sort ascending so the last entry per tokenId reflects current state.
  const sorted = [...events].sort(
    (a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex,
  );
  const lastEventByToken = new Map<bigint, TransferEvent>();
  for (const e of sorted) lastEventByToken.set(e.tokenId, e);

  const owned: TransferEvent[] = [];
  for (const e of lastEventByToken.values()) {
    if (e.to.toLowerCase() === ownerLc) owned.push(e);
  }
  // Most recent first.
  owned.sort(
    (a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex,
  );
  return owned.map((e) => ({ tokenId: e.tokenId }));
}

export interface UseUserTokensResult {
  tokens: UserToken[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useUserTokens(): UseUserTokensResult {
  const { address } = useWallet();
  const contract = useAffixContract();
  const [tokens, setTokens] = useState<UserToken[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!address || !contract) {
      setTokens([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const filterTo = contract.filters.Transfer(undefined, address);
        const filterFrom = contract.filters.Transfer(address, undefined);
        const fromBlock = deploymentBlock();
        const [toEvents, fromEvents] = await Promise.all([
          contract.queryFilter(filterTo, fromBlock),
          contract.queryFilter(filterFrom, fromBlock),
        ]);
        const all: TransferEvent[] = [...toEvents, ...fromEvents].map((e) => ({
          from: e.args.from,
          to: e.args.to,
          tokenId: e.args.tokenId,
          blockNumber: e.blockNumber,
          logIndex: e.index,
        }));
        if (cancelled) return;
        setTokens(reduceOwnedTokens(all, address));
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load tokens',
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, contract, tick]);

  return { tokens, isLoading, error, refresh: () => setTick((t) => t + 1) };
}
