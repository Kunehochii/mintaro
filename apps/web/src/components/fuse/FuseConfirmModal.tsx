'use client';

import { useEffect, useRef } from 'react';

export interface FuseConfirmModalProps {
  open: boolean;
  selected: readonly bigint[];
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}

export default function FuseConfirmModal({
  open,
  selected,
  onCancel,
  onConfirm,
  busy,
}: FuseConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
      cancelBtnRef.current?.focus();
    }
    if (!open && dlg.open) dlg.close();
  }, [open]);

  // Block ESC dismissal while a tx is in flight (cancel event fires on ESC).
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const handler = (e: Event) => {
      if (busy) e.preventDefault();
    };
    dlg.addEventListener('cancel', handler);
    return () => dlg.removeEventListener('cancel', handler);
  }, [busy]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      aria-labelledby="fuse-confirm-title"
      aria-describedby="fuse-confirm-desc"
      className="rounded-card border border-vapor-pink/50 bg-vapor-surface/95 p-0 text-vapor-text shadow-glow-pink backdrop:bg-vapor-bg/70 backdrop:backdrop-blur"
    >
      <div className="w-[min(92vw,28rem)] space-y-4 p-5 sm:p-6">
        <h2
          id="fuse-confirm-title"
          className="font-display text-base uppercase tracking-wider text-vapor-pink glow-text-pink sm:text-lg"
        >
          Confirm fusion
        </h2>
        <p
          id="fuse-confirm-desc"
          className="font-body text-sm leading-relaxed text-vapor-text/90"
        >
          This will{' '}
          <span className="font-semibold text-vapor-gold">
            permanently burn
          </span>{' '}
          these {selected.length} NFTs. This action cannot be undone.
        </p>
        <ul className="flex flex-wrap gap-1.5" aria-label="NFTs to be burned">
          {selected.map((id) => (
            <li
              key={id.toString()}
              className="rounded-btn border border-vapor-muted/40 bg-vapor-bg/40 px-2 py-1 font-mono text-[11px] text-vapor-muted"
            >
              #{id.toString().padStart(4, '0')}
            </li>
          ))}
        </ul>
        <p className="font-body text-xs leading-relaxed text-vapor-muted">
          You&apos;ll receive one new NFT with at least one Rare-or-better
          affix.
        </p>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="cursor-pointer rounded-btn border border-vapor-muted/40 px-4 py-2 font-display text-xs uppercase tracking-wider text-vapor-muted transition-colors duration-150 hover:text-vapor-cyan disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-vapor-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
            className="cursor-pointer rounded-btn bg-vapor-pink px-5 py-2 font-display text-xs uppercase tracking-wider text-vapor-bg transition-all duration-150 hover:shadow-glow-pink disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
          >
            {busy ? 'Submitting…' : 'Confirm fuse'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
