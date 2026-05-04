export enum Rarity {
  Common = 'Common',
  Rare = 'Rare',
  Splendid = 'Splendid',
  Divine = 'Divine',
}

export const RARITY_PROBABILITIES: Record<Rarity, number> = {
  [Rarity.Common]: 70,
  [Rarity.Rare]: 20,
  [Rarity.Splendid]: 8,
  [Rarity.Divine]: 2,
};

/** Maximum number of affixes a single NFT can receive */
export const MAX_AFFIXES = 3;
