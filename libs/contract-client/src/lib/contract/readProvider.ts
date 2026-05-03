import { JsonRpcProvider } from 'ethers';

export function createReadProvider(
  url: string | undefined,
): JsonRpcProvider | null {
  if (!url) return null;
  return new JsonRpcProvider(url);
}
