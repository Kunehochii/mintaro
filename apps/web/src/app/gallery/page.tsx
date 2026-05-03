import GalleryClient from '../../components/gallery/GalleryClient';

export const metadata = {
  title: 'Gallery — Mintaro',
};

export default function GalleryPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-28">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-vapor-text">
            Your Collection
          </h1>
          <p className="mt-1 font-body text-sm text-vapor-muted">
            All AffixNFTs currently held by your wallet.
          </p>
        </div>
      </header>
      <GalleryClient />
    </section>
  );
}
