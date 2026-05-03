import { Interface } from 'ethers';
import { parseFusedEvent } from './parseFusedEvent.js';

const iface = new Interface([
  'event Fused(uint256[5] burnedTokenIds, uint256 indexed newTokenId, address indexed minter)',
]);

function makeLog(
  burned: bigint[],
  newTokenId: bigint,
  minter: string,
  address = '0xCONTRACT',
) {
  const fragment = iface.getEvent('Fused');
  if (!fragment) throw new Error('event fragment not found');
  const encoded = iface.encodeEventLog(fragment, [burned, newTokenId, minter]);
  return {
    address,
    topics: encoded.topics,
    data: encoded.data,
  };
}

describe('parseFusedEvent', () => {
  it('returns the newTokenId from a receipt that contains a Fused log', () => {
    const log = makeLog(
      [0n, 1n, 2n, 3n, 4n],
      99n,
      '0x000000000000000000000000000000000000beef',
    );
    const id = parseFusedEvent({ logs: [log] }, '0xCONTRACT');
    expect(id).toBe(99n);
  });

  it('ignores logs from other addresses', () => {
    const log = makeLog(
      [0n, 1n, 2n, 3n, 4n],
      99n,
      '0x000000000000000000000000000000000000beef',
      '0xOTHER',
    );
    expect(parseFusedEvent({ logs: [log] }, '0xCONTRACT')).toBeNull();
  });

  it('returns null when no Fused log is present', () => {
    expect(parseFusedEvent({ logs: [] }, '0xCONTRACT')).toBeNull();
  });

  it('matches contract address case-insensitively', () => {
    const log = makeLog(
      [0n, 1n, 2n, 3n, 4n],
      42n,
      '0x000000000000000000000000000000000000beef',
      '0xabc',
    );
    expect(parseFusedEvent({ logs: [log] }, '0xABC')).toBe(42n);
  });
});
