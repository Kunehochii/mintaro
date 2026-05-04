'use client';

import { useEffect, useState } from 'react';

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

const CACHE_MS = 5 * 60 * 1000;

let cache: { rate: number; at: number } | null = null;
let inflight: Promise<number | null> | null = null;

function parseEnvRate(): number | null {
  const raw = process.env.NEXT_PUBLIC_ETH_USD;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function fetchRateFromApi(): Promise<number | null> {
  try {
    const res = await fetch(COINGECKO_URL);
    if (!res.ok) return null;
    const json = (await res.json()) as { ethereum?: { usd?: number } };
    const usd = json.ethereum?.usd;
    return typeof usd === 'number' && usd > 0 ? usd : null;
  } catch {
    return null;
  }
}

function loadEthUsd(): Promise<number | null> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) {
    return Promise.resolve(cache.rate);
  }
  if (!inflight) {
    inflight = fetchRateFromApi()
      .then((api) => {
        if (api != null) {
          cache = { rate: api, at: Date.now() };
          return api;
        }
        return parseEnvRate();
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export interface UseEthUsdRateResult {
  usdPerEth: number | null;
  isLoading: boolean;
}

/**
 * Approximate ETH/USD for display only (CoinGecko public API + optional env fallback).
 */
export function useEthUsdRate(): UseEthUsdRateResult {
  const envRate = parseEnvRate();
  const [usdPerEth, setUsdPerEth] = useState<number | null>(envRate);
  const [isLoading, setIsLoading] = useState(envRate === null);

  useEffect(() => {
    let cancelled = false;
    loadEthUsd().then((r) => {
      if (!cancelled) {
        setUsdPerEth(r);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { usdPerEth, isLoading };
}
