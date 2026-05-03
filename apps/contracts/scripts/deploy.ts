import { ethers, network, run } from 'hardhat';
import fs from 'fs';
import path from 'path';

interface Deployment {
  address: string;
  deployer: string;
  blockNumber: number;
  txHash: string;
  deployedAt: string;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`\nDeployer: ${deployer.address}`);
  console.log(
    `Network:  ${network.name} (chainId: ${network.config.chainId})\n`,
  );

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  const deployFile = path.join(deploymentsDir, `${network.name}.json`);

  if (fs.existsSync(deployFile)) {
    const prev: Deployment = JSON.parse(fs.readFileSync(deployFile, 'utf8'));
    const code = await ethers.provider.getCode(prev.address);
    if (code !== '0x') {
      console.log(
        `Contract already deployed at ${prev.address} (tx: ${prev.txHash})`,
      );
      console.log(`Reusing existing deployment.`);
      return;
    }
    console.log(
      `Stale deployment file found (no bytecode at ${prev.address}). Redeploying...`,
    );
  }

  const initialMintPrice = process.env.INITIAL_MINT_PRICE_WEI
    ? BigInt(process.env.INITIAL_MINT_PRICE_WEI)
    : ethers.parseEther('0.001');

  console.log('Deploying AffixNFT...');
  console.log(`   Mint price: ${initialMintPrice} wei`);
  const factory = await ethers.getContractFactory('AffixNFT');
  const contract = await factory.deploy(deployer.address, initialMintPrice);
  const deployed = await contract.waitForDeployment();
  const address = await contract.getAddress();

  const txResponse = deployed.deploymentTransaction();
  if (!txResponse) throw new Error('No deployment transaction returned');
  const receipt = await txResponse.wait();
  if (!receipt)
    throw new Error('No receipt returned for deployment transaction');
  const blockNumber = receipt.blockNumber;
  const txHash = txResponse.hash;

  console.log(`\n\x1b[32mAffixNFT deployed!\x1b[0m`);
  console.log(`   Address:     ${address}`);
  console.log(`   Tx Hash:     ${txHash}`);
  console.log(`   Block:       ${blockNumber}`);
  console.log(`   Deployer:    ${deployer.address}`);

  const deployment: Deployment = {
    address,
    deployer: deployer.address,
    blockNumber,
    txHash,
    deployedAt: new Date().toISOString(),
  };
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(deployFile, JSON.stringify(deployment, null, 2));
  console.log(`\nDeployment saved to ${deployFile}`);

  if (network.name === 'sepolia' && process.env.ETHERSCAN_API_KEY) {
    console.log('\nWaiting 30s for Etherscan to index...');
    await new Promise((r) => setTimeout(r, 30_000));

    try {
      await run('verify:verify', {
        address,
        constructorArguments: [deployer.address, initialMintPrice],
      });
      console.log('\x1b[32mContract verified on Etherscan!\x1b[0m');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Already Verified')) {
        console.log('Contract already verified.');
      } else {
        console.error('Verification failed:', message);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
