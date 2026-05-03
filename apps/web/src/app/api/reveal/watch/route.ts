import {
  createPublicClient,
  http,
  parseAbiItem,
  type Log,
  type Address,
} from 'viem';
import {
  getLastProcessedBlock,
  setLastProcessedBlock,
} from '@/lib/reveal/state';
import { getTokenURI } from '@/lib/reveal/relayer';
import { revealPipeline } from '@/lib/reveal/pipeline';

const BATCH_SIZE = 100;

function getPublicClient() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) throw new Error('SEPOLIA_RPC_URL is not set');
  return createPublicClient({ transport: http(rpcUrl) });
}

function getContractAddress(): Address {
  const addr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!addr) throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set');
  return addr as Address;
}

interface MintRequestedLog {
  eventName: 'MintRequested';
  args: {
    tokenId: bigint;
    minter: Address;
    seed: bigint;
  };
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

    const client = getPublicClient();
    const contractAddress = getContractAddress();
    const latestBlock = await client.getBlockNumber({ cacheTime: 0 });

    // If a specific fromBlock is provided by the caller (e.g. the mint page passing the
    // receipt block number), use it directly — bypasses stale last-block.json state.
    let fromBlock: bigint;
    if (fromBlockParam !== null) {
      fromBlock = BigInt(fromBlockParam);
    } else {
      const lastBlock = await getLastProcessedBlock();
      // Guard: if persisted lastBlock is ahead of the chain (Hardhat restart), reset to 0
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

    const logs = (await client.getLogs({
      address: contractAddress,
      event: parseAbiItem(
        'event MintRequested(uint256 indexed tokenId, address indexed minter, uint256 seed)',
      ),
      fromBlock,
      toBlock,
    })) as unknown as (Log & MintRequestedLog)[];

    for (const log of logs) {
      const tokenId = Number(log.args.tokenId);

      try {
        const existingUri = await getTokenURI(tokenId);
        if (existingUri && existingUri !== '') {
          results.push({ tokenId, success: true, skip: true });
          continue;
        }

        const result = await revealPipeline(
          tokenId,
          log.args.seed,
          log.args.minter,
        );

        results.push({
          tokenId,
          success: result.success,
          skip: result.skip,
          error: result.error,
          txHash: result.txHash,
        });
      } catch (error) {
        results.push({
          tokenId,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
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
