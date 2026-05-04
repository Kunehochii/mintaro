import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-20">
      {/* Sunset gradient layer */}
      <div className="absolute inset-0 bg-sunset opacity-30" />

      {/* Retro grid */}
      <div
        className="absolute inset-0 bg-retro-grid bg-[length:40px_40px]"
        style={{ perspective: 500 }}
      />

      {/* Decorative orbs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-vapor-pink/20 blur-3xl" />
      <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-vapor-cyan/20 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        {/* Logo with glow halo */}
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-full bg-vapor-purple/30 blur-3xl" />
          <Image
            src="/logo_only.png"
            alt="Mintaro logo"
            width={469}
            height={672}
            priority
            className="relative h-40 w-auto md:h-56"
          />
        </div>

        {/* Eyebrow */}
        <span className="font-mono text-sm uppercase tracking-[0.3em] text-vapor-cyan">
          AI-Generated &middot; On-Chain &middot; Gacha
        </span>

        {/* Headline */}
        <h1 className="bg-sunset bg-clip-text font-display text-5xl font-bold uppercase text-transparent md:text-7xl">
          Mint the unknown.
        </h1>

        {/* Sub-headline */}
        <p className="max-w-2xl text-lg text-vapor-muted md:text-xl">
          Pay ETH, roll for rarity, watch DALL-E 3 reveal your one-of-one NFT
          &mdash; pinned to IPFS, owned forever.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/mint"
            className="cursor-pointer rounded-btn bg-vapor-pink px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-vapor-bg transition-all duration-150 hover:shadow-glow-pink"
          >
            Mint Your First NFT
          </Link>
          <Link
            href="/feed"
            className="cursor-pointer rounded-btn border border-vapor-purple px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-vapor-purple transition-all duration-150 hover:shadow-glow-cyan hover:text-vapor-cyan"
          >
            Explore the Feed
          </Link>
        </div>

        {/* Stat row */}
        <p className="mt-2 font-mono text-xs text-vapor-muted">
          Live on Sepolia &middot; 0.01 ETH &middot; 4 rarity tiers
        </p>
      </div>
    </section>
  );
}
