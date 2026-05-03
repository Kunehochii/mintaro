import { promises as fs } from 'node:fs';
import path from 'node:path';

const STATE_FILE = path.resolve(process.cwd(), 'apps/web/data/last-block.json');

async function ensureDataDir(): Promise<void> {
  const dir = path.dirname(STATE_FILE);
  await fs.mkdir(dir, { recursive: true });
}

export async function getLastProcessedBlock(): Promise<bigint> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.lastBlock === 'number' ||
      typeof parsed.lastBlock === 'bigint'
    ) {
      return BigInt(parsed.lastBlock);
    }
    return 0n;
  } catch {
    return 0n;
  }
}

export async function setLastProcessedBlock(block: bigint): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(
    STATE_FILE,
    JSON.stringify({
      lastBlock: Number(block),
      updatedAt: new Date().toISOString(),
    }) + '\n',
    'utf-8',
  );
}
