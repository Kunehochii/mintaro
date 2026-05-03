'use client';

import { useState, useEffect } from 'react';
import type { AffixEntry } from '@org/contract-client';

interface RevealCardProps {
  tokenId: number | null;
  imageUrl: string | null;
  affixes: AffixEntry[];
  animationPlayed: boolean;
}

function getRarityLabel(
  value: string,
): 'common' | 'rare' | 'splendid' | 'divine' {
  const v = value.toLowerCase();
  if (v === 'divine') return 'divine';
  if (v === 'splendid') return 'splendid';
  if (v === 'rare') return 'rare';
  return 'common';
}

const RARITY_STYLES: Record<
  string,
  { border: string; text: string; bg: string; glow: string }
> = {
  common: {
    border: 'border-vapor-muted/40',
    text: 'text-vapor-muted',
    bg: 'bg-vapor-muted/10',
    glow: '',
  },
  rare: {
    border: 'border-vapor-cyan/40',
    text: 'text-vapor-cyan',
    bg: 'bg-vapor-cyan/10',
    glow: 'shadow-glow-cyan',
  },
  splendid: {
    border: 'border-vapor-purple/40',
    text: 'text-vapor-purple',
    bg: 'bg-vapor-purple/10',
    glow: 'shadow-glow-purple',
  },
  divine: {
    border: 'border-vapor-gold/40',
    text: 'text-vapor-gold',
    bg: 'bg-vapor-gold/10',
    glow: 'shadow-glow-gold',
  },
};

const RARITY_RANK: Record<string, number> = {
  common: 0,
  rare: 1,
  splendid: 2,
  divine: 3,
};

function getHighestAffix(affixes: AffixEntry[]): AffixEntry | null {
  const filtered = affixes.filter((a) => a.trait_type === 'Affix');
  if (filtered.length === 0) return null;
  return filtered.reduce((highest, curr) =>
    RARITY_RANK[getRarityLabel(curr.value)] >
    RARITY_RANK[getRarityLabel(highest.value)]
      ? curr
      : highest,
  );
}

function AffixBadge({ value }: { value: string }) {
  const rarity = getRarityLabel(value);
  const styles = RARITY_STYLES[rarity];

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider ${styles.border} ${styles.text} ${styles.bg}`}
    >
      {value}
    </span>
  );
}

export default function RevealCard({
  tokenId,
  imageUrl,
  affixes,
  animationPlayed,
}: RevealCardProps) {
  const [animState, setAnimState] = useState<'shimmer' | 'reveal' | 'done'>(
    animationPlayed ? 'done' : 'shimmer',
  );

  useEffect(() => {
    if (animationPlayed) {
      setAnimState('done');
      return;
    }

    if (imageUrl && animState === 'shimmer') {
      const img = new Image();
      img.onload = () => setAnimState('reveal');
      img.onerror = () => setAnimState('reveal');
      img.src = imageUrl;
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }

    if (imageUrl && animState === 'reveal') {
      const timer = setTimeout(() => setAnimState('done'), 700);
      return () => clearTimeout(timer);
    }

    return;
  }, [imageUrl, animationPlayed, animState]);

  const isShimmer = animState === 'shimmer';

  return (
    <div className="w-full">
      {/* Card — fixed aspect-square container */}
      <div
        className={`relative aspect-square w-full rounded-card border ${
          isShimmer
            ? 'border-vapor-purple/20 bg-vapor-surface/40'
            : restyle(affixes)
        }`}
        style={{ perspective: '1000px' }}
      >
        {/* 3D flip container */}
        <div
          className="h-full w-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isShimmer ? 'rotateY(0deg)' : 'rotateY(180deg)',
          }}
        >
          {/* Front face — shimmer / spinner */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="h-full w-full animate-shimmer bg-[linear-gradient(90deg,transparent_0%,rgba(185,103,255,0.05)_25%,rgba(1,205,254,0.08)_50%,rgba(185,103,255,0.05)_75%,transparent_100%)] bg-[length:200%_100%]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="size-16 animate-spin rounded-full border-4 border-vapor-purple/20 border-t-vapor-mint" />
              <p className="px-4 text-center font-mono text-sm text-vapor-muted">
                {imageUrl ? 'Forging your affix...' : 'Revealing artwork...'}
              </p>
            </div>
          </div>

          {/* Back face — image */}
          <div
            className="absolute inset-0 rounded-card bg-vapor-surface/60"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`Affix #${tokenId}`}
                className="h-full w-full rounded-card object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="font-mono text-sm text-vapor-muted">
                  Image not available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Affix below the card */}
      {!isShimmer && affixes.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {(() => {
            const highest = getHighestAffix(affixes);
            return highest ? <AffixBadge value={highest.value} /> : null;
          })()}
        </div>
      )}

      {/* Token ID label */}
      {!isShimmer && tokenId != null && (
        <p className="mt-2 text-center font-display text-vapor-cyan">
          Affix #{tokenId} revealed!
        </p>
      )}
    </div>
  );
}

function restyle(affixes: AffixEntry[]): string {
  if (affixes.length === 0) return 'border-vapor-purple/30 bg-vapor-surface/60';

  const rarities = affixes
    .filter((a) => a.trait_type === 'Affix')
    .map((a) => getRarityLabel(a.value));

  if (rarities.some((r) => r === 'divine'))
    return 'border-vapor-gold/40 bg-vapor-surface/60 shadow-glow-gold';
  if (rarities.some((r) => r === 'splendid'))
    return 'border-vapor-purple/40 bg-vapor-surface/60 shadow-glow-purple';
  if (rarities.some((r) => r === 'rare'))
    return 'border-vapor-cyan/40 bg-vapor-surface/60';
  return 'border-vapor-muted/30 bg-vapor-surface/60';
}
