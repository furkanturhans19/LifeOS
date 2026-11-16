import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TaxiScreen } from '@/components/services/taxi/TaxiScreen';

export const metadata: Metadata = {
  title: 'Taksi — Life',
  description: 'Alış–varış, sabit fiyat teklifi (yerel demo)',
};

export default function TaxiPage() {
  return (
    <Suspense fallback={null}>
      <TaxiScreen />
    </Suspense>
  );
}
