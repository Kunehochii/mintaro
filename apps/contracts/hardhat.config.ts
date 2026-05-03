import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@typechain/hardhat';

const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      evmVersion: 'cancun',
    },
  },
  networks:
    relayerPrivateKey && sepoliaRpcUrl
      ? {
          sepolia: {
            url: sepoliaRpcUrl,
            accounts: [relayerPrivateKey],
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
