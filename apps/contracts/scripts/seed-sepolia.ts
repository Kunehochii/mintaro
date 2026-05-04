/**
 * One-off seed for the Sepolia AffixNFT deployment used during US-9 development.
 *
 *   set -a; source ../../.env.local; set +a
 *   npx hardhat run scripts/seed-sepolia.ts --network sepolia
 */
import { ethers, network } from 'hardhat';
import fs from 'fs';
import path from 'path';

const TARGET = 10;

async function main() {
  const deployFile = path.join(
    __dirname,
    '..',
    'deployments',
    `${network.name}.json`,
  );
  const { address } = JSON.parse(fs.readFileSync(deployFile, 'utf8')) as {
    address: string;
  };

  const [signer] = await ethers.getSigners();
  const c = await ethers.getContractAt('AffixNFT', address, signer);

  const owner = await c.owner();
  const mintPrice = await c.mintPrice();
  const startBalance = await c.balanceOf(signer.address);
  const ethBalance = await ethers.provider.getBalance(signer.address);

  console.log(`Network:      ${network.name}`);
  console.log(`Signer:       ${signer.address}`);
  console.log(`Signer ETH:   ${ethers.formatEther(ethBalance)}`);
  console.log(`Contract:     ${address}`);
  console.log(`Owner:        ${owner}`);
  console.log(
    `Mint price:   ${ethers.formatEther(mintPrice)} ETH (${mintPrice} wei)`,
  );
  console.log(`Signer NFTs:  ${startBalance}`);

  console.log(`\nDry-run staticCall mint with value=${mintPrice} ...`);
  try {
    await c.mint.staticCall({ value: mintPrice });
    console.log(`  staticCall OK`);
  } catch (err) {
    console.log(
      `  staticCall reverted: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  console.log(`\nDry-run staticCall mint with value=0n ...`);
  try {
    await c.mint.staticCall({ value: 0n });
    console.log(`  staticCall OK`);
  } catch (err) {
    console.log(
      `  staticCall reverted: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  console.log(`\nDry-run estimateGas ...`);
  try {
    const g = await c.mint.estimateGas({ value: mintPrice });
    console.log(`  gas: ${g}`);
  } catch (err) {
    console.log(
      `  estimateGas reverted: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const toMint = TARGET - Number(startBalance);
  if (toMint <= 0) {
    console.log(
      `\nAlready owns ${startBalance} tokens (target ${TARGET}); skipping mint.`,
    );
  } else {
    console.log(`\nMinting ${toMint} tokens (real)...`);
    for (let i = 0; i < toMint; i++) {
      const tx = await c.mint({ value: mintPrice, gasLimit: 500_000n });
      const receipt = await tx.wait();
      console.log(
        `  mint ${i + 1}/${toMint} (block ${receipt?.blockNumber}, status ${receipt?.status})`,
      );
    }
  }

  const finalBalance = await c.balanceOf(signer.address);
  const totalMinted = await c.totalMinted();
  console.log(`\nFinal balance:  ${finalBalance}`);
  console.log(`Total minted:   ${totalMinted}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
