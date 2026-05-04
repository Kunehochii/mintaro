import { Rarity } from '@org/shared-types';

const STYLES: Record<Rarity, string> = {
  [Rarity.Common]: 'border-vapor-muted/40 text-vapor-muted',
  [Rarity.Rare]: 'border-vapor-mint/60 text-vapor-mint shadow-glow-mint',
  [Rarity.Splendid]:
    'border-vapor-purple/60 text-vapor-purple shadow-glow-purple',
  [Rarity.Divine]: 'border-vapor-gold/70 text-vapor-gold shadow-glow-gold',
};

export default function AffixBadge({
  rarity,
  label,
}: {
  rarity: Rarity;
  /** Display text; chain tier still controls styling. */
  label?: string;
}) {
  const text = label ?? rarity;
  return (
    <span
      title={label ? `${rarity} tier` : undefined}
      className={`inline-flex items-center rounded-btn border px-2 py-0.5 font-display text-[10px] uppercase tracking-wider ${STYLES[rarity]}`}
    >
      {text}
    </span>
  );
}
