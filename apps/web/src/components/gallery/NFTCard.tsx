'use client';

import Link from 'next/link';
import { Rarity } from '@org/shared-types';
import {
  useGalleryRow,
  ipfsGateway,
  resolveIpfsUri,
} from '@org/contract-client';
import AffixBadge from './AffixBadge.js';

const RARITY_GLOW: Record<Rarity, string> = {
  [Rarity.Common]: 'border-vapor-muted/30',
  [Rarity.Rare]: 'border-vapor-mint/50 shadow-glow-mint',
  [Rarity.Splendid]: 'border-vapor-purple/50 shadow-glow-purple',
  [Rarity.Divine]: 'border-vapor-gold/60 shadow-glow-gold',
};

export default function NFTCard({ tokenId }: { tokenId: bigint }) {
  const { metadata, affixes, isRevealed, highestRarity } =
    useGalleryRow(tokenId);
  const imageUrl = isRevealed
    ? resolveIpfsUri(metadata?.image, ipfsGateway())
    : null;
  const tokenIdLabel = `#${tokenId.toString().padStart(4, '0')}`;

  return (
    <Link
      href={`/gallery/${tokenId.toString()}`}
      className={`group block overflow-hidden rounded-card border bg-vapor-surface/80 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 ${RARITY_GLOW[highestRarity]}`}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {isRevealed && imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- IPFS gateway, not a Next-known origin
          <img
            src={imageUrl}
            alt={metadata?.name ?? `Token ${tokenIdLabel}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-vapor-purple/20 via-vapor-pink/10 to-vapor-cyan/20">
            <div
              className="size-full animate-glitch bg-[linear-gradient(110deg,transparent_30%,rgba(255,113,206,0.25)_50%,transparent_70%)] bg-[length:200%_100%] animate-shimmer"
              aria-hidden
            />
            <span className="absolute font-display text-xs uppercase tracking-[0.2em] text-vapor-cyan">
              Revealing&hellip;
            </span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-vapor-muted">
            {tokenIdLabel}
          </span>
          {isRevealed && (
            <span className="font-display text-[10px] uppercase tracking-wider text-vapor-cyan">
              {highestRarity}
            </span>
          )}
        </div>
        {isRevealed && affixes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {affixes.map((a, i) => (
              <AffixBadge key={i} rarity={a} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
