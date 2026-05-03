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
  [Rarity.Common]: 'border-vapor-muted/30 hover:border-vapor-muted/50',
  [Rarity.Rare]:
    'border-vapor-mint/50 shadow-glow-mint hover:shadow-[0_0_18px_#05FFA1,0_0_36px_#05FFA160]',
  [Rarity.Splendid]:
    'border-vapor-purple/50 shadow-glow-purple hover:shadow-[0_0_18px_#B967FF,0_0_36px_#B967FF60]',
  [Rarity.Divine]:
    'border-vapor-gold/60 shadow-glow-gold hover:shadow-[0_0_18px_#FBBF24,0_0_36px_#FBBF2460]',
};

const RARITY_LABEL: Record<Rarity, string> = {
  [Rarity.Common]: 'text-vapor-muted',
  [Rarity.Rare]: 'text-vapor-mint',
  [Rarity.Splendid]: 'text-vapor-purple',
  [Rarity.Divine]: 'text-vapor-gold',
};

const RARITY_DIVIDER: Record<Rarity, string> = {
  [Rarity.Common]: 'border-vapor-muted/20',
  [Rarity.Rare]: 'border-vapor-mint/30',
  [Rarity.Splendid]: 'border-vapor-purple/30',
  [Rarity.Divine]: 'border-vapor-gold/40',
};

export default function NFTCard({ tokenId }: { tokenId: bigint }) {
  const { metadata, affixes, isRevealed, highestRarity } =
    useGalleryRow(tokenId);
  const imageUrl = isRevealed
    ? resolveIpfsUri(metadata?.image, ipfsGateway())
    : null;
  const tokenIdLabel = `#${tokenId.toString().padStart(4, '0')}`;
  const borderClass = isRevealed
    ? RARITY_BORDER[highestRarity]
    : 'border-vapor-purple/40 hover:border-vapor-purple/60';
  const ariaLabel = isRevealed
    ? `${metadata?.name ?? `Token ${tokenIdLabel}`}, ${highestRarity} tier`
    : `${tokenIdLabel}, revealing`;

  return (
    <Link
      href={`/gallery/${tokenId.toString()}`}
      aria-label={ariaLabel}
      className={`group relative block overflow-hidden rounded-card border bg-vapor-surface/80 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vapor-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-vapor-bg ${borderClass}`}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {isRevealed && imageUrl ? (
          <img
            src={imageUrl}
            alt={metadata?.name ?? `Token ${tokenIdLabel}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-vapor-purple/25 via-vapor-pink/10 to-vapor-cyan/25">
            <div
              aria-hidden
              className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_30%,rgba(255,113,206,0.25)_50%,transparent_70%)] bg-[length:200%_100%]"
            />
            <span className="relative animate-glitch font-display text-xs uppercase tracking-[0.2em] text-vapor-cyan glow-text-cyan">
              Revealing&hellip;
            </span>
          </div>
        )}
      </div>
      <div
        className={`space-y-2 p-3 ${
          isRevealed ? `border-t ${RARITY_DIVIDER[highestRarity]}` : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-vapor-muted">
            {tokenIdLabel}
          </span>
          {isRevealed && (
            <span
              className={`font-display text-[10px] uppercase tracking-wider ${RARITY_LABEL[highestRarity]}`}
            >
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
