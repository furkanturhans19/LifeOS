'use client';

import { AlertCircle } from 'lucide-react';
import {
  KIDS_VOICE_OFFLINE_HINT,
  KIDS_VOICE_OFFLINE_TITLE,
} from '@/services/kidsSpeechService';
import { useLocaleRender } from '@/lib/i18n/runtime';

type Props = {
  /** Compact strip for story/lesson headers */
  compact?: boolean;
};

export function KidsVoiceOfflineBanner({ compact = false }: Props) {
  const localizeText = useLocaleRender();

  if (compact) {
    return (
      <div
        role="status"
        className="mx-4 mt-2 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-950 dark:text-amber-100"
      >
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p>
          <span className="font-bold">{localizeText(KIDS_VOICE_OFFLINE_TITLE)}</span>
          {' · '}
          {localizeText('Metni birlikte okuyabilirsiniz. Bulut TTS kapalı.')}
        </p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="space-y-1 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-100"
    >
      <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-50">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>{localizeText(KIDS_VOICE_OFFLINE_TITLE)}</span>
      </div>
      <p className="leading-relaxed opacity-95">{localizeText(KIDS_VOICE_OFFLINE_HINT)}</p>
    </div>
  );
}
