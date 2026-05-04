import { getTokenURI } from '@/lib/reveal/relayer';
import { revealPipeline } from '@/lib/reveal/pipeline';
import { findMintRequested } from '@/lib/reveal/events';

type Address = `0x${string}`;

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

    const logs = await findMintRequested(tokenId);

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
      mintEvent.args.minter as Address,
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
