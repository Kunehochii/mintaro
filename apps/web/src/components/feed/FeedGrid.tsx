'use client';

import type { FeedEntry } from '@org/contract-client';
import FeedCard from './FeedCard';
import FeedEmptyState from './FeedEmptyState';

interface Props {
  entries: FeedEntry[];
  isLoading: boolean;
  error: string | null;
  hasUnfilteredResults: boolean;
}

export default function FeedGrid({
  entries,
  isLoading,
  error,
  hasUnfilteredResults,
}: Props) {
  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-card border border-red-500/40 bg-red-900/20 p-6 text-center font-mono text-sm text-red-300">
        {error}
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-card border border-vapor-purple/20 bg-vapor-surface/40"
          />
        ))}
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <FeedEmptyState
        reason={hasUnfilteredResults ? 'filtered-out' : 'no-mints'}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {entries.map((e) => (
        <FeedCard key={e.tokenId.toString()} entry={e} />
      ))}
    </div>
  );
}
