import Link from 'next/link';
import { MAX_FUSION_SELECTION } from './selectionContext';

export default function InsufficientEligibleState({
  owned,
}: {
  owned: number;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-vapor-purple/30 bg-vapor-surface/60 p-10 text-center backdrop-blur-md">
      <h2 className="font-display text-xl uppercase tracking-wider text-vapor-text">
        Need more NFTs to fuse
      </h2>
      <p className="font-body text-sm text-vapor-muted">
        Fusion burns {MAX_FUSION_SELECTION} NFTs at once. Your wallet currently
        holds {owned}. Mint more to start fusing.
      </p>
      <Link
        href="/mint"
        className="cursor-pointer rounded-btn bg-vapor-pink px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-vapor-bg transition-all duration-150 hover:shadow-glow-pink"
      >
        Mint more
      </Link>
    </div>
  );
}
