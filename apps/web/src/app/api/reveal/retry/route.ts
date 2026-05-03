import {
  createPublicClient,
  http,
  parseAbiItem,
  type Address,
  type Log,
} from 'viem';
import { getTokenURI } from '@/lib/reveal/relayer';
import { revealPipeline } from '@/lib/reveal/pipeline';

interface MintRequestedLog {
  eventName: 'MintRequested';
  args: {
    tokenId: bigint;
    minter: Address;
    seed: bigint;
  };
}

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

export async function POST(request: Request) {
  try {
    const secret = process.env.REVEAL_ADMIN_SECRET;
    if (!secret) {
      return Response.json(
        { error: 'REVEAL_ADMIN_SECRET not configured on server' },
        { status: 500 },
      );
    }

    const authHeader = request.headers.get('x-admin-secret');
    if (authHeader !== secret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const tokenIdParam = url.searchParams.get('tokenId');
    if (tokenIdParam === null) {
      return Response.json(
        { error: 'Missing tokenId query parameter' },
        { status: 400 },
      );
    }

    const tokenId = Number(tokenIdParam);
    if (!Number.isFinite(tokenId) || tokenId < 0) {
      return Response.json({ error: 'Invalid tokenId' }, { status: 400 });
    }

    const existingUri = await getTokenURI(tokenId);
    if (existingUri && existingUri !== '') {
      return Response.json({
        success: true,
        skip: true,
        message: 'URI already set on-chain',
      });
    }

    const client = getPublicClient();
    const contractAddress = getContractAddress();

    const logs = (await client.getLogs({
      address: contractAddress,
      event: parseAbiItem(
        'event MintRequested(uint256 indexed tokenId, address indexed minter, uint256 seed)',
      ),
      fromBlock: 0n,
      toBlock: 'latest',
      args: {
        tokenId: BigInt(tokenId),
      },
    })) as unknown as (Log & MintRequestedLog)[];

    if (logs.length === 0) {
      return Response.json(
        { error: `No MintRequested event found for tokenId ${tokenId}` },
        { status: 404 },
      );
    }

    const mintEvent = logs[0];
    const result = await revealPipeline(
      tokenId,
      mintEvent.args.seed,
      mintEvent.args.minter,
    );

    if (result.success) {
      return Response.json({
        success: true,
        txHash: result.txHash,
        affixes: result.affixes,
      });
    }

    return Response.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';
