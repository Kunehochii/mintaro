import {
  loadFixture,
  time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

const MINT_PRICE = ethers.parseEther('0.001');

async function deployFixture() {
  const [owner, alice, bob] = await ethers.getSigners();
  const factory = await ethers.getContractFactory('AffixNFT');
  const nft = await factory.deploy(owner.address, MINT_PRICE);
  const address = await nft.getAddress();
  return { nft, owner, alice, bob, address };
}

describe('AffixNFT', () => {
  describe('mint (Task 2.5)', () => {
    it('mints when payment equals mintPrice and assigns ownership', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      await expect(nft.connect(alice).mint({ value: MINT_PRICE }))
        .to.emit(nft, 'MintRequested')
        .and.to.emit(nft, 'AffixesAssigned');
      expect(await nft.ownerOf(0)).to.equal(alice.address);
      expect(await nft.totalMinted()).to.equal(1n);
    });

    it('reverts on underpayment with correct message', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      await expect(
        nft.connect(alice).mint({ value: MINT_PRICE - 1n }),
      ).to.be.revertedWith('AffixNFT: incorrect mint payment');
    });

    it('reverts on overpayment (strict equality)', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      await expect(
        nft.connect(alice).mint({ value: MINT_PRICE + 1n }),
      ).to.be.revertedWith('AffixNFT: incorrect mint payment');
    });

    it('emits MintRequested with tokenId, minter, and non-zero seed', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      const tx = await nft.connect(alice).mint({ value: MINT_PRICE });
      const receipt = await tx.wait();
      if (receipt === null) {
        expect.fail('expected receipt');
      }
      const iface = nft.interface;
      const parsed = receipt.logs
        .map((l) => {
          try {
            return iface.parseLog({
              topics: l.topics as string[],
              data: l.data,
            });
          } catch {
            return null;
          }
        })
        .find((e) => e?.name === 'MintRequested');
      if (parsed === undefined) {
        expect.fail('expected MintRequested log');
      }
      expect(parsed.args.tokenId).to.equal(0n);
      expect(parsed.args.minter).to.equal(alice.address);
      expect(parsed.args.seed).to.not.equal(0n);
    });

    it('assigns 1–3 affixes in valid rarity range per token', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      for (let i = 0; i < 5; i++) {
        await nft.connect(alice).mint({ value: MINT_PRICE });
        const tid = (await nft.totalMinted()) - 1n;
        const aff = await nft.getAffixes(tid);
        expect(aff.length).to.be.within(1, 3);
        for (const a of aff) {
          expect(Number(a)).to.be.within(0, 3);
        }
      }
    });

    it('allows mint after owner updates mint price', async () => {
      const { nft, owner, alice } = await loadFixture(deployFixture);
      const newPrice = ethers.parseEther('0.002');
      await nft.connect(owner).setMintPrice(newPrice);
      await nft.connect(alice).mint({ value: newPrice });
      expect(await nft.ownerOf(0)).to.equal(alice.address);
    });
  });

  describe('setTokenURI reveal (Task 2.6)', () => {
    it('reverts when non-owner calls setTokenURI', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      await nft.connect(alice).mint({ value: MINT_PRICE });
      await expect(
        nft.connect(alice).setTokenURI(0, 'ipfs://QmReveal'),
      ).to.be.revertedWithCustomError(nft, 'OwnableUnauthorizedAccount');
    });

    it('reverts on double reveal with clear message', async () => {
      const { nft, owner, alice } = await loadFixture(deployFixture);
      await nft.connect(alice).mint({ value: MINT_PRICE });
      await nft.connect(owner).setTokenURI(0, 'ipfs://first');
      await expect(
        nft.connect(owner).setTokenURI(0, 'ipfs://second'),
      ).to.be.revertedWith('AffixNFT: already revealed');
    });
  });

  describe('fuse (Task 2.6)', () => {
    async function collectFiveFuseable(
      nft: Awaited<ReturnType<typeof deployFixture>>['nft'],
      minter: Awaited<ReturnType<typeof deployFixture>>['alice'],
    ): Promise<bigint[]> {
      const ids: bigint[] = [];
      while (ids.length < 5) {
        await nft.connect(minter).mint({ value: MINT_PRICE });
        const tid = (await nft.totalMinted()) - 1n;
        const aff = await nft.getAffixes(tid);
        const hasHigh = aff.some((a) => a === 2n || a === 3n);
        if (!hasHigh) ids.push(tid);
      }
      return ids;
    }

    it('reverts when fewer than 5 token ids are provided', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      await expect(
        nft.connect(alice).fuse([0n, 1n, 2n, 3n]),
      ).to.be.revertedWith('AffixNFT: fuse requires exactly 5 tokens');
    });

    it('reverts when fuse inputs contain duplicate token ids', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      await nft.connect(alice).mint({ value: MINT_PRICE });
      await expect(
        nft.connect(alice).fuse([0n, 0n, 0n, 0n, 0n]),
      ).to.be.revertedWith('AffixNFT: duplicate fuse inputs');
    });

    it('reverts when caller does not own all five tokens', async () => {
      const { nft, alice, bob } = await loadFixture(deployFixture);
      for (let i = 0; i < 5; i++) {
        await nft.connect(alice).mint({ value: MINT_PRICE });
      }
      const ids = [0n, 1n, 2n, 3n, 4n] as const;
      await expect(nft.connect(bob).fuse([...ids])).to.be.revertedWith(
        'AffixNFT: fuse requires ownership',
      );
    });

    it('reverts when any input token has Splendid or Divine affix', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      let splendidOrDivineId: bigint | null = null;
      for (let attempt = 0; attempt < 200; attempt++) {
        await nft.connect(alice).mint({ value: MINT_PRICE });
        const tid = (await nft.totalMinted()) - 1n;
        const aff = await nft.getAffixes(tid);
        if (aff.some((a) => a === 2n || a === 3n)) {
          splendidOrDivineId = tid;
          break;
        }
      }
      if (splendidOrDivineId === null) {
        expect.fail(
          'expected at least one Splendid/Divine mint within 200 attempts',
        );
      }
      const highTierId = splendidOrDivineId;
      const others: bigint[] = [];
      while (others.length < 4) {
        await nft.connect(alice).mint({ value: MINT_PRICE });
        const tid = (await nft.totalMinted()) - 1n;
        const aff = await nft.getAffixes(tid);
        if (!aff.some((a) => a === 2n || a === 3n)) others.push(tid);
      }
      const five = [highTierId, ...others];
      await expect(nft.connect(alice).fuse(five)).to.be.revertedWith(
        'AffixNFT: cannot fuse high-tier token',
      );
    });

    it('burns five eligible NFTs and mints one with no Common affixes', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      const fuseIds = await collectFiveFuseable(nft, alice);
      const balanceBefore = await nft.balanceOf(alice.address);
      await expect(nft.connect(alice).fuse(fuseIds))
        .to.emit(nft, 'Fused')
        .and.to.emit(nft, 'MintRequested')
        .and.to.emit(nft, 'AffixesAssigned');
      const balanceAfter = await nft.balanceOf(alice.address);
      expect(balanceAfter).to.equal(balanceBefore - 4n);
      const newId = (await nft.totalMinted()) - 1n;
      const aff = await nft.getAffixes(newId);
      expect(aff.length).to.be.within(1, 3);
      for (const a of aff) {
        expect(Number(a)).to.be.within(1, 3);
      }
    });
  });

  describe('affix distribution (Task 2.6 statistical)', () => {
    it('1000 mints yields tier shares within ±5% of 70/20/8/2', async () => {
      const { nft, alice } = await loadFixture(deployFixture);
      const counts = [0, 0, 0, 0];
      const t0 = await time.latest();
      for (let i = 0; i < 1000; i++) {
        await time.setNextBlockTimestamp(t0 + i + 1);
        await nft.connect(alice).mint({ value: MINT_PRICE });
        const tid = (await nft.totalMinted()) - 1n;
        const aff = await nft.getAffixes(tid);
        for (const a of aff) {
          counts[Number(a)] += 1;
        }
      }
      const totalSlots = counts.reduce((a, b) => a + b, 0);
      expect(totalSlots).to.be.greaterThan(0);
      const pct = (n: number) => (100 * n) / totalSlots;
      expect(pct(counts[0])).to.be.closeTo(70, 5);
      expect(pct(counts[1])).to.be.closeTo(20, 5);
      expect(pct(counts[2])).to.be.closeTo(8, 5);
      expect(pct(counts[3])).to.be.closeTo(2, 5);
    });
  });
});
