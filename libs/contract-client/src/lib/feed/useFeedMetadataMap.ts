import { useEffect, useState } from 'react';
import { ipfsGateway } from '../gallery/constants.js';
import { fetchMetadataFromUri } from '../gallery/useTokenMetadata.js';
import type { NFTMetadata } from '../gallery/types.js';

export type FeedMetadataMap = Record<string, NFTMetadata | null>;

export function useFeedMetadataMap(uris: readonly string[]): FeedMetadataMap {
  const key = uris.join('|');
  const [map, setMap] = useState<FeedMetadataMap>({});

  useEffect(() => {
    if (uris.length === 0) {
      setMap({});
      return;
    }
    let cancelled = false;
    (async () => {
      const gw = ipfsGateway();
      const entries = await Promise.all(
        uris.map(
          async (uri) =>
            [uri, await fetchMetadataFromUri(uri, gw, fetch)] as const,
        ),
      );
      if (!cancelled) setMap(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return map;
}
