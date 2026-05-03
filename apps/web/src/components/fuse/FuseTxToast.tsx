'use client';

import type { FuseStatus } from '@org/contract-client';

const ETHERSCAN_BASE = 'https://sepolia.etherscan.io/tx/';

export default function FuseTxToast({
  status,
  onDismiss,
}: {
  status: FuseStatus;
  onDismiss: () => void;
}) {
  if (status.kind === 'idle') return null;

  let title: string;
  let detail: React.ReactNode;
  let tone = 'border-vapor-cyan/40 text-vapor-cyan';

  switch (status.kind) {
    case 'awaiting-signature':
      title = 'Confirm in MetaMask';
      detail = 'Approve the transaction in your wallet.';
      break;
    case 'mining':
      title = 'Fusing…';
      detail = (
        <a
          href={`${ETHERSCAN_BASE}${status.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer underline hover:text-vapor-pink"
        >
          View transaction on Etherscan
        </a>
      );
      break;
    case 'success':
      title = 'Fusion complete';
      detail = `New token #${status.newTokenId.toString()} — redirecting…`;
      tone = 'border-vapor-mint/50 text-vapor-mint';
      break;
    case 'error':
      title = 'Fusion failed';
      detail = status.message;
      tone = 'border-red-500/50 text-red-300';
      break;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-1/2 z-30 w-[min(92vw,28rem)] -translate-x-1/2 rounded-card border bg-vapor-surface/90 p-4 backdrop-blur-xl ${tone}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xs uppercase tracking-wider">
            {title}
          </h3>
          <p className="mt-1 font-body text-xs text-vapor-text/90">{detail}</p>
        </div>
        {(status.kind === 'success' || status.kind === 'error') && (
          <button
            type="button"
            onClick={onDismiss}
            className="cursor-pointer rounded-btn border border-vapor-muted/40 px-2 py-1 font-display text-[10px] uppercase tracking-wider text-vapor-muted hover:text-vapor-cyan"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
