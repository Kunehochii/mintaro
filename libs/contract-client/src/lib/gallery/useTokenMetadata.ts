import { useEffect, useState } from 'react';
import { useAffixContract } from '../contract/useAffixContract.js';
import { ipfsGateway } from './constants.js';
import { resolveIpfsUri } from './ipfs.js';
import type { NFTMetadata } from './types.js';

export async function fetchMetadataFromUri(
  uri: string | null | undefined,
  gateway: string,
  fetchImpl: typeof fetch,
): Promise<NFTMetadata | null> {
  // TODO(US-2.3): once US-2.3 lands the TokenRevealed event, the page can
  // also subscribe to that event to know when to re-fetch metadata for a
  // tokenId, instead of inferring revealed-state from a non-empty URI string.
  const resolved = resolveIpfsUri(uri ?? undefined, gateway);
  if (!resolved) return null;
  try {
    const res = await fetchImpl(resolved);
    if (!res.ok) return null;
    return (await res.json()) as NFTMetadata;
  } catch {
    return null;
  }
}

export interface UseTokenMetadataResult {
  tokenURI: string | null;
  metadata: NFTMetadata | null;
  isLoading: boolean;
}

export function useTokenMetadata(
  tokenId: bigint | null,
): UseTokenMetadataResult {
  const contract = useAffixContract();
  const [tokenURI, setTokenURI] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!contract || tokenId === null) {
      setTokenURI(null);
      setMetadata(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const uri = await contract.tokenURI(tokenId);
        if (cancelled) return;
        setTokenURI(uri || null);
        const md = await fetchMetadataFromUri(uri, ipfsGateway(), fetch);
        if (!cancelled) setMetadata(md);
      } catch {
        if (!cancelled) {
          setTokenURI(null);
          setMetadata(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contract, tokenId]);

  return { tokenURI, metadata, isLoading };
}
