'use client';

import { MAX_FUSION_SELECTION, useFusionSelection } from './selectionContext';

export default function FuseToolbar({ onFuse }: { onFuse: () => void }) {
  const { count, clear } = useFusionSelection();
  const ready = count === MAX_FUSION_SELECTION;

  return (
    <div className="sticky bottom-4 z-20 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-card border border-vapor-purple/40 bg-vapor-surface/80 p-4 backdrop-blur-xl">
      <p className="font-display text-xs uppercase tracking-wider text-vapor-text">
        <span className={ready ? 'text-vapor-pink' : 'text-vapor-cyan'}>
          {count}
        </span>
        <span className="text-vapor-muted">
          {' '}
          / {MAX_FUSION_SELECTION} selected
        </span>
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={clear}
          disabled={count === 0}
          className="cursor-pointer rounded-btn border border-vapor-muted/40 px-4 py-2 font-display text-xs uppercase tracking-wider text-vapor-muted transition-colors duration-150 hover:text-vapor-cyan disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-vapor-muted"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onFuse}
          disabled={!ready}
          aria-disabled={!ready}
          className="cursor-pointer rounded-btn bg-vapor-pink px-5 py-2 font-display text-xs uppercase tracking-wider text-vapor-bg transition-all duration-150 hover:shadow-glow-pink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
        >
          Fuse
        </button>
      </div>
    </div>
  );
}
