import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@typechain/hardhat';

const hasSepolia = Boolean(process.env.RELAYER_PRIVATE_KEY);

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      evmVersion: 'cancun',
    },
  },
  networks: hasSepolia
    ? {
        sepolia: {
          url: process.env.SEPOLIA_RPC_URL ?? '',
          accounts: [process.env.RELAYER_PRIVATE_KEY!],
        },
      }
    : {},
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY ?? '',
    },
  },
  sourcify: {
    enabled: false,
  },
  typechain: {
    outDir: '../../libs/shared-types/src/generated',
    target: 'ethers-v6',
  },
};

export default config;
