import { mapFuseError } from './useFuse.js';

describe('mapFuseError', () => {
  it('maps a user-rejected tx to a friendly message', () => {
    const e = { code: 'ACTION_REJECTED', message: 'rejected' };
    expect(mapFuseError(e)).toBe('Transaction rejected.');
  });

  it('maps a contract revert to its reason', () => {
    const e = {
      code: 'CALL_EXCEPTION',
      reason: 'AffixNFT: cannot fuse high-tier token',
    };
    expect(mapFuseError(e)).toBe('AffixNFT: cannot fuse high-tier token');
  });

  it('falls back to the message field when no code/reason', () => {
    expect(mapFuseError(new Error('boom'))).toBe('boom');
  });

  it('returns a generic string for unknown shapes', () => {
    expect(mapFuseError({})).toBe('Failed to fuse.');
  });
});
