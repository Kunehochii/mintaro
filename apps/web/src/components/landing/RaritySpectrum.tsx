const RARITIES = [
  {
    label: 'Common',
    rate: '70%',
    color: 'text-vapor-muted',
    borderColor: 'border-vapor-muted/40',
    glowClass: '',
    bgAccent: 'bg-vapor-muted/10',
  },
  {
    label: 'Rare',
    rate: '20%',
    color: 'text-vapor-mint',
    borderColor: 'border-vapor-mint/40',
    glowClass: 'hover:shadow-glow-mint',
    bgAccent: 'bg-vapor-mint/10',
  },
  {
    label: 'Splendid',
    rate: '8%',
    color: 'text-vapor-purple',
    borderColor: 'border-vapor-purple/40',
    glowClass: 'hover:shadow-glow-purple',
    bgAccent: 'bg-vapor-purple/10',
  },
  {
    label: 'Divine',
    rate: '2%',
    color: 'text-vapor-gold',
    borderColor: 'border-vapor-gold/40',
    glowClass: 'shadow-glow-gold',
    bgAccent: 'bg-vapor-gold/10',
    pulse: true,
  },
];

export default function RaritySpectrum() {
  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center font-display text-3xl font-bold uppercase tracking-wider text-vapor-text md:text-4xl">
          Four tiers. One mystery.
        </h2>
        <p className="mx-auto mb-16 max-w-xl text-center text-vapor-muted">
          Every mint rolls the dice. Rarity is determined on-chain — you
          won&apos;t know what you pulled until the reveal.
        </p>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {RARITIES.map((r) => (
            <div
              key={r.label}
              className={`group flex cursor-pointer flex-col items-center rounded-card border ${r.borderColor} ${r.bgAccent} p-6 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${r.glowClass} ${r.pulse ? 'animate-pulse' : ''}`}
            >
              {/* Placeholder mystery card */}
              <div
                className={`flex h-32 w-24 items-center justify-center rounded-lg border ${r.borderColor} bg-vapor-bg/60 md:h-40 md:w-28`}
              >
                <span
                  className={`font-display text-4xl font-bold ${r.color} md:text-5xl`}
                >
                  ?
                </span>
              </div>

              <span
                className={`mt-4 font-display text-sm font-semibold uppercase tracking-wider ${r.color}`}
              >
                {r.label}
              </span>
              <span className="mt-1 font-mono text-xs text-vapor-muted">
                {r.rate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
