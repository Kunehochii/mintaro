import { JsonRpcProvider, Wallet, type ContractRunner } from 'ethers';
import { AffixNFT__factory, type AffixNFT } from '@org/shared-types';

function deploymentBlock(): number {
  const raw = process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK;
  if (!raw) throw new Error('NEXT_PUBLIC_DEPLOYMENT_BLOCK is not set');
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw new Error(
      `NEXT_PUBLIC_DEPLOYMENT_BLOCK must be a non-negative integer, got "${raw}".`,
    );
  }
  return n;
}

let _provider: JsonRpcProvider | null = null;

export function getProvider(): JsonRpcProvider {
  if (!_provider) {
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    if (!rpcUrl) throw new Error('SEPOLIA_RPC_URL is not set');
    _provider = new JsonRpcProvider(rpcUrl);
  }
  return _provider;
}

export function getContractAddress(): string {
  const addr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!addr) throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set');
  return addr;
}

export function getContract(runner?: ContractRunner): AffixNFT {
  return AffixNFT__factory.connect(
    getContractAddress(),
    runner ?? getProvider(),
  );
}

export function getWallet(): Wallet {
  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  if (!privateKey)
    throw new Error('RELAYER_PRIVATE_KEY environment variable is not set');
  return new Wallet(privateKey, getProvider());
}

export async function findMintRequested(tokenId: number) {
  const contract = getContract();
  const filter = contract.filters.MintRequested(BigInt(tokenId));
  return contract.queryFilter(filter, deploymentBlock());
}

export async function findMintRequestedRange(
  fromBlock: number | bigint,
  toBlock: number | bigint | 'latest',
) {
  const contract = getContract();
  const filter = contract.filters.MintRequested();
  return contract.queryFilter(
    filter,
    Number(fromBlock),
    toBlock === 'latest' ? 'latest' : Number(toBlock),
  );
}
