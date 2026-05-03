export { useWallet } from './lib/wallet/useWallet.js';
export type { WalletState } from './lib/wallet/useWallet.js';
export { truncateAddress } from './lib/wallet/format.js';
export type { Eip1193Provider, MetaMaskProvider } from './lib/wallet/types.js';

export { useAffixContract } from './lib/contract/useAffixContract.js';

export { useUserTokens } from './lib/gallery/useUserTokens.js';
export { useTokenMetadata } from './lib/gallery/useTokenMetadata.js';
export { useTokenAffixes } from './lib/gallery/useTokenAffixes.js';
export {
  useGalleryRow,
  useGalleryTokens,
} from './lib/gallery/useGalleryTokens.js';
export { rarityFromAffixes } from './lib/gallery/rarityFromAffixes.js';
export { resolveIpfsUri } from './lib/gallery/ipfs.js';
export {
  MINT_PRICE_DISPLAY,
  ipfsGateway,
  deploymentBlock,
} from './lib/gallery/constants.js';
export type {
  GalleryToken,
  UserToken,
  NFTMetadata,
} from './lib/gallery/types.js';
