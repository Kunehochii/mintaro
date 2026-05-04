import {
  getLastProcessedBlock,
  setLastProcessedBlock,
} from '@/lib/reveal/state';
import { getTokenURI } from '@/lib/reveal/relayer';
import { revealPipeline } from '@/lib/reveal/pipeline';
import { getProvider, findMintRequestedRange } from '@/lib/reveal/events';

type Address = `0x${string}`;

const BATCH_SIZE = 10;
const CONCURRENCY = 3;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let cursor = 0;

  async function runNext(): Promise<void> {
    while (cursor < items.length) {
      const idx = cursor++;
      try {
        const value = await fn(items[idx]);
        results[idx] = { status: 'fulfilled', value };
      } catch (reason) {
        results[idx] = { status: 'rejected', reason };
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runNext(),
  );
  await Promise.all(workers);
  return results;
}

export async function GET(request: Request) {
  const results: Array<{
    tokenId: number;
    success: boolean;
    skip?: boolean;
    error?: string;
    txHash?: string;
  }> = [];

  try {
    const url = new URL(request.url);
    const fromBlockParam = url.searchParams.get('fromBlock');
    const toBlockParam = url.searchParams.get('toBlock');
    const subject = url.searchParams.get('subject') ?? undefined;

    const provider = getProvider();
    const latestBlock = BigInt(await provider.getBlockNumber());

    let fromBlock: bigint;
    if (fromBlockParam !== null) {
      fromBlock = BigInt(fromBlockParam);
    } else {
      const lastBlock = await getLastProcessedBlock();
      const safeLastBlock = lastBlock > latestBlock ? 0n : lastBlock;
      fromBlock = safeLastBlock + 1n;
    }

    if (fromBlock > latestBlock) {
      return Response.json({
        processed: 0,
        latestBlock: Number(latestBlock),
        message: 'No new blocks',
      });
    }

    const toBlock =
      toBlockParam !== null
        ? toBlockParam === 'latest'
          ? latestBlock
          : BigInt(toBlockParam)
        : fromBlock + BigInt(BATCH_SIZE) > latestBlock
          ? latestBlock
          : fromBlock + BigInt(BATCH_SIZE);

    const logs = await findMintRequestedRange(fromBlock, toBlock);

    const settled = await mapWithConcurrency(logs, CONCURRENCY, async (log) => {
      const tokenId = Number(log.args.tokenId);

      const existingUri = await getTokenURI(tokenId);
      if (existingUri && existingUri !== '') {
        return { tokenId, success: true, skip: true } as const;
      }

      const result = await revealPipeline(
        tokenId,
        log.args.seed,
        log.args.minter as Address,
        subject,
      );

      return {
        tokenId,
        success: result.success,
        skip: result.skip,
        error: result.error,
        txHash: result.txHash,
      } as const;
    });

    for (const s of settled) {
      if (s.status === 'fulfilled') {
        results.push(s.value);
      } else {
        const err =
          s.reason instanceof Error ? s.reason.message : String(s.reason);
        results.push({ tokenId: -1, success: false, error: err });
      }
    }

    await setLastProcessedBlock(toBlock);

    return Response.json({
      processed: results.length,
      fromBlock: Number(fromBlock),
      toBlock: Number(toBlock),
      latestBlock: Number(latestBlock),
      results,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';
