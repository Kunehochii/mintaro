'use client';

import {
  RARITY_TIER_FILTERS,
  type RarityTierFilter,
} from '@org/contract-client';

const PILL_ACTIVE: Record<RarityTierFilter, string> = {
  All: 'border-vapor-cyan text-vapor-cyan shadow-glow-cyan',
  Common:
    'border-vapor-text text-vapor-text shadow-[0_0_12px_#f8fafc,0_0_24px_#f8fafc40]',
  'Rare+': 'border-vapor-mint text-vapor-mint shadow-glow-mint',
  'Splendid+': 'border-vapor-purple text-vapor-purple shadow-glow-purple',
  Divine: 'border-vapor-gold text-vapor-gold shadow-glow-gold',
};

interface Props {
  value: RarityTierFilter;
  onChange: (next: RarityTierFilter) => void;
}

export default function RarityFilter({ value, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Filter by rarity tier"
      className="flex flex-wrap items-center gap-2"
    >
      {RARITY_TIER_FILTERS.map((tier) => {
        const active = tier === value;
        const base =
          'cursor-pointer rounded-btn border px-3 py-1.5 font-display text-[11px] uppercase tracking-wider transition-all duration-150';
        const state = active
          ? `${PILL_ACTIVE[tier]} bg-vapor-surface/70`
          : 'border-vapor-purple/20 text-vapor-muted hover:border-vapor-purple/40 hover:text-vapor-text';
        return (
          <button
            key={tier}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tier)}
            className={`${base} ${state}`}
          >
            {tier}
          </button>
        );
      })}
    </div>
  );
}
