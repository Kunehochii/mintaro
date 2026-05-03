'use client';

import {
  RARITY_TIER_FILTERS,
  type RarityTierFilter,
} from '@org/contract-client';

const PILL_COLORS: Record<RarityTierFilter, string> = {
  All: 'border-vapor-cyan/60 text-vapor-cyan',
  Common: 'border-vapor-muted/50 text-vapor-muted',
  'Rare+': 'border-vapor-mint/60 text-vapor-mint',
  'Splendid+': 'border-vapor-purple/60 text-vapor-purple',
  Divine: 'border-vapor-gold/70 text-vapor-gold',
};

interface Props {
  value: RarityTierFilter;
  onChange: (next: RarityTierFilter) => void;
}

export default function RarityFilter({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filter by rarity tier"
      className="flex flex-wrap items-center gap-2"
    >
      {RARITY_TIER_FILTERS.map((tier) => {
        const active = tier === value;
        const base =
          'cursor-pointer rounded-btn border px-3 py-1.5 font-display text-[11px] uppercase tracking-wider transition-all duration-150';
        const state = active
          ? `${PILL_COLORS[tier]} bg-vapor-surface/70 shadow-[0_0_10px_rgba(255,255,255,0.05)]`
          : 'border-vapor-purple/20 text-vapor-muted hover:border-vapor-purple/40 hover:text-vapor-text';
        return (
          <button
            key={tier}
            type="button"
            role="tab"
            aria-selected={active}
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
