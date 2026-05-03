import { Rarity } from '@org/shared-types';

export const RARITY_BORDER: Record<Rarity, string> = {
  [Rarity.Common]: 'border-vapor-muted/30',
  [Rarity.Rare]: 'border-vapor-mint/50 shadow-glow-mint',
  [Rarity.Splendid]: 'border-vapor-purple/50 shadow-glow-purple',
  [Rarity.Divine]: 'border-vapor-gold/60 shadow-glow-gold',
};

export const RARITY_BORDER_HOVER: Record<Rarity, string> = {
  [Rarity.Common]: 'hover:border-vapor-muted/50',
  [Rarity.Rare]: 'hover:shadow-[0_0_18px_#05FFA1,0_0_36px_#05FFA160]',
  [Rarity.Splendid]: 'hover:shadow-[0_0_18px_#B967FF,0_0_36px_#B967FF60]',
  [Rarity.Divine]: 'hover:shadow-[0_0_18px_#FBBF24,0_0_36px_#FBBF2460]',
};

export const RARITY_LABEL: Record<Rarity, string> = {
  [Rarity.Common]: 'text-vapor-muted',
  [Rarity.Rare]: 'text-vapor-mint',
  [Rarity.Splendid]: 'text-vapor-purple',
  [Rarity.Divine]: 'text-vapor-gold',
};

export const RARITY_DIVIDER: Record<Rarity, string> = {
  [Rarity.Common]: 'border-vapor-muted/20',
  [Rarity.Rare]: 'border-vapor-mint/30',
  [Rarity.Splendid]: 'border-vapor-purple/30',
  [Rarity.Divine]: 'border-vapor-gold/40',
};
