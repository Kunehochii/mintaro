import './global.css';
import { Orbitron, Exo_2, JetBrains_Mono } from 'next/font/google';
import Navbar from '../components/Navbar';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-orbitron',
  display: 'swap',
});

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-exo2',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata = {
  title: 'Mintaro — AI-Generated NFT Gacha on Ethereum',
  description:
    'Pay ETH to mint NFTs with randomized rarity affixes and AI-generated artwork via DALL-E 3, pinned permanently to IPFS on Ethereum Sepolia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${exo2.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body antialiased">
        <Navbar />
        <main>{children}</main>
        <div className="scanlines" />
      </body>
    </html>
  );
}
