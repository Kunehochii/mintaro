'use client';

import type { Rarity } from '@org/shared-types';
import {
  estimateNftValueWei,
  formatEstimateEth,
  useMintPriceWei,
} from '@org/contract-client';
import { formatEther } from 'ethers';
import { useEthUsdRate } from '../../hooks/useEthUsdRate';

const TOOLTIP =
  'Uses the same affix tiers as the badges (metadata Affix traits when present, otherwise on-chain). Mint price × per-slot multipliers. ETH/USD is approximate. Not a marketplace quote.';

function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

interface Props {
  affixes: readonly Rarity[];
  className?: string;
}

export default function NftEstimatedPrice({ affixes, className }: Props) {
  const { mintPriceWei, isLoading: mintLoading } = useMintPriceWei();
  const { usdPerEth, isLoading: usdLoading } = useEthUsdRate();

  if (mintLoading) {
    return (
      <p
        className={['font-mono text-[10px] text-vapor-muted/80', className]
          .filter(Boolean)
          .join(' ')}
        aria-hidden
      >
        Est.&hellip;
      </p>
    );
  }

  if (mintPriceWei === null) return null;

  const wei = estimateNftValueWei(mintPriceWei, affixes);
  const eth = formatEstimateEth(wei);
  const ethNum = Number.parseFloat(formatEther(wei));
  const usdAmount =
    usdPerEth != null && Number.isFinite(ethNum) ? ethNum * usdPerEth : null;
  const usdPart = usdLoading
    ? ' (~ … USD)'
    : usdAmount != null
      ? ` (~ ${formatUsd(usdAmount)})`
      : '';

  return (
    <p
      className={['font-mono text-[10px] text-vapor-cyan/90', className]
        .filter(Boolean)
        .join(' ')}
      title={TOOLTIP}
    >
      Est. {eth} ETH{usdPart}
    </p>
  );
}
