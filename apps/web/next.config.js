//@ts-check

const { composePlugins, withNx } = require('@nx/next');

const ipfsGatewayUrl = new URL(
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
);

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  transpilePackages: ['@org/contract-client', '@org/shared-types'],
  images: {
    remotePatterns: [
      {
        protocol: ipfsGatewayUrl.protocol.replace(':', ''),
        hostname: ipfsGatewayUrl.hostname,
      },
    ],
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
