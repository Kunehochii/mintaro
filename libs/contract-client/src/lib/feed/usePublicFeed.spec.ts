/** @jest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { Rarity } from '@org/shared-types';
import { affixesFromUint8s, usePublicFeed } from './usePublicFeed.js';
import { useReadAffixContract } from '../contract/useReadAffixContract.js';
import { createReadProvider } from '../contract/readProvider.js';

jest.mock('../contract/useReadAffixContract.js');
jest.mock('../contract/readProvider.js');

const mockedUseReadAffixContract = jest.mocked(useReadAffixContract);
const mockedCreateReadProvider = jest.mocked(createReadProvider);

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  jest.clearAllMocks();
});

describe('affixesFromUint8s', () => {
  it('maps 0/1/2/3 to Rarity Common/Rare/Splendid/Divine', () => {
    expect(affixesFromUint8s([0n, 1n, 2n, 3n])).toEqual([
      Rarity.Common,
      Rarity.Rare,
      Rarity.Splendid,
      Rarity.Divine,
    ]);
  });

  it('also accepts a number array', () => {
    expect(affixesFromUint8s([0, 3])).toEqual([Rarity.Common, Rarity.Divine]);
  });

  it('throws on out-of-range values (defensive — contract should never emit these)', () => {
    expect(() => affixesFromUint8s([4n])).toThrow(/unknown affix value/i);
  });
});

describe('usePublicFeed', () => {
  it('queries MintRequested with the tokenIds from the top reveals', async () => {
    process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK = '100';
    process.env.NEXT_PUBLIC_RPC_URL = 'https://example.invalid';

    const revealedFilter = Symbol('revealed');
    const mintFilter = Symbol('mint');

    const MintRequested = jest.fn((..._args: unknown[]) => mintFilter);
    const TokenRevealed = jest.fn(() => revealedFilter);

    const queryFilter = jest.fn(async (filter: unknown) => {
      if (filter === revealedFilter) {
        return [
          {
            args: { tokenId: 7n, uri: 'ipfs://seven' },
            blockNumber: 200,
            index: 0,
          },
          {
            args: { tokenId: 5n, uri: 'ipfs://five' },
            blockNumber: 199,
            index: 1,
          },
        ];
      }
      if (filter === mintFilter) {
        return [
          { args: { tokenId: 7n, minter: '0xAAA' } },
          { args: { tokenId: 5n, minter: '0xBBB' } },
        ];
      }
      return [];
    });

    const getAffixes = jest.fn(async () => [0n, 1n, 2n]);

    mockedUseReadAffixContract.mockReturnValue({
      filters: { MintRequested, TokenRevealed },
      queryFilter,
      getAffixes,
    } as never);

    mockedCreateReadProvider.mockReturnValue({
      getBlock: jest.fn(async (bn: number) => ({
        timestamp: BigInt(1_700_000_000 + bn),
      })),
    } as never);

    const { result } = renderHook(() => usePublicFeed());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(MintRequested).toHaveBeenCalledTimes(1);
    const arg = MintRequested.mock.calls[0][0];
    expect(Array.isArray(arg)).toBe(true);
    expect(arg).toEqual(expect.arrayContaining([7n, 5n]));
    expect((arg as bigint[]).length).toBe(2);
  });
});
