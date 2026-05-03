'use client';

import { useWallet, useAffixNFT } from '@org/contract-client';
import { useState, useCallback } from 'react';

export default function MintPage() {
  const {
    isMetaMaskInstalled,
    isConnected,
    isCorrectNetwork,
    connect,
    switchToSepolia,
    signer,
  } = useWallet();

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';
  const { mint, doMint, totalMinted } = useAffixNFT(
    isConnected && isCorrectNetwork ? signer : null,
    contractAddress || null,
  );

  const [retryTokenId, setRetryTokenId] = useState('');
  const [retryResult, setRetryResult] = useState<string | null>(null);

  const handleRetry = useCallback(async () => {
    const tokenId = Number(retryTokenId);
    if (!Number.isFinite(tokenId) || tokenId < 0) return;
    setRetryResult('Retrying...');
    try {
      const res = await fetch(`/api/reveal/retry?tokenId=${tokenId}`, {
        method: 'POST',
        headers: { 'x-admin-secret': 'mintaro-reveal-admin-secret' },
      });
      const data = await res.json();
      setRetryResult(JSON.stringify(data, null, 2));
    } catch (e: unknown) {
      setRetryResult(e instanceof Error ? e.message : 'Retry failed');
    }
  }, [retryTokenId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-24">
      <div className="w-full max-w-lg">
        {/* Header */}
        <h1 className="font-display text-4xl font-bold text-white text-center mb-2">
          Mint an Affix
        </h1>
        <p className="text-center text-vapor-muted mb-2">
          {totalMinted} minted so far
        </p>

        {/* Connect / Network */}
        {!isMetaMaskInstalled ? (
          <div className="text-center p-8">
            <p className="text-vapor-muted mb-4">MetaMask is required</p>
            <a
              href="https://metamask.io/download"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-btn bg-vapor-pink px-6 py-3 font-display font-semibold uppercase text-vapor-bg hover:shadow-glow-pink"
            >
              Install MetaMask
            </a>
          </div>
        ) : !isConnected ? (
          <div className="text-center p-8">
            <button
              type="button"
              onClick={connect}
              className="rounded-btn bg-vapor-pink px-8 py-4 font-display text-lg font-semibold uppercase text-vapor-bg hover:shadow-glow-pink transition-all"
            >
              Connect MetaMask
            </button>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="text-center p-8">
            <p className="text-amber-300 mb-4">Wrong network detected</p>
            <button
              type="button"
              onClick={switchToSepolia}
              className="rounded-btn border border-vapor-purple px-6 py-3 font-display uppercase text-vapor-purple hover:shadow-glow-purple transition-all"
            >
              Switch to Sepolia
            </button>
          </div>
        ) : (
          <>
            {/* Connected + Mint */}
            <div className="rounded-card border border-vapor-purple/30 bg-vapor-surface/60 backdrop-blur-xl p-6">
              {/* Mint Button */}
              <button
                type="button"
                disabled={
                  mint.status === 'pending' ||
                  mint.status === 'confirming' ||
                  mint.status === 'revealing'
                }
                onClick={doMint}
                className="w-full rounded-btn bg-vapor-mint px-6 py-4 font-display text-lg font-bold uppercase text-vapor-bg transition-all hover:shadow-glow-mint disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mint.status === 'pending'
                  ? 'Confirm in MetaMask...'
                  : mint.status === 'confirming'
                    ? 'Confirming on chain...'
                    : mint.status === 'revealing'
                      ? 'Revealing artwork...'
                      : 'Mint for Free'}
              </button>

              {/* Status */}
              {mint.txHash && (
                <p className="mt-3 font-mono text-xs text-vapor-cyan break-all">
                  Tx:{' '}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${mint.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {mint.txHash.slice(0, 10)}...{mint.txHash.slice(-6)}
                  </a>
                </p>
              )}

              {/* Revealed Artwork */}
              {mint.status === 'revealed' && mint.imageUrl && (
                <div className="mt-4">
                  <img
                    src={mint.imageUrl}
                    alt={`Affix #${mint.tokenId}`}
                    className="w-full rounded-lg border border-vapor-purple/40"
                  />
                  <p className="mt-2 text-center font-display text-vapor-cyan">
                    Affix #{mint.tokenId} revealed!
                  </p>
                </div>
              )}

              {/* Revealing spinner */}
              {mint.status === 'revealing' && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="size-12 animate-spin rounded-full border-4 border-vapor-purple/30 border-t-vapor-mint" />
                  <p className="font-mono text-sm text-vapor-muted">
                    Waiting for AI to generate artwork...
                  </p>
                </div>
              )}

              {/* Error */}
              {mint.status === 'failed' && mint.error && (
                <div className="mt-4 rounded-lg bg-red-900/40 border border-red-500/40 p-4">
                  <p className="font-mono text-sm text-red-300">{mint.error}</p>
                  <p className="mt-2 font-mono text-xs text-vapor-muted">
                    You can retry the reveal manually below.
                  </p>
                </div>
              )}
            </div>

            {/* Admin Retry */}
            <details className="mt-6 rounded-card border border-vapor-purple/20 bg-vapor-surface/40 p-4">
              <summary className="cursor-pointer font-display text-sm uppercase tracking-wider text-vapor-muted hover:text-vapor-cyan">
                Retry Failed Reveal
              </summary>
              <div className="mt-4 flex gap-3">
                <input
                  type="number"
                  placeholder="Token ID"
                  value={retryTokenId}
                  onChange={(e) => setRetryTokenId(e.target.value)}
                  className="flex-1 rounded-btn border border-vapor-purple/30 bg-vapor-bg px-4 py-2 font-mono text-sm text-white placeholder:text-vapor-muted focus:border-vapor-cyan focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-btn bg-vapor-purple px-4 py-2 font-display text-xs uppercase text-white hover:shadow-glow-purple transition-all"
                >
                  Retry
                </button>
              </div>
              {retryResult && (
                <pre className="mt-3 overflow-auto rounded bg-vapor-bg p-3 font-mono text-xs text-vapor-muted">
                  {retryResult}
                </pre>
              )}
            </details>
          </>
        )}
      </div>
    </div>
  );
}
