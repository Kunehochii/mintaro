'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  affixBadgeItems,
  type FeedEntry,
  formatRelativeTime,
  ipfsGateway,
  rarityFromAffixes,
  resolveIpfsUri,
  truncateAddress,
  useFeedMetadata,
} from '@org/contract-client';
import AffixBadge from '../gallery/AffixBadge';
import {
  RARITY_BORDER,
  RARITY_BORDER_HOVER,
  RARITY_DIVIDER,
  RARITY_LABEL,
} from '../gallery/rarityStyles';

export default function FeedCard({ entry }: { entry: FeedEntry }) {
  const { metadata, isLoading } = useFeedMetadata(entry.tokenURI);
  const imageUrl = resolveIpfsUri(metadata?.image, ipfsGateway());
  const tokenIdLabel = `#${entry.tokenId.toString().padStart(4, '0')}`;
  const tier = rarityFromAffixes(entry.affixes);
  const borderClass = `${RARITY_BORDER[tier]} ${RARITY_BORDER_HOVER[tier]}`;
  const isoTimestamp = new Date(entry.timestampSec * 1000).toISOString();
  const ariaLabel = `${metadata?.name ?? `Token ${tokenIdLabel}`}, ${tier} tier, minted by ${truncateAddress(entry.minter)}`;
  const affixPills = affixBadgeItems(metadata, entry.affixes);

  return (
    <Link
      href={`/gallery/${entry.tokenId.toString()}`}
      aria-label={ariaLabel}
      className={`group relative block overflow-hidden rounded-card border bg-vapor-surface/80 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vapor-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-vapor-bg ${borderClass}`}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {imageUrl ? (
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
            <span className="relative font-display text-xs uppercase tracking-[0.2em] text-vapor-cyan glow-text-cyan">
              {isLoading ? 'Loading…' : 'No image'}
            </span>
          </div>
        )}
      </div>
      <div className={`space-y-2 p-3 border-t ${RARITY_DIVIDER[tier]}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-vapor-muted">
            {tokenIdLabel}
          </span>
          <span
            className={`font-display text-[10px] uppercase tracking-wider ${RARITY_LABEL[tier]}`}
          >
            {tier}
          </span>
        </div>
        {affixPills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {affixPills.map((item, i) => (
              <AffixBadge key={i} rarity={item.rarity} label={item.label} />
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-2 pt-1 text-[10px]">
          <span className="font-mono text-vapor-muted">
            {truncateAddress(entry.minter)}
          </span>
          <time
            dateTime={isoTimestamp}
            title={isoTimestamp}
            className="font-mono text-vapor-muted"
          >
            {formatRelativeTime(entry.timestampSec)}
          </time>
        </div>
      </div>
    </Link>
  );
}
