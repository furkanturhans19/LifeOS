import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MovingScreen } from '@/components/services/moving/MovingScreen';

export const metadata: Metadata = {
  title: 'Nakliye — Life',
  description: 'Taşıma türü, adres, teklif (yerel demo)',
};

export default function MovingPage() {
  return (
    <Suspense fallback={null}>
      <MovingScreen />
    </Suspense>
  );
}
