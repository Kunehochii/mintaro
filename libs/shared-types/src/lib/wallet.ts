export const SEPOLIA_CHAIN_CONFIG = {
  chainId: 11155111,
  chainName: 'Sepolia',
  rpcUrls: ['https://rpc.sepolia.org'],
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
} as const;

/** Hardhat local network chain ID */
export const LOCALHOST_CHAIN_ID = 31337;

/** All chain IDs the dApp accepts as "correct network" */
export const VALID_CHAIN_IDS = [
  SEPOLIA_CHAIN_CONFIG.chainId,
  LOCALHOST_CHAIN_ID,
] as const;
