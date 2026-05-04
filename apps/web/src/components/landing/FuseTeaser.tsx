import { ArrowRight } from '../Icon';

function PlaceholderCard({ dim }: { dim?: boolean }) {
  return (
    <div
      className={`flex h-16 w-12 items-center justify-center rounded-lg border border-vapor-purple/30 bg-vapor-surface/80 ${dim ? 'opacity-50' : ''}`}
    >
      <span className="font-display text-lg text-vapor-muted">?</span>
    </div>
  );
}

export default function FuseTeaser() {
  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* Text */}
        <div>
          <span className="font-mono text-sm uppercase tracking-[0.3em] text-vapor-cyan">
            Fusion
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-wider text-vapor-text md:text-4xl">
            Burn five. Forge one.
          </h2>
          <p className="mt-4 max-w-md text-vapor-muted">
            Combine 5 base NFTs into a single token with a guaranteed Rare+
            affix. Supply shrinks; rarity climbs.
          </p>
        </div>

        {/* Visual */}
        <div className="flex items-center justify-center gap-4">
          {/* 5 dim cards */}
          <div className="flex -space-x-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <PlaceholderCard key={i} dim />
            ))}
          </div>

          {/* Arrow */}
          <div className="glow-text-cyan text-vapor-cyan">
            <ArrowRight className="size-8" />
          </div>

          {/* Result card */}
          <div className="flex h-24 w-16 items-center justify-center rounded-lg border border-vapor-purple/50 bg-vapor-surface shadow-glow-purple">
            <span className="font-display text-2xl font-bold text-vapor-purple">
              ?
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
