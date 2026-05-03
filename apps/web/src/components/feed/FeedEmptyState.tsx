import Link from 'next/link';

interface Props {
  reason: 'no-mints' | 'filtered-out';
}

export default function FeedEmptyState({ reason }: Props) {
  if (reason === 'filtered-out') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-card border border-vapor-purple/30 bg-vapor-surface/60 p-8 text-center backdrop-blur-md">
        <h2 className="font-display text-lg uppercase tracking-wider text-vapor-text">
          No mints match this filter
        </h2>
        <p className="font-body text-sm text-vapor-muted">
          Try a broader rarity tier.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-vapor-purple/30 bg-vapor-surface/60 p-10 text-center backdrop-blur-md">
      <h2 className="font-display text-xl uppercase tracking-wider text-vapor-text">
        No mints yet
      </h2>
      <p className="font-body text-sm text-vapor-muted">
        Be the first to summon an AffixNFT.
      </p>
      <Link
        href="/mint"
        className="cursor-pointer rounded-btn bg-vapor-pink px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-vapor-bg transition-all duration-150 hover:shadow-glow-pink"
      >
        Mint the first NFT
      </Link>
    </div>
  );
}
