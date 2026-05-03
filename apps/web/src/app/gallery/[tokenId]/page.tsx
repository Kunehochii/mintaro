import { notFound } from 'next/navigation';
import TokenDetail from '../../../components/gallery/TokenDetail';

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ tokenId: string }>;
}) {
  const { tokenId } = await params;
  let id: bigint;
  try {
    id = BigInt(tokenId);
    if (id < 0n) throw new Error('negative');
  } catch {
    notFound();
  }
  return (
    <section className="px-4 pb-20 pt-28">
      <TokenDetail tokenId={id} />
    </section>
  );
}
