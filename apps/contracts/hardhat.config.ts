import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@typechain/hardhat';

function getAccounts(): string[] {
  const key = process.env.RELAYER_PRIVATE_KEY;
  if (!key) return [];
  const hex = key.startsWith('0x') ? key.slice(2) : key;
  if (hex.length !== 64 || !/^[0-9a-fA-F]+$/.test(hex)) return [];
  return [key];
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      evmVersion: 'cancun',
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL ?? '',
      accounts: getAccounts(),
    },
  },
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
