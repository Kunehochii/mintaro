import { getContract, getWallet } from './events';

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
