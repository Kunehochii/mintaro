import { Wallet, Gem, Sparkle } from '../Icon';

const STEPS = [
  {
    number: '01',
    icon: Wallet,
    heading: 'Connect MetaMask',
    body: 'Your wallet is your identity. No accounts, no passwords.',
    color: 'text-vapor-cyan',
  },
  {
    number: '02',
    icon: Gem,
    heading: 'Mint for ETH',
    body: 'On-chain randomness rolls your affixes. The pull is instant; the reveal isn\u2019t.',
    color: 'text-vapor-pink',
  },
  {
    number: '03',
    icon: Sparkle,
    heading: 'Reveal Your Art',
    body: 'DALL-E 3 paints your prompt from the rolled affixes. Pinned to IPFS, set on-chain.',
    color: 'text-vapor-mint',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-16 text-center font-display text-3xl font-bold uppercase tracking-wider text-vapor-text md:text-4xl">
          How it works
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group cursor-pointer rounded-card border border-vapor-purple/30 bg-vapor-surface/80 p-8 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-vapor-pink/40 hover:shadow-glow-purple"
            >
              <span className={`font-mono text-sm ${step.color}`}>
                {step.number}
              </span>
              <div className={`mt-4 ${step.color}`}>
                <step.icon className="size-8" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-vapor-text">
                {step.heading}
              </h3>
              <p className="mt-2 text-vapor-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
