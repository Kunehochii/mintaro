'use client';

import { useUserTokens } from '@org/contract-client';
import { MAX_FUSION_SELECTION } from './selectionContext';
import FuseNFTCard from './FuseNFTCard';
import InsufficientEligibleState from './InsufficientEligibleState';

export default function FuseGrid() {
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
  if (tokens.length < MAX_FUSION_SELECTION) {
    return <InsufficientEligibleState owned={tokens.length} />;
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {tokens.map((t) => (
        <FuseNFTCard key={t.tokenId.toString()} tokenId={t.tokenId} />
      ))}
    </div>
  );
}
