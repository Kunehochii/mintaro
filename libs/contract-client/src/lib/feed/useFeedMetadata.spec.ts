/** @jest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { useFeedMetadata } from './useFeedMetadata.js';

const mockFetch = jest.fn();
beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
  process.env.NEXT_PUBLIC_IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
});

describe('useFeedMetadata', () => {
  it('returns null metadata initially, then resolved metadata after fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'Test', image: 'ipfs://abc' }),
    });

    const { result } = renderHook(() => useFeedMetadata('ipfs://meta'));
    expect(result.current.metadata).toBeNull();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.metadata?.name).toBe('Test');
  });

  it('returns null metadata when uri is null', async () => {
    const { result } = renderHook(() => useFeedMetadata(null));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.metadata).toBeNull();
  });
});
