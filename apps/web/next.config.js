//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  transpilePackages: ['@org/contract-client', '@org/shared-types'],
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
