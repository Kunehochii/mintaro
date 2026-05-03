import { Interface, type Log } from 'ethers';

export interface ReceiptLike {
  readonly logs: ReadonlyArray<Pick<Log, 'address' | 'topics' | 'data'>>;
}

const FUSED_INTERFACE = new Interface([
  'event Fused(uint256[5] burnedTokenIds, uint256 indexed newTokenId, address indexed minter)',
]);

export function parseFusedEvent(
  receipt: ReceiptLike,
  contractAddress: string,
): bigint | null {
  const target = contractAddress.toLowerCase();
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== target) continue;
    try {
      const parsed = FUSED_INTERFACE.parseLog({
        topics: [...log.topics],
        data: log.data,
      });
      if (parsed?.name === 'Fused') {
        return parsed.args.newTokenId as bigint;
      }
    } catch {
      // not a Fused log
    }
  }
  return null;
}
