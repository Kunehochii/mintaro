import { Rarity } from '@org/shared-types';

export function isFusionEligible(affixes: readonly Rarity[]): boolean {
  for (const a of affixes) {
    if (a === Rarity.Splendid || a === Rarity.Divine) return false;
  }
  return true;
}
