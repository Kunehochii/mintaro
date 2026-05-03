import { JsonRpcProvider } from 'ethers';
import { createReadProvider } from './readProvider.js';

describe('createReadProvider', () => {
  it('returns a JsonRpcProvider when given a URL', () => {
    const p = createReadProvider('https://rpc.sepolia.org');
    expect(p).toBeInstanceOf(JsonRpcProvider);
  });

  it('returns null when given undefined or empty string', () => {
    expect(createReadProvider(undefined)).toBeNull();
    expect(createReadProvider('')).toBeNull();
  });
});
