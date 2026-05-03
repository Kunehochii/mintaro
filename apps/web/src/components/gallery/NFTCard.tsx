'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useGalleryRow,
  ipfsGateway,
  resolveIpfsUri,
} from '@org/contract-client';
import AffixBadge from './AffixBadge';
import {
  RARITY_BORDER,
  RARITY_BORDER_HOVER,
  RARITY_DIVIDER,
  RARITY_LABEL,
} from './rarityStyles';

export default function NFTCard({ tokenId }: { tokenId: bigint }) {
  const { metadata, affixes, isRevealed, highestRarity } =
    useGalleryRow(tokenId);
  const imageUrl = isRevealed
    ? resolveIpfsUri(metadata?.image, ipfsGateway())
    : null;
  const tokenIdLabel = `#${tokenId.toString().padStart(4, '0')}`;
  const borderClass = isRevealed
    ? `${RARITY_BORDER[highestRarity]} ${RARITY_BORDER_HOVER[highestRarity]}`
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
          <Image
            src={imageUrl}
            alt={metadata?.name ?? `Token ${tokenIdLabel}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
