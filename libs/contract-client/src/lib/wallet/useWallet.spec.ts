import { truncateAddress } from './format.js';

describe('truncateAddress', () => {
  it('returns the full address if it is 10 characters or fewer', () => {
    expect(truncateAddress('0x1234')).toBe('0x1234');
    expect(truncateAddress('0x12345678')).toBe('0x12345678');
  });

  it('truncates a longer address to the first 6 and last 4 characters', () => {
    expect(truncateAddress('0x1234567890abcdef')).toBe('0x1234\u2026cdef');
  });

  it('handles a standard Ethereum address (42 chars)', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    expect(truncateAddress(addr)).toBe('0x1234\u20265678');
  });
});
