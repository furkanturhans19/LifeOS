import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CraftsmanScreen } from '@/components/services/craftsman/CraftsmanScreen';

export const metadata: Metadata = {
  title: 'Usta — Life',
  description: 'Kategori seç, talep oluştur, teklif topla (yerel demo)',
};

export default function CraftsmanPage() {
  return (
    <Suspense fallback={null}>
      <CraftsmanScreen />
    </Suspense>
  );
}
