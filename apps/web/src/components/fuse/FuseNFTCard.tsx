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
    ? 'ring-2 ring-vapor-pink ring-offset-2 ring-offset-vapor-bg shadow-glow-pink'
    : '';
  const opacityClass = !eligible || disabledByCap ? 'opacity-40' : '';
  const cursorClass = interactive
    ? 'cursor-pointer'
    : eligible
      ? 'cursor-default'
      : 'cursor-not-allowed';

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={!interactive}
      data-tooltip={!eligible ? 'Cannot fuse rare NFTs' : undefined}
      title={!eligible ? 'Cannot fuse rare NFTs' : undefined}
      onClick={() => {
        if (interactive) toggle(tokenId);
      }}
      className={`group relative block w-full overflow-hidden rounded-card border bg-vapor-surface/80 text-left backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vapor-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-vapor-bg ${baseBorder} ${selectionRing} ${opacityClass} ${cursorClass}`}
    >
      <div className="absolute right-2 top-2 z-10">
        <span
          aria-hidden
          className={`flex size-6 items-center justify-center rounded-full border font-display text-[10px] uppercase tracking-wider transition-all ${
            selected
              ? 'border-vapor-pink bg-vapor-pink text-vapor-bg shadow-glow-pink'
              : 'border-vapor-muted/50 bg-vapor-bg/70 text-vapor-muted'
          }`}
        >
          {selected ? '✓' : ''}
        </span>
      </div>
      <div className="relative aspect-square w-full overflow-hidden">
        {isRevealed && imageUrl ? (
          <Image
            src={imageUrl}
            alt={metadata?.name ?? `Token ${tokenIdLabel}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-vapor-purple/25 via-vapor-pink/10 to-vapor-cyan/25">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-vapor-cyan">
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
