'use client';

import { useWallet, truncateAddress } from '@org/contract-client';

export default function WalletConnect() {
  const {
    isMetaMaskInstalled,
    isConnected,
    isCorrectNetwork,
    address,
    error,
    connect,
    switchToSepolia,
  } = useWallet();

  if (!isMetaMaskInstalled) {
    return (
      <div>
        <a
          href="https://metamask.io/download"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer rounded-btn border border-vapor-cyan px-4 py-2 font-display text-xs uppercase tracking-wider text-vapor-cyan transition-all duration-150 hover:shadow-glow-cyan"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-pointer rounded-btn bg-vapor-pink px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider text-vapor-bg transition-all duration-150 hover:shadow-glow-pink"
          onClick={connect}
        >
          Connect
        </button>
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center gap-3 rounded-btn bg-amber-900/60 px-3 py-2">
        <span className="font-mono text-xs text-amber-300">Wrong network</span>
        <button
          type="button"
          className="cursor-pointer rounded-btn border border-vapor-purple px-3 py-1.5 font-display text-xs uppercase tracking-wider text-vapor-purple transition-all duration-150 hover:shadow-glow-purple"
          onClick={switchToSepolia}
        >
          Switch to Sepolia
        </button>
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-full bg-vapor-mint shadow-glow-mint" />
      {address && (
        <span className="font-mono text-sm text-vapor-cyan">
          {truncateAddress(address)}
        </span>
      )}
      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
    </div>
  );
}
