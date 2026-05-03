// TODO(US-2.1): Replace with on-chain `mintPrice()` view call once it exists.
export const MINT_PRICE_DISPLAY = '0.01 ETH';

export const DEFAULT_IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

export function ipfsGateway(): string {
  return process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? DEFAULT_IPFS_GATEWAY;
}

export function deploymentBlock(): number {
  const raw = process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK;
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}
