import type { Eip1193Provider } from 'ethers';

export interface MetaMaskProvider extends Eip1193Provider {
  isMetaMask?: boolean;
  selectedAddress?: string;
  on(event: string, listener: (...args: unknown[]) => void): void;
  removeListener(event: string, listener: (...args: unknown[]) => void): void;
}

export type { Eip1193Provider };
