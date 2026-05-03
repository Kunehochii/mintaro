import { Readable } from 'node:stream';
import PinataSDK from '@pinata/sdk';
import { Rarity } from '@org/shared-types';
import { ipfsGateway } from '@org/contract-client';

let pinata: PinataSDK | null = null;

function getPinata(): PinataSDK {
  if (!pinata) {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      throw new Error('PINATA_JWT environment variable is not set');
    }
    pinata = new PinataSDK({ pinataJWTKey: jwt });
  }
  return pinata;
}

const DOWNLOAD_MAX_RETRIES = 3;

async function downloadImage(url: string): Promise<Buffer> {
  if (url.startsWith('data:')) {
    const base64 = url.split(',')[1];
    return Buffer.from(base64, 'base64');
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= DOWNLOAD_MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const isTransient = response.status >= 500 || response.status === 429;
        if (!isTransient) {
          throw new Error(
            `Failed to download image from ${url}: ${response.status} ${response.statusText}`,
          );
        }
        throw new Error(`Transient error ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      lastError = error;
      if (attempt < DOWNLOAD_MAX_RETRIES) {
        const delay = 1000 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

function buildMetadata(tokenId: number, affixes: Rarity[], imageCid: string) {
  return {
    name: `Affix #${tokenId}`,
    description: `An AI-generated NFT with ${affixes.length} rarity affix${affixes.length > 1 ? 'es' : ''}: ${affixes.join(', ')}. Minted on the AffixNFT gacha dApp.`,
    image: `ipfs://${imageCid}`,
    attributes: affixes.map((affix) => ({
      trait_type: 'Affix',
      value: affix,
    })),
  };
}

export async function pinImageAndMetadata(
  imageUrl: string,
  tokenId: number,
  affixes: Rarity[],
): Promise<string> {
  const client = getPinata();
  const gateway = ipfsGateway();

  await client.testAuthentication().catch((err: Error) => {
    throw new Error(`Pinata authentication failed: ${err.message}`);
  });

  const imageBuffer = await downloadImage(imageUrl);
  const imageStream = Readable.from(imageBuffer);

  const imageResult = await client.pinFileToIPFS(imageStream, {
    pinataMetadata: { name: `affix-${tokenId}.png` },
  });

  const imageCid = imageResult.IpfsHash;

  const fetched = await fetch(`${gateway}${imageCid}`);
  if (!fetched.ok) {
    throw new Error(`Failed to verify pinned image at ${imageCid}`);
  }

  const metadata = buildMetadata(tokenId, affixes, imageCid);
  const metadataResult = await client.pinJSONToIPFS(metadata, {
    pinataMetadata: { name: `affix-${tokenId}-metadata.json` },
  });

  const metadataCid = metadataResult.IpfsHash;

  const metadataFetched = await fetch(`${gateway}${metadataCid}`);
  if (!metadataFetched.ok) {
    throw new Error(`Failed to verify pinned metadata at ${metadataCid}`);
  }

  return `ipfs://${metadataCid}`;
}
