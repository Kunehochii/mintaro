import { Readable } from 'node:stream';
import PinataSDK from '@pinata/sdk';
import { Rarity } from '@org/shared-types';

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

async function downloadImage(url: string): Promise<Buffer> {
  if (url.startsWith('data:')) {
    const base64 = url.split(',')[1];
    return Buffer.from(base64, 'base64');
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download image from ${url}: ${response.status} ${response.statusText}`,
    );
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
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

  await client.testAuthentication().catch((err: Error) => {
    throw new Error(`Pinata authentication failed: ${err.message}`);
  });

  const imageBuffer = await downloadImage(imageUrl);
  const imageStream = Readable.from(imageBuffer);

  const imageResult = await client.pinFileToIPFS(imageStream, {
    pinataMetadata: { name: `affix-${tokenId}.png` },
  });

  const imageCid = imageResult.IpfsHash;

  const fetched = await fetch(`https://gateway.pinata.cloud/ipfs/${imageCid}`);
  if (!fetched.ok) {
    throw new Error(`Failed to verify pinned image at ${imageCid}`);
  }

  const metadata = buildMetadata(tokenId, affixes, imageCid);
  const metadataResult = await client.pinJSONToIPFS(metadata, {
    pinataMetadata: { name: `affix-${tokenId}-metadata.json` },
  });

  const metadataCid = metadataResult.IpfsHash;

  const metadataFetched = await fetch(
    `https://gateway.pinata.cloud/ipfs/${metadataCid}`,
  );
  if (!metadataFetched.ok) {
    throw new Error(`Failed to verify pinned metadata at ${metadataCid}`);
  }

  return `ipfs://${metadataCid}`;
}
