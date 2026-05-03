'use client';

import { useUserTokens } from '@org/contract-client';
import NFTCard from './NFTCard';
import EmptyState from './EmptyState';

export default function GalleryGrid() {
  const { tokens, isLoading, error } = useUserTokens();

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
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-card border border-vapor-purple/20 bg-vapor-surface/40"
          />
        ))}
      </div>
    );
  }
  if (tokens.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {tokens.map((t) => (
        <NFTCard key={t.tokenId.toString()} tokenId={t.tokenId} />
      ))}
    </div>
  );
}
