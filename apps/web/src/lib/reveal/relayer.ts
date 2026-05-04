import { Rarity } from '@org/shared-types';
import { getContract, getWallet } from './events';

const RARITY_BY_UINT8: Record<number, Rarity> = {
  0: Rarity.Common,
  1: Rarity.Rare,
  2: Rarity.Splendid,
  3: Rarity.Divine,
};

export async function getAffixesOnChain(tokenId: number): Promise<Rarity[]> {
  const contract = getContract();
  const raw = await contract.getAffixes(BigInt(tokenId));
  return raw.map((v) => {
    const n = typeof v === 'bigint' ? Number(v) : Number(v);
    const r = RARITY_BY_UINT8[n];
    if (!r) throw new Error(`unknown affix value: ${n}`);
    return r;
  });
}

export async function setTokenURI(
  tokenId: number,
  uri: string,
): Promise<string> {
  const wallet = getWallet();
  const contract = getContract(wallet);

  const tx = await contract.setTokenURI(BigInt(tokenId), uri);
  const receipt = await tx.wait(1);

  if (!receipt) throw new Error('Transaction receipt is null');
  return receipt.hash;
}

export async function getTokenURI(tokenId: number): Promise<string> {
  const contract = getContract();
  try {
    return await contract.tokenURI(BigInt(tokenId));
  } catch {
    return '';
  }
}

export async function tokenExists(tokenId: number): Promise<boolean> {
  const contract = getContract();
  try {
    await contract.ownerOf(BigInt(tokenId));
    return true;
  } catch {
    return false;
  }
}
