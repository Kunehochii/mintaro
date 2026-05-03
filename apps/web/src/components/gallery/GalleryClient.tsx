'use client';

import { useWallet } from '@org/contract-client';
import GalleryGrid from './GalleryGrid.js';
import NotConnectedState from './NotConnectedState.js';
import WrongNetworkState from './WrongNetworkState.js';

export default function GalleryClient() {
  const { isConnected, isCorrectNetwork } = useWallet();
  if (!isConnected) return <NotConnectedState />;
  if (!isCorrectNetwork) return <WrongNetworkState />;
  return <GalleryGrid />;
}
