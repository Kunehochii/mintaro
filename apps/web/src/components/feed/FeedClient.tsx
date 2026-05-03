'use client';

import { useMemo, useState } from 'react';
import {
  applyRarityFilter,
  usePublicFeed,
  type RarityTierFilter,
} from '@org/contract-client';
import FeedGrid from './FeedGrid';
import RarityFilter from './RarityFilter';

export default function FeedClient() {
  const { entries, isLoading, error } = usePublicFeed();
  const [filter, setFilter] = useState<RarityTierFilter>('All');

  const visible = useMemo(
    () => applyRarityFilter(entries, filter),
    [entries, filter],
  );

  return (
    <div className="space-y-6">
      <RarityFilter value={filter} onChange={setFilter} />
      <FeedGrid
        entries={visible}
        isLoading={isLoading}
        error={error}
        hasUnfilteredResults={entries.length > 0}
      />
    </div>
  );
}
