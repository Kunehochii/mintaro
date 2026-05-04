'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  affixBadgeItems,
  affixRaritiesForPricing,
  useGalleryRow,
  ipfsGateway,
  resolveIpfsUri,
} from '@org/contract-client';
import AffixBadge from './AffixBadge';
import NftEstimatedPrice from './NftEstimatedPrice';
import { RARITY_BORDER, RARITY_LABEL } from './rarityStyles';

export default function TokenDetail({ tokenId }: { tokenId: bigint }) {
  const { metadata, affixes, isRevealed, highestRarity } =
    useGalleryRow(tokenId);
  const imageUrl = isRevealed
    ? resolveIpfsUri(metadata?.image, ipfsGateway())
    : null;
  const borderClass = isRevealed
    ? RARITY_BORDER[highestRarity]
    : 'border-vapor-purple/40';
  const affixPills = affixBadgeItems(metadata, affixes);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
      <div
        className={`relative aspect-square overflow-hidden rounded-card border bg-vapor-surface/60 backdrop-blur-md ${borderClass}`}
      >
        {isRevealed && imageUrl ? (
          <Image
            src={imageUrl}
            alt={metadata?.name ?? `Token #${tokenId}`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
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
        <NftEstimatedPrice
          affixes={affixRaritiesForPricing(metadata, affixes)}
        />
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
        {affixPills.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-display text-xs uppercase tracking-wider text-vapor-muted">
              Affixes
            </h2>
            <div className="flex flex-wrap gap-2">
              {affixPills.map((item, i) => (
                <AffixBadge key={i} rarity={item.rarity} label={item.label} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
