import { resolveIpfsUri } from './ipfs.js';

const GATEWAY = 'https://ipfs.io/ipfs/';

describe('resolveIpfsUri', () => {
  it('rewrites ipfs:// URIs to the configured gateway', () => {
    expect(resolveIpfsUri('ipfs://bafkreiabc/0.json', GATEWAY)).toBe(
      'https://ipfs.io/ipfs/bafkreiabc/0.json',
    );
  });

  it('passes http(s) URLs through unchanged', () => {
    expect(resolveIpfsUri('https://example.com/x.json', GATEWAY)).toBe(
      'https://example.com/x.json',
    );
  });

  it('passes data: URIs through unchanged', () => {
    expect(resolveIpfsUri('data:application/json;base64,abc', GATEWAY)).toBe(
      'data:application/json;base64,abc',
    );
  });

  it('returns null for empty or undefined input', () => {
    expect(resolveIpfsUri('', GATEWAY)).toBeNull();
    expect(resolveIpfsUri(undefined, GATEWAY)).toBeNull();
  });

  it('appends a trailing slash to the gateway if missing', () => {
    expect(resolveIpfsUri('ipfs://abc', 'https://ipfs.io/ipfs')).toBe(
      'https://ipfs.io/ipfs/abc',
    );
  });
});
