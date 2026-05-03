'use client';

import { useWallet } from '@org/contract-client';
import GalleryGrid from './GalleryGrid';
import NotConnectedState from './NotConnectedState';
import WrongNetworkState from './WrongNetworkState';

export default function GalleryClient() {
  const { isConnected, isCorrectNetwork } = useWallet();
  if (!isConnected) return <NotConnectedState />;
  if (!isCorrectNetwork) return <WrongNetworkState />;
  return <GalleryGrid />;
}
