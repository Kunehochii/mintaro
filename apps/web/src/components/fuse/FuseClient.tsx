'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFuse, useWallet } from '@org/contract-client';
import {
  FusionSelectionProvider,
  useFusionSelection,
} from './selectionContext';
import NotConnectedState from '../gallery/NotConnectedState';
import WrongNetworkState from '../gallery/WrongNetworkState';
import FuseGrid from './FuseGrid';
import FuseToolbar from './FuseToolbar';
import FuseConfirmModal from './FuseConfirmModal';
import FuseTxToast from './FuseTxToast';

function FuseInner() {
  const router = useRouter();
  const { selected, clear } = useFusionSelection();
  const { fuse, status, reset } = useFuse();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const busy = status.kind === 'awaiting-signature' || status.kind === 'mining';

  useEffect(() => {
    if (status.kind !== 'success') return undefined;
    setConfirmOpen(false);
    const id = status.newTokenId.toString();
    const t = setTimeout(() => {
      clear();
      reset();
      router.push(`/gallery/${id}`);
    }, 800);
    return () => clearTimeout(t);
  }, [status, clear, reset, router]);

  return (
    <>
      <FuseGrid />
      <FuseToolbar onFuse={() => setConfirmOpen(true)} />
      <FuseConfirmModal
        open={confirmOpen}
        selected={selected}
        busy={busy}
        onCancel={() => {
          if (!busy) setConfirmOpen(false);
        }}
        onConfirm={() => fuse(selected)}
      />
      <FuseTxToast status={status} onDismiss={reset} />
    </>
  );
}

export default function FuseClient() {
  const { isConnected, isCorrectNetwork } = useWallet();
  if (!isConnected) return <NotConnectedState />;
  if (!isCorrectNetwork) return <WrongNetworkState />;
  return (
    <FusionSelectionProvider>
      <FuseInner />
    </FusionSelectionProvider>
  );
}
