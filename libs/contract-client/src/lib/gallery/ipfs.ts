export function resolveIpfsUri(
  uri: string | undefined,
  gateway: string,
): string | null {
  if (!uri) return null;
  if (uri.startsWith('ipfs://')) {
    const path = uri.slice('ipfs://'.length);
    const base = gateway.endsWith('/') ? gateway : `${gateway}/`;
    return `${base}${path}`;
  }
  return uri;
}
