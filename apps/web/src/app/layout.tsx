import './global.css';
import WalletConnect from '../components/WalletConnect';

export const metadata = {
  title: 'Affix — AI-Generated NFT Gacha',
  description: 'Mint AI-generated NFT gacha on Sepolia testnet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <span className="app-title">Affix</span>
          <WalletConnect />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
