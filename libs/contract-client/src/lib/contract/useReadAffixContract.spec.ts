/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { useReadAffixContract } from './useReadAffixContract.js';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('useReadAffixContract', () => {
  it('returns null when NEXT_PUBLIC_CONTRACT_ADDRESS is missing', () => {
    delete process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    process.env.NEXT_PUBLIC_RPC_URL = 'https://rpc.sepolia.org';
    const { result } = renderHook(() => useReadAffixContract());
    expect(result.current).toBeNull();
  });

  it('returns null when NEXT_PUBLIC_RPC_URL is missing', () => {
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS =
      '0x0000000000000000000000000000000000000001';
    delete process.env.NEXT_PUBLIC_RPC_URL;
    const { result } = renderHook(() => useReadAffixContract());
    expect(result.current).toBeNull();
  });

  it('returns an AffixNFT contract instance when both env vars are set', () => {
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS =
      '0x0000000000000000000000000000000000000001';
    process.env.NEXT_PUBLIC_RPC_URL = 'https://rpc.sepolia.org';
    const { result } = renderHook(() => useReadAffixContract());
    expect(result.current).not.toBeNull();
    expect(typeof result.current?.getAffixes).toBe('function');
  });
});
