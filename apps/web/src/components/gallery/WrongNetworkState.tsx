'use client';

import { useWallet } from '@org/contract-client';

export default function WrongNetworkState() {
  const { switchToSepolia } = useWallet();
  return (
    <div className="mx-auto max-w-md rounded-card border border-amber-500/40 bg-amber-900/30 p-6 text-center">
      <p className="font-body text-amber-300">You're on the wrong network.</p>
      <button
        type="button"
        onClick={switchToSepolia}
        className="mt-3 cursor-pointer rounded-btn border border-vapor-purple px-4 py-2 font-display text-xs uppercase tracking-wider text-vapor-purple hover:shadow-glow-purple"
      >
        Switch to Sepolia
      </button>
    </div>
  );
}
