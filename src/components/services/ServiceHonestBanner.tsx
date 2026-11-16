'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { useLocaleRender } from '@/lib/i18n/runtime';

type Props = {
  productHint: string;
};

/**
 * Honest local-demo notice. productHint = UX metaphor only (no third-party branding).
 */
export function ServiceHonestBanner({ productHint }: Props) {
  const localizeText = useLocaleRender();
  return (
    <div className="mx-4 mt-3 flex items-start gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-950 dark:text-amber-100 sm:mx-6">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div>
        <p className="font-semibold">{localizeText('Yerel demo · gerçek ödeme / eşleşme yok')}</p>
        <p className="mt-0.5 opacity-90">{localizeText(productHint)}</p>
      </div>
    </div>
  );
}
