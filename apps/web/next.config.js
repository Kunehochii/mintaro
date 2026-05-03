//@ts-check

const { composePlugins, withNx } = require('@nx/next');

const ipfsGatewayUrl = new URL(
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
);
const ipfsProtocol = ipfsGatewayUrl.protocol === 'http:' ? 'http' : 'https';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  transpilePackages: ['@org/contract-client', '@org/shared-types'],
  images: {
    remotePatterns: [
      {
        protocol: ipfsProtocol,
        hostname: ipfsGatewayUrl.hostname,
      },
    ],
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
