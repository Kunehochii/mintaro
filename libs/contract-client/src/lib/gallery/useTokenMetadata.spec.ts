import { fetchMetadataFromUri } from './useTokenMetadata.js';

describe('fetchMetadataFromUri', () => {
  const gateway = 'https://ipfs.io/ipfs/';

  it('returns null for empty URI (unrevealed token)', async () => {
    expect(await fetchMetadataFromUri('', gateway, fetch)).toBeNull();
  });

  it('parses metadata from a successful HTTP response', async () => {
    const mockFetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ name: 'Affix #1', image: 'ipfs://abc/img.png' }),
    })) as unknown as typeof fetch;
    const md = await fetchMetadataFromUri(
      'https://example.com/m.json',
      gateway,
      mockFetch,
    );
    expect(md?.name).toBe('Affix #1');
  });

  it('returns null when fetch fails', async () => {
    const mockFetch = jest.fn(async () => ({
      ok: false,
      status: 500,
    })) as unknown as typeof fetch;
    expect(
      await fetchMetadataFromUri(
        'https://example.com/m.json',
        gateway,
        mockFetch,
      ),
    ).toBeNull();
  });

  it('rewrites ipfs:// URIs through the gateway before fetching', async () => {
    const mockFetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({}),
    })) as unknown as typeof fetch;
    await fetchMetadataFromUri('ipfs://abc/m.json', gateway, mockFetch);
    expect((mockFetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://ipfs.io/ipfs/abc/m.json',
    );
  });
});
