import type { Metadata } from 'next';
import { DocumentsScreen } from '@/components/documents/DocumentsScreen';

export const metadata: Metadata = {
  title: 'Belgeler — Life',
  description: 'Yerel metin belgeleri — cihazında saklanır',
};

export default function DocumentsPage() {
  return <DocumentsScreen />;
}
