import type { Address } from 'viem';
import { Rarity } from '@org/shared-types';
import { buildMintPrompt, subjectIndexFromSeed } from './prompt';
import { generateImage } from './openai';
import { pinImageAndMetadata } from './pinata';
import { setTokenURI, getTokenURI, getAffixesOnChain } from './relayer';

const MAX_RETRIES = 3;

export interface PipelineResult {
  success: boolean;
  skip?: boolean;
  txHash?: string;
  error?: string;
  affixes?: Rarity[];
}

export async function revealPipeline(
  tokenId: number,
  seed: bigint,
  minter: Address,
  customSubject?: string,
): Promise<PipelineResult> {
  const existingUri = await getTokenURI(tokenId);
  if (existingUri && existingUri !== '') {
    return { success: true, skip: true };
  }

  const affixes = await getAffixesOnChain(tokenId);

  let lastError: string | undefined;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const subjectIndex = subjectIndexFromSeed(seed + BigInt(attempt));
      const prompt = buildMintPrompt(
        affixes,
        Number(subjectIndex),
        customSubject,
      );

      const imageUrl = await generateImage(prompt);

      const ipfsUri = await pinImageAndMetadata(imageUrl, tokenId, affixes);
      const txHash = await setTokenURI(tokenId, ipfsUri);

      return {
        success: true,
        txHash,
        affixes,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < MAX_RETRIES - 1) {
        const delay = 1000 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError,
  };
}
