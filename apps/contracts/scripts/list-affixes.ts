import { ethers, network } from 'hardhat';
import fs from 'fs';
import path from 'path';
import { isFusionEligible } from '@org/contract-client';
import { Rarity } from '@org/shared-types';

const TIER = ['Common', 'Rare', 'Splendid', 'Divine'];

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
  const total = Number(await c.totalMinted());

  let eligible = 0;
  console.log(
    `tokenId  owner                                       affixes  eligible`,
  );
  for (let i = 0; i < total; i++) {
    const owner = await c.ownerOf(i);
    const isMine = owner.toLowerCase() === signer.address.toLowerCase();
    if (!isMine) continue;
    const affixes = (await c.getAffixes(i)).map((a) => Number(a) as Rarity);
    const isEligible = isFusionEligible(affixes);
    if (isEligible) eligible++;
    const names = affixes.map((a) => TIER[a] ?? `?${a}`).join(',');
    console.log(
      `#${i.toString().padStart(3, '0')}     ${owner}  [${names.padEnd(28)}]  ${isEligible ? 'YES' : 'no'}`,
    );
  }
  console.log(`\nFusion-eligible owned tokens: ${eligible} (need ≥ 5)`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
