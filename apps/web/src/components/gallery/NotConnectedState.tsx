'use client';

import { useWallet } from '@org/contract-client';

export default function NotConnectedState() {
  const { connect, isMetaMaskInstalled } = useWallet();
  if (!isMetaMaskInstalled) {
    return (
      <div className="mx-auto max-w-md rounded-card border border-vapor-purple/30 bg-vapor-surface/60 p-10 text-center">
        <p className="font-body text-vapor-muted">
          MetaMask is required to view your collection.
        </p>
        <a
          href="https://metamask.io/download"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block cursor-pointer rounded-btn border border-vapor-cyan px-4 py-2 font-display text-xs uppercase tracking-wider text-vapor-cyan hover:shadow-glow-cyan"
        >
          Install MetaMask
        </a>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md rounded-card border border-vapor-purple/30 bg-vapor-surface/60 p-10 text-center backdrop-blur-md">
      <h2 className="font-display text-lg uppercase tracking-wider text-vapor-text">
        Connect to view your collection
      </h2>
      <button
        type="button"
        onClick={connect}
        className="mt-4 cursor-pointer rounded-btn bg-vapor-pink px-5 py-2 font-display text-xs uppercase tracking-wider text-vapor-bg hover:shadow-glow-pink"
      >
        Connect MetaMask
      </button>
    </div>
  );
}
