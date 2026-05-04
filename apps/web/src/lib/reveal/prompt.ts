import { Rarity } from '@org/shared-types';

const SUBJECTS = [
  'dragon',
  'phoenix',
  'golem',
  'wyvern',
  'kraken',
  'griffin',
  'chimera',
  'leviathan',
  'shapeshifter',
  'celestial beast',
] as const;

export function buildMintPrompt(
  affixes: Rarity[],
  subjectIndex: number,
  customSubject?: string,
): string {
  const trimmed = customSubject?.trim();
  const subject = trimmed
    ? trimmed.slice(0, 100)
    : SUBJECTS[subjectIndex % SUBJECTS.length];
  const affixList = affixes.join(', ');
  const divineCount = affixes.filter((a) => a === Rarity.Divine).length;
  const splendidCount = affixes.filter((a) => a === Rarity.Splendid).length;

  const qualityMods: string[] = [];
  if (divineCount > 0)
    qualityMods.push('divine radiance', 'glowing runes', 'celestial aura');
  else if (splendidCount > 0)
    qualityMods.push(
      'ornate details',
      'shimmering light',
      'intricate patterns',
    );
  else qualityMods.push('clean linework', 'solid design');

  return `A ${affixList} ${subject}, fantasy digital art, ${qualityMods.join(', ')}, 1:1 aspect ratio`.trim();
}

export function subjectIndexFromSeed(seed: bigint): number {
  return Number(seed % BigInt(SUBJECTS.length));
}
