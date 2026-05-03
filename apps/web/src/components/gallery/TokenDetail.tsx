'use client';

import Link from 'next/link';
import {
  useGalleryRow,
  ipfsGateway,
  resolveIpfsUri,
} from '@org/contract-client';
import AffixBadge from './AffixBadge';

export default function TokenDetail({ tokenId }: { tokenId: bigint }) {
  const { metadata, affixes, isRevealed, highestRarity } =
    useGalleryRow(tokenId);
  const imageUrl = isRevealed
    ? resolveIpfsUri(metadata?.image, ipfsGateway())
    : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-card border border-vapor-purple/40 bg-vapor-surface/60">
        {isRevealed && imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={metadata?.name ?? `Token #${tokenId}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-sm uppercase tracking-[0.2em] text-vapor-cyan">
            Revealing&hellip;
          </div>
        )}
      </div>
      <div className="space-y-4">
        <Link
          href="/gallery"
          className="cursor-pointer font-mono text-xs text-vapor-muted hover:text-vapor-cyan"
        >
          &larr; Back to gallery
        </Link>
        <h1 className="font-display text-2xl uppercase tracking-wider text-vapor-text">
          {metadata?.name ?? `Token #${tokenId.toString()}`}
        </h1>
        <p className="font-mono text-xs text-vapor-muted">
          Token ID: {tokenId.toString()}
        </p>
        {isRevealed && (
          <p className="font-display text-xs uppercase tracking-wider text-vapor-cyan">
            Highest tier: {highestRarity}
          </p>
        )}
        {metadata?.description && (
          <p className="font-body text-sm text-vapor-text/90">
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
