'use client';

import Image from 'next/image';
import {
  ipfsGateway,
  isFusionEligible,
  resolveIpfsUri,
  useGalleryRow,
  useTokenAffixes,
} from '@org/contract-client';
import { useFusionSelection } from './selectionContext';
import AffixBadge from '../gallery/AffixBadge';
import {
  RARITY_BORDER,
  RARITY_DIVIDER,
  RARITY_LABEL,
} from '../gallery/rarityStyles';

export default function FuseNFTCard({ tokenId }: { tokenId: bigint }) {
  const { metadata, affixes, isRevealed, highestRarity } =
    useGalleryRow(tokenId);
  const { isLoading: isAffixesLoading } = useTokenAffixes(tokenId);
  const { isSelected, toggle, isFull } = useFusionSelection();

  const selected = isSelected(tokenId);
  const eligible = isFusionEligible(affixes);
  const stillLoading = isAffixesLoading;
  const disabledByCap = !selected && isFull;

  const interactive = !stillLoading && eligible && !disabledByCap;

  const imageUrl = isRevealed
    ? resolveIpfsUri(metadata?.image, ipfsGateway())
    : null;
  const tokenIdLabel = `#${tokenId.toString().padStart(4, '0')}`;

  const baseBorder = isRevealed
    ? RARITY_BORDER[highestRarity]
    : 'border-vapor-purple/40';
  const selectionRing = selected
    ? 'ring-2 ring-vapor-pink ring-offset-2 ring-offset-vapor-bg'
    : '';
  const opacityClass = !eligible || disabledByCap ? 'opacity-40' : '';
  const hoverLift = interactive
    ? 'hover:-translate-y-0.5 active:translate-y-0'
    : '';
  const cursorClass = interactive
    ? 'cursor-pointer'
    : eligible
      ? 'cursor-default'
      : 'cursor-not-allowed';

  const ariaLabel = isRevealed
    ? `${metadata?.name ?? `Token ${tokenIdLabel}`}, ${highestRarity} tier${
        !eligible
          ? ', not eligible for fusion'
          : disabledByCap
            ? ', selection full'
            : selected
              ? ', selected for fusion'
              : ''
      }`
    : `${tokenIdLabel}, revealing`;

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={!interactive}
      aria-label={ariaLabel}
      title={
        !eligible
          ? 'Cannot fuse rare NFTs'
          : disabledByCap
            ? 'Five NFTs already selected'
            : undefined
      }
      onClick={() => {
        if (interactive) toggle(tokenId);
      }}
      className={`group relative block w-full rounded-card border bg-vapor-surface/80 text-left backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vapor-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-vapor-bg ${baseBorder} ${selectionRing} ${opacityClass} ${hoverLift} ${cursorClass}`}
    >
      {selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-card shadow-glow-pink animate-pink-pulse"
        />
      )}
      <span
        aria-hidden
        className={`absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full border font-display text-[10px] uppercase tracking-wider transition-all ${
          selected
            ? 'border-vapor-pink bg-vapor-pink text-vapor-bg shadow-glow-pink'
            : 'border-vapor-muted/50 bg-vapor-bg/70 text-vapor-muted'
        }`}
      >
        {selected ? (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
          >
            <path d="M3 8.5l3.2 3.2L13 5" />
          </svg>
        ) : null}
      </span>
      <div className="relative aspect-square w-full overflow-hidden rounded-t-[11px]">
        {isRevealed && imageUrl ? (
          <Image
            src={imageUrl}
            alt={metadata?.name ?? `Token ${tokenIdLabel}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-vapor-purple/25 via-vapor-pink/10 to-vapor-cyan/25">
            <div
              aria-hidden
              className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_30%,rgba(255,113,206,0.25)_50%,transparent_70%)] bg-[length:200%_100%]"
            />
            <span className="relative font-display text-xs uppercase tracking-[0.2em] text-vapor-cyan glow-text-cyan">
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
        {affixes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {affixes.map((a, i) => (
              <AffixBadge key={i} rarity={a} />
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
