'use client';

import { useWallet, useAffixNFT } from '@org/contract-client';
import { useState, useCallback } from 'react';
import RevealCard from '../../components/RevealCard';

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
  const { mint, doMint, totalMinted, mintPriceFormatted, retryReveal } =
    useAffixNFT(
      isConnected && isCorrectNetwork ? signer : null,
      contractAddress || null,
    );

  const [retryTokenId, setRetryTokenId] = useState('');
  const [retryResult, setRetryResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [showAdminRetry, setShowAdminRetry] = useState(false);

  const handleAdminRetry = useCallback(async () => {
    const tokenId = Number(retryTokenId);
    if (!Number.isFinite(tokenId) || tokenId < 0) return;
    setRetryResult({ ok: false, message: 'Retrying...' });
    try {
      const adminSecret = process.env.NEXT_PUBLIC_REVEAL_ADMIN_SECRET ?? '';
      const res = await fetch(`/api/reveal/retry?tokenId=${tokenId}`, {
        method: 'POST',
        headers: { 'x-admin-secret': adminSecret },
      });
      const data = (await res.json()) as Record<string, unknown>;

      if (data.success) {
        if (data.skip) {
          setRetryResult({
            ok: true,
            message: `Token #${tokenId} already revealed on-chain`,
          });
        } else {
          const tx =
            typeof data.txHash === 'string'
              ? data.txHash.slice(0, 10) + '...'
              : '';
          setRetryResult({
            ok: true,
            message: `Reveal pipeline triggered for token #${tokenId} ${tx}`,
          });
        }
      } else {
        const err =
          typeof data.error === 'string' ? data.error : 'Unknown error';
        setRetryResult({ ok: false, message: err });
      }
    } catch (e: unknown) {
      setRetryResult({
        ok: false,
        message: e instanceof Error ? e.message : 'Network error',
      });
    }
  }, [retryTokenId]);

  const priceLabel = mintPriceFormatted
    ? `Mint for ${mintPriceFormatted} ETH`
    : 'Mint';

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
                      : priceLabel}
              </button>

              {/* Tx Hash */}
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

              {/* Reveal Card */}
              {(mint.status === 'revealing' || mint.status === 'revealed') && (
                <RevealCard
                  tokenId={mint.tokenId}
                  imageUrl={mint.imageUrl}
                  affixes={mint.affixes}
                  animationPlayed={mint.animationPlayed}
                />
              )}

              {/* Error + Retry */}
              {mint.status === 'failed' && mint.tokenId != null && (
                <div className="mt-4 rounded-lg bg-red-900/40 border border-red-500/40 p-4">
                  <p className="font-mono text-sm text-red-300">
                    {mint.error || 'Reveal timed out.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (mint.tokenId != null) retryReveal(mint.tokenId);
                    }}
                    className="mt-3 w-full rounded-btn border border-vapor-cyan px-4 py-2 font-display text-sm uppercase text-vapor-cyan hover:shadow-glow-cyan transition-all"
                  >
                    Retry Reveal
                  </button>
                </div>
              )}

              {/* Error without tokenId (transaction failed) */}
              {mint.status === 'failed' && mint.tokenId == null && (
                <div className="mt-4 rounded-lg bg-red-900/40 border border-red-500/40 p-4">
                  <p className="font-mono text-sm text-red-300">
                    {mint.error || 'Transaction failed.'}
                  </p>
                </div>
              )}
            </div>

            {/* Dev Tools — tree-shaken out of production bundles */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 border-t border-vapor-purple/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdminRetry(!showAdminRetry)}
                  className="font-mono text-xs tracking-wider text-vapor-muted/40 hover:text-vapor-muted transition-colors uppercase"
                >
                  Dev Tools
                </button>

                {showAdminRetry && (
                  <div className="mt-3 rounded-card border border-vapor-purple/15 bg-vapor-surface/30 p-4">
                    {process.env.NEXT_PUBLIC_REVEAL_ADMIN_SECRET ? (
                      <>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            placeholder="Token ID"
                            value={retryTokenId}
                            onChange={(e) => setRetryTokenId(e.target.value)}
                            className="flex-1 rounded-btn border border-vapor-purple/20 bg-vapor-bg px-4 py-2 font-mono text-sm text-white placeholder:text-vapor-muted/50 focus:border-vapor-cyan focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAdminRetry}
                            className="rounded-btn bg-vapor-purple/80 px-4 py-2 font-display text-xs uppercase text-white hover:bg-vapor-purple hover:shadow-glow-purple transition-all"
                          >
                            Retry
                          </button>
                        </div>
                        {retryResult && (
                          <p
                            className={`mt-3 font-mono text-xs ${retryResult.ok ? 'text-vapor-mint' : 'text-red-400'}`}
                          >
                            {retryResult.ok ? '\u2713 ' : '\u2717 '}
                            {retryResult.message}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="font-mono text-xs text-vapor-muted">
                        Admin retry not configured. Set
                        NEXT_PUBLIC_REVEAL_ADMIN_SECRET in .env.local.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
