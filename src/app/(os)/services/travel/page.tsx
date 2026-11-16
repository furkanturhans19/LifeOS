import type { Metadata } from 'next';
import { TravelScreen } from '@/components/services/travel/TravelScreen';

export const metadata: Metadata = {
  title: 'Seyahat — Life',
  description: 'Otobüs sefer ara ve yerel rezervasyon kaydı',
};

export default function TravelPage() {
  return <TravelScreen />;
}
