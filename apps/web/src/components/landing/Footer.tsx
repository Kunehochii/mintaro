import Image from 'next/image';

const COLUMNS = [
  {
    heading: 'Resources',
    links: ['Docs', 'Smart Contract', 'IPFS Gateway'],
  },
  {
    heading: 'Community',
    links: ['Discord', 'Twitter', 'GitHub'],
  },
  {
    heading: 'Legal',
    links: ['Terms of Service', 'Privacy Policy'],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-vapor-purple/20 bg-vapor-bg px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Logo */}
          <div>
            <Image
              src="/logo_with_text.png"
              alt="Mintaro"
              width={115}
              height={42}
              className="h-8 w-auto"
            />
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-vapor-text">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="cursor-pointer text-sm text-vapor-muted transition-colors duration-150 hover:text-vapor-cyan"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-12 border-t border-vapor-purple/10 pt-6">
          <p className="text-center font-mono text-xs text-vapor-muted">
            &copy; 2026 Mintaro &middot; Built on Ethereum Sepolia &middot;
            Source on GitHub
          </p>
          <p className="mt-2 text-center font-mono text-xs text-vapor-muted">
            &#9888; Pseudo-random &mdash; on-chain randomness uses
            block.prevrandao. See write-up for details.
          </p>
        </div>
      </div>
    </footer>
  );
}
