export { useWallet } from './lib/wallet/useWallet.js';
export type { WalletState } from './lib/wallet/useWallet.js';
export { truncateAddress } from './lib/wallet/format.js';
export type { Eip1193Provider, MetaMaskProvider } from './lib/wallet/types.js';
export { useAffixNFT } from './lib/affix/useAffixNFT.js';
export type { MintState, AffixEntry } from './lib/affix/useAffixNFT.js';

export { useAffixContract } from './lib/contract/useAffixContract.js';

export { useUserTokens } from './lib/gallery/useUserTokens.js';
export { useTokenMetadata } from './lib/gallery/useTokenMetadata.js';
export { useTokenAffixes } from './lib/gallery/useTokenAffixes.js';
export { useGalleryRow } from './lib/gallery/useGalleryRow.js';
export { rarityFromAffixes } from './lib/gallery/rarityFromAffixes.js';
export {
  affixBadgeItems,
  affixRaritiesForPricing,
  stackAffixBadgeItems,
  MAX_METADATA_AFFIX_TRAITS,
  rarityFromTraitValue,
  displayedTopRarity,
} from './lib/gallery/affixBadgeItems.js';
export type { AffixBadgeItem } from './lib/gallery/affixBadgeItems.js';
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
export {
  AFFIX_VALUE_MULTIPLIER_BPS,
  estimateNftValueWei,
  formatEstimateEth,
} from './lib/gallery/affixValueEstimate.js';
export { useMintPriceWei } from './lib/gallery/useMintPriceWei.js';
export type { UseMintPriceWeiResult } from './lib/gallery/useMintPriceWei.js';

export { useFuse } from './lib/fuse/useFuse.js';
export type { FuseStatus, UseFuseResult } from './lib/fuse/useFuse.js';
export { isFusionEligible } from './lib/fuse/isFusionEligible.js';
export { parseFusedEvent } from './lib/fuse/parseFusedEvent.js';

export { useReadAffixContract } from './lib/contract/useReadAffixContract.js';
export { createReadProvider } from './lib/contract/readProvider.js';
export { usePublicFeed } from './lib/feed/usePublicFeed.js';
export type { UsePublicFeedResult } from './lib/feed/usePublicFeed.js';
export { useFeedMetadata } from './lib/feed/useFeedMetadata.js';
export type { UseFeedMetadataResult } from './lib/feed/useFeedMetadata.js';
export { useFeedMetadataMap } from './lib/feed/useFeedMetadataMap.js';
export type { FeedMetadataMap } from './lib/feed/useFeedMetadataMap.js';
export { applyRarityFilter } from './lib/feed/rarityFilter.js';
export { formatRelativeTime } from './lib/feed/formatRelativeTime.js';
export type { FeedEntry, RarityTierFilter } from './lib/feed/types.js';
export { RARITY_TIER_FILTERS } from './lib/feed/types.js';
