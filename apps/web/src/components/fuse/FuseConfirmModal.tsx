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

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      className="rounded-card border border-vapor-purple/50 bg-vapor-surface/90 p-0 text-vapor-text backdrop:bg-vapor-bg/70 backdrop:backdrop-blur"
    >
      <div className="w-[min(92vw,28rem)] space-y-4 p-6">
        <h2 className="font-display text-lg uppercase tracking-wider text-vapor-pink">
          Confirm fusion
        </h2>
        <p className="font-body text-sm text-vapor-text/90">
          This will permanently burn these 5 NFTs.
        </p>
        <ul className="flex flex-wrap gap-2">
          {selected.map((id) => (
            <li
              key={id.toString()}
              className="rounded-btn border border-vapor-muted/40 px-2 py-1 font-mono text-xs text-vapor-muted"
            >
              #{id.toString().padStart(4, '0')}
            </li>
          ))}
        </ul>
        <p className="font-body text-xs text-vapor-muted">
          You&apos;ll receive one new NFT with at least one Rare-or-better
          affix.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="cursor-pointer rounded-btn border border-vapor-muted/40 px-4 py-2 font-display text-xs uppercase tracking-wider text-vapor-muted hover:text-vapor-cyan disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="cursor-pointer rounded-btn bg-vapor-pink px-5 py-2 font-display text-xs uppercase tracking-wider text-vapor-bg hover:shadow-glow-pink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
          >
            {busy ? 'Submitting…' : 'Confirm fuse'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
