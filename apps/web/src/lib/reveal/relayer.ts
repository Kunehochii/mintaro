import {
  createWalletClient,
  createPublicClient,
  http,
  encodeFunctionData,
  type Address,
  type WalletClient,
  type PublicClient,
  type Hash,
  type Chain,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia, hardhat } from 'viem/chains';

let walletClient: WalletClient | null = null;
let publicClient: PublicClient | null = null;
let relayerAccount: ReturnType<typeof privateKeyToAccount> | null = null;

function getAccount(): ReturnType<typeof privateKeyToAccount> {
  if (!relayerAccount) {
    const privateKey = process.env.RELAYER_PRIVATE_KEY;
    if (!privateKey)
      throw new Error('RELAYER_PRIVATE_KEY environment variable is not set');
    relayerAccount = privateKeyToAccount(privateKey as `0x${string}`);
  }
  return relayerAccount;
}

function getChain(): Chain {
  const rpcUrl = process.env.SEPOLIA_RPC_URL ?? '';
  // Auto-detect local Hardhat node
  if (
    rpcUrl.includes('127.0.0.1') ||
    rpcUrl.includes('localhost') ||
    rpcUrl.includes('::1')
  ) {
    return hardhat;
  }
  return sepolia;
}

let nonceMutex = false;
let nonceCache: number | null = null;

async function acquireNonce(): Promise<number> {
  while (nonceMutex) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  nonceMutex = true;

  try {
    const client = getPublicClient();
    const account = getAccount();
    const nonce =
      nonceCache ??
      (await client.getTransactionCount({ address: account.address }));
    nonceCache = nonce + 1;
    return nonce;
  } finally {
    nonceMutex = false;
  }
}

function getPublicClient(): PublicClient {
  if (!publicClient) {
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    if (!rpcUrl)
      throw new Error('SEPOLIA_RPC_URL environment variable is not set');
    publicClient = createPublicClient({ transport: http(rpcUrl) });
  }
  return publicClient;
}

function getWalletClient(): WalletClient {
  if (!walletClient) {
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    if (!rpcUrl)
      throw new Error('SEPOLIA_RPC_URL environment variable is not set');
    const chain = getChain();
    const account = getAccount();
    walletClient = createWalletClient({
      account,
      chain,
      transport: http(rpcUrl),
    });
  }
  return walletClient;
}

const AFFIX_NFT_ABI = [
  {
    type: 'function',
    name: 'setTokenURI',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'uri', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const;

function getContractAddress(): Address {
  const addr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!addr) {
    throw new Error(
      'NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is not set',
    );
  }
  return addr as Address;
}

export async function setTokenURI(tokenId: number, uri: string): Promise<Hash> {
  const wallet = getWalletClient();
  const account = getAccount();
  const chain = getChain();
  const address = getContractAddress();
  const nonce = await acquireNonce();

  const hash = await wallet.sendTransaction({
    account,
    to: address,
    data: encodeSetTokenURI(tokenId, uri),
    nonce,
    chain,
  });

  const publicCli = getPublicClient();
  await publicCli.waitForTransactionReceipt({ hash, confirmations: 1 });

  nonceCache = null;
  return hash;
}

function encodeSetTokenURI(tokenId: number, uri: string): `0x${string}` {
  return encodeFunctionData({
    abi: AFFIX_NFT_ABI,
    functionName: 'setTokenURI',
    args: [BigInt(tokenId), uri],
  });
}

export async function getTokenURI(tokenId: number): Promise<string> {
  const client = getPublicClient();
  const address = getContractAddress();

  try {
    const result = await client.readContract({
      address,
      abi: AFFIX_NFT_ABI,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });
    return result as string;
  } catch {
    return '';
  }
}

export async function tokenExists(tokenId: number): Promise<boolean> {
  const client = getPublicClient();
  const address = getContractAddress();

  try {
    await client.readContract({
      address,
      abi: AFFIX_NFT_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    });
    return true;
  } catch {
    return false;
  }
}
