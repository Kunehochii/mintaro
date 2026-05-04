import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-sunset px-4 py-24">
      {/* Subtle scanline-like overlay so CTA text pops */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.08)_2px,rgba(0,0,0,0.08)_4px)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-vapor-bg md:text-5xl">
          Your first pull is one click away.
        </h2>
        <Link
          href="/mint"
          className="mt-8 inline-block cursor-pointer rounded-btn bg-vapor-bg px-10 py-4 font-display text-sm font-semibold uppercase tracking-wider text-vapor-pink transition-all duration-150 hover:shadow-glow-pink"
        >
          Mint Now
        </Link>
      </div>
    </section>
  );
}
