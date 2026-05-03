'use client';

import Link from 'next/link';
import { Rarity } from '@org/shared-types';
import {
  useGalleryRow,
  ipfsGateway,
  resolveIpfsUri,
} from '@org/contract-client';
import AffixBadge from './AffixBadge';

const RARITY_BORDER: Record<Rarity, string> = {
  [Rarity.Common]: 'border-vapor-muted/30',
  [Rarity.Rare]: 'border-vapor-mint/50 shadow-glow-mint',
  [Rarity.Splendid]: 'border-vapor-purple/50 shadow-glow-purple',
  [Rarity.Divine]: 'border-vapor-gold/60 shadow-glow-gold',
};

const RARITY_LABEL: Record<Rarity, string> = {
  [Rarity.Common]: 'text-vapor-muted',
  [Rarity.Rare]: 'text-vapor-mint',
  [Rarity.Splendid]: 'text-vapor-purple',
  [Rarity.Divine]: 'text-vapor-gold',
};

export default function TokenDetail({ tokenId }: { tokenId: bigint }) {
  const { metadata, affixes, isRevealed, highestRarity } =
    useGalleryRow(tokenId);
  const imageUrl = isRevealed
    ? resolveIpfsUri(metadata?.image, ipfsGateway())
    : null;
  const borderClass = isRevealed
    ? RARITY_BORDER[highestRarity]
    : 'border-vapor-purple/40';

  return (
    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
      <div
        className={`aspect-square overflow-hidden rounded-card border bg-vapor-surface/60 backdrop-blur-md ${borderClass}`}
      >
        {isRevealed && imageUrl ? (
          <img
            src={imageUrl}
            alt={metadata?.name ?? `Token #${tokenId}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="relative flex h-full items-center justify-center bg-gradient-to-br from-vapor-purple/25 via-vapor-pink/10 to-vapor-cyan/25">
            <div
              aria-hidden
              className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_30%,rgba(255,113,206,0.25)_50%,transparent_70%)] bg-[length:200%_100%]"
            />
            <span className="relative animate-glitch font-display text-sm uppercase tracking-[0.2em] text-vapor-cyan glow-text-cyan">
              Revealing&hellip;
            </span>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <Link
          href="/gallery"
          className="cursor-pointer font-mono text-xs text-vapor-muted transition-colors hover:text-vapor-cyan focus-visible:text-vapor-cyan focus-visible:outline-none"
        >
          &larr; Back to gallery
        </Link>
        <h1 className="font-display text-2xl uppercase tracking-wider text-vapor-text sm:text-3xl">
          {metadata?.name ?? `Token #${tokenId.toString()}`}
        </h1>
        <p className="font-mono text-xs text-vapor-muted">
          Token ID: {tokenId.toString()}
        </p>
        {isRevealed && (
          <p
            className={`font-display text-xs uppercase tracking-wider ${RARITY_LABEL[highestRarity]}`}
          >
            Highest tier: {highestRarity}
          </p>
        )}
        {metadata?.description && (
          <p className="font-body text-sm leading-relaxed text-vapor-text/90">
            {metadata.description}
          </p>
        )}
        {affixes.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-display text-xs uppercase tracking-wider text-vapor-muted">
              Affixes
            </h2>
            <div className="flex flex-wrap gap-2">
              {affixes.map((a, i) => (
                <AffixBadge key={i} rarity={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
