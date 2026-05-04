'use client';

import { useMemo, useState } from 'react';
import {
  applyRarityFilter,
  displayedTopRarity,
  useFeedMetadataMap,
  usePublicFeed,
  type RarityTierFilter,
} from '@org/contract-client';
import FeedGrid from './FeedGrid';
import RarityFilter from './RarityFilter';

export default function FeedClient() {
  const { entries, isLoading, error } = usePublicFeed();
  const [filter, setFilter] = useState<RarityTierFilter>('All');

  const uris = useMemo(() => entries.map((e) => e.tokenURI), [entries]);
  const metadataMap = useFeedMetadataMap(uris);

  const visible = useMemo(
    () =>
      applyRarityFilter(entries, filter, (e) =>
        displayedTopRarity(metadataMap[e.tokenURI], e.affixes),
      ),
    [entries, filter, metadataMap],
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
