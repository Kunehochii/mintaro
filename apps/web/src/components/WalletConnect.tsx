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
      <div className="wallet-connect">
        <a
          href="https://metamask.io/download"
          target="_blank"
          rel="noopener noreferrer"
          className="wallet-button wallet-button--install"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="wallet-connect">
        <button type="button" className="wallet-button" onClick={connect}>
          Connect MetaMask
        </button>
        {error && <p className="wallet-error">{error}</p>}
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="wallet-connect wallet-connect--wrong-network">
        <span className="wallet-banner">Wrong network</span>
        <button
          type="button"
          className="wallet-button wallet-button--switch"
          onClick={switchToSepolia}
        >
          Switch to Sepolia
        </button>
        {error && <p className="wallet-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      {address && <span className="wallet-address">{truncateAddress(address)}</span>}
      {error && <p className="wallet-error">{error}</p>}
    </div>
  );
}
