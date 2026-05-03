import FuseClient from '../../components/fuse/FuseClient';

export const metadata = {
  title: 'Fuse — Mintaro',
};

export default function FusePage() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-24 pt-24 sm:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 overflow-hidden sm:h-64 lg:h-72"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-vapor-pink/15 via-vapor-purple/8 to-transparent" />
        <div className="absolute inset-0 bg-retro-grid bg-[length:40px_40px] [mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)]" />
        <div className="absolute inset-x-0 top-[58%] h-px bg-gradient-to-r from-transparent via-vapor-cyan/70 to-transparent shadow-[0_0_12px_#01CDFE]" />
      </div>

      <header className="mb-8 sm:mb-12">
        <h1 className="font-display text-3xl uppercase tracking-wider text-vapor-text sm:text-4xl lg:text-5xl">
          <span className="glow-text-pink text-vapor-pink">Fuse</span> NFTs
        </h1>
        <p className="mt-3 max-w-prose font-body text-sm text-vapor-muted sm:text-base">
          Pick exactly five eligible NFTs. They will be permanently burned to
          craft one new NFT with a guaranteed Rare-or-better affix.
        </p>
      </header>

      <FuseClient />
    </section>
  );
}
