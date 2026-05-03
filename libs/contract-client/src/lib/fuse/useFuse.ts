import { useCallback, useState } from 'react';
import { useAffixContract } from '../contract/useAffixContract.js';
import { parseFusedEvent } from './parseFusedEvent.js';

export type FuseStatus =
  | { kind: 'idle' }
  | { kind: 'awaiting-signature' }
  | { kind: 'mining'; txHash: string }
  | { kind: 'success'; txHash: string; newTokenId: bigint }
  | { kind: 'error'; message: string };

export interface UseFuseResult {
  status: FuseStatus;
  fuse: (tokenIds: readonly bigint[]) => Promise<void>;
  reset: () => void;
}

interface MaybeError {
  code?: string;
  reason?: string;
  message?: string;
}

export function mapFuseError(err: unknown): string {
  const e = err as MaybeError;
  if (e?.code === 'ACTION_REJECTED') return 'Transaction rejected.';
  if (e?.reason) return e.reason;
  if (e?.message) return e.message;
  return 'Failed to fuse.';
}

export function useFuse(): UseFuseResult {
  const contract = useAffixContract();
  const [status, setStatus] = useState<FuseStatus>({ kind: 'idle' });

  const fuse = useCallback(
    async (tokenIds: readonly bigint[]) => {
      if (!contract) {
        setStatus({ kind: 'error', message: 'Wallet not connected.' });
        return;
      }
      if (tokenIds.length !== 5) {
        setStatus({
          kind: 'error',
          message: 'Fusion requires exactly 5 tokens.',
        });
        return;
      }
      try {
        setStatus({ kind: 'awaiting-signature' });
        const tx = await contract.fuse([...tokenIds]);
        setStatus({ kind: 'mining', txHash: tx.hash });
        const receipt = await tx.wait();
        if (!receipt) {
          setStatus({
            kind: 'error',
            message: 'Transaction dropped before confirmation.',
          });
          return;
        }
        const newTokenId = parseFusedEvent(
          receipt,
          await contract.getAddress(),
        );
        if (newTokenId === null) {
          setStatus({
            kind: 'error',
            message: 'Fusion confirmed but new token id could not be read.',
          });
          return;
        }
        setStatus({ kind: 'success', txHash: tx.hash, newTokenId });
      } catch (err) {
        setStatus({ kind: 'error', message: mapFuseError(err) });
      }
    },
    [contract],
  );

  const reset = useCallback(() => setStatus({ kind: 'idle' }), []);

  return { status, fuse, reset };
}
