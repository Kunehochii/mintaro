import { useEffect, useState } from 'react';
import { ipfsGateway } from '../gallery/constants.js';
import { fetchMetadataFromUri } from '../gallery/useTokenMetadata.js';
import type { NFTMetadata } from '../gallery/types.js';

export interface UseFeedMetadataResult {
  metadata: NFTMetadata | null;
  isLoading: boolean;
}

export function useFeedMetadata(uri: string | null): UseFeedMetadataResult {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!uri) {
      setMetadata(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const md = await fetchMetadataFromUri(uri, ipfsGateway(), fetch);
      if (!cancelled) {
        setMetadata(md);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uri]);

  return { metadata, isLoading };
}
