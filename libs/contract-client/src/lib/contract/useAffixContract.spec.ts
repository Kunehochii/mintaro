/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { useAffixContract } from './useAffixContract.js';

jest.mock('../wallet/useWallet.js', () => ({
  useWallet: () => ({ provider: null, signer: null }),
}));

describe('useAffixContract', () => {
  it('returns null when no provider is available', () => {
    const { result } = renderHook(() => useAffixContract());
    expect(result.current).toBeNull();
  });
});
