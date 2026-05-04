import { reduceOwnedTokens, type TransferEvent } from './useUserTokens.js';

const T = (
  from: string,
  to: string,
  tokenId: bigint,
  blockNumber: number,
  logIndex: number,
): TransferEvent => ({ from, to, tokenId, blockNumber, logIndex });

const ME = '0xme';
const OTHER = '0xother';

describe('reduceOwnedTokens', () => {
  it('returns empty array when no events involve the address', () => {
    expect(reduceOwnedTokens([], ME)).toEqual([]);
  });

  it('includes a token received and never sent', () => {
    const events = [T('0x0', ME, 1n, 10, 0)];
    expect(reduceOwnedTokens(events, ME).map((t) => t.tokenId)).toEqual([1n]);
  });

  it('excludes a token received then sent away', () => {
    const events = [T('0x0', ME, 1n, 10, 0), T(ME, OTHER, 1n, 11, 0)];
    expect(reduceOwnedTokens(events, ME)).toEqual([]);
  });

  it('includes a token sent then re-received', () => {
    const events = [
      T('0x0', ME, 1n, 10, 0),
      T(ME, OTHER, 1n, 11, 0),
      T(OTHER, ME, 1n, 12, 0),
    ];
    expect(reduceOwnedTokens(events, ME).map((t) => t.tokenId)).toEqual([1n]);
  });

  it('orders results by most recent acquisition first', () => {
    const events = [
      T('0x0', ME, 1n, 10, 0),
      T('0x0', ME, 2n, 12, 0),
      T('0x0', ME, 3n, 11, 0),
    ];
    expect(reduceOwnedTokens(events, ME).map((t) => t.tokenId)).toEqual([
      2n,
      3n,
      1n,
    ]);
  });

  it('treats addresses case-insensitively', () => {
    const events = [T('0x0', '0xME', 1n, 10, 0)];
    expect(reduceOwnedTokens(events, '0xme').map((t) => t.tokenId)).toEqual([
      1n,
    ]);
  });
});
