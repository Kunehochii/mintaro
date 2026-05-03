import Image from 'next/image';
import WalletConnect from './WalletConnect';

const NAV_LINKS = [
  { label: 'Mint', href: '/mint' },
  { label: 'Gallery', href: '#' },
  { label: 'Fuse', href: '#' },
  { label: 'Feed', href: '#' },
];

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between gap-6 rounded-card border border-vapor-purple/30 bg-vapor-surface/60 px-5 py-3 backdrop-blur-xl">
      <Image
        src="/logo_with_text.png"
        alt="Mintaro"
        width={77}
        height={28}
        priority
        className="h-7 w-auto"
      />

      <ul className="hidden items-center gap-6 md:flex">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="cursor-pointer font-display text-sm uppercase tracking-wider text-vapor-muted transition-colors duration-150 hover:text-vapor-cyan"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <WalletConnect />
    </nav>
  );
}
