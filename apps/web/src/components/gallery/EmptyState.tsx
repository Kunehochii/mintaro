// apps/web/src/components/gallery/EmptyState.tsx
import Link from 'next/link';
import { MINT_PRICE_DISPLAY } from '@org/contract-client';

export default function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-vapor-purple/30 bg-vapor-surface/60 p-10 text-center backdrop-blur-md">
      <h2 className="font-display text-xl uppercase tracking-wider text-vapor-text">
        Your collection is empty
      </h2>
      <p className="font-body text-sm text-vapor-muted">
        Mint your first NFT for {MINT_PRICE_DISPLAY} and start your gacha
        journey.
      </p>
      <Link
        href="/mint"
        className="cursor-pointer rounded-btn bg-vapor-pink px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-vapor-bg transition-all duration-150 hover:shadow-glow-pink"
      >
        Mint your first NFT
      </Link>
    </div>
  );
}
