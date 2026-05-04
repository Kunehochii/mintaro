import FeedClient from '../../components/feed/FeedClient';

export const metadata = {
  title: 'Feed — Mintaro',
};

export default function FeedPage() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 overflow-hidden sm:h-64 lg:h-72"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-vapor-cyan/15 via-vapor-purple/8 to-transparent" />
        <div className="absolute inset-0 bg-retro-grid bg-[length:40px_40px] [mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)]" />
        <div className="absolute inset-x-0 top-[58%] h-px bg-gradient-to-r from-transparent via-vapor-pink/70 to-transparent shadow-[0_0_12px_#FF71CE]" />
      </div>

      <header className="mb-8 sm:mb-12">
        <h1 className="font-display text-3xl uppercase tracking-wider text-vapor-text sm:text-4xl lg:text-5xl">
          Public <span className="glow-text-cyan text-vapor-cyan">Feed</span>
        </h1>
        <p className="mt-3 max-w-prose font-body text-sm text-vapor-muted sm:text-base">
          The 50 most recent reveals across all wallets — refresh the page to
          see new reveals.
        </p>
      </header>

      <FeedClient />
    </section>
  );
}
