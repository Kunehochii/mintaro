'use client';

import { MAX_FUSION_SELECTION, useFusionSelection } from './selectionContext';

export default function FuseToolbar({ onFuse }: { onFuse: () => void }) {
  const { count, clear } = useFusionSelection();
  const ready = count === MAX_FUSION_SELECTION;
  const remaining = MAX_FUSION_SELECTION - count;

  return (
    <div className="sticky bottom-4 z-20 mt-8 flex flex-col gap-3 rounded-card border border-vapor-purple/40 bg-vapor-surface/80 p-4 backdrop-blur-xl sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p
          className="font-display text-xs uppercase tracking-wider text-vapor-text"
          aria-live="polite"
        >
          <span
            className={
              ready ? 'text-vapor-pink glow-text-pink' : 'text-vapor-cyan'
            }
          >
            {count}
          </span>
          <span className="text-vapor-muted">
            {' '}
            / {MAX_FUSION_SELECTION} selected
          </span>
        </p>
        <ul aria-hidden className="flex items-center gap-1.5">
          {Array.from({ length: MAX_FUSION_SELECTION }).map((_, i) => {
            const filled = i < count;
            return (
              <li
                key={i}
                className={`size-2 rounded-full transition-colors duration-150 ${
                  filled
                    ? ready
                      ? 'bg-vapor-pink shadow-glow-pink'
                      : 'bg-vapor-cyan'
                    : 'bg-vapor-muted/30'
                }`}
              />
            );
          })}
        </ul>
        {!ready && (
          <span aria-hidden className="font-body text-[11px] text-vapor-muted">
            Pick {remaining} more
          </span>
        )}
      </div>
      <div className="flex items-center justify-end gap-3">
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
          className={`cursor-pointer rounded-btn bg-vapor-pink px-5 py-2 font-display text-xs uppercase tracking-wider text-vapor-bg transition-all duration-150 hover:shadow-glow-pink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none ${
            ready ? 'shadow-glow-pink' : ''
          }`}
        >
          Fuse
        </button>
      </div>
    </div>
  );
}
