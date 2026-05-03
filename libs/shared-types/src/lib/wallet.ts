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
