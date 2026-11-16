'use client';

import React from 'react';
import { WifiOff, Sparkles, ListTodo } from 'lucide-react';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function AssistantModeBanner() {
  const localizeText = useLocaleRender();
  const { providerInfo, setCurrentView } = useAssistantStore();
  const online = providerInfo.isOnline;

  if (online) {
    return (
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-200 sm:mx-6">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span>
          {localizeText('AI açık')}: {providerInfo.providerName} · {providerInfo.model}
        </span>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3 flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-950 dark:text-amber-100 sm:mx-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          <p className="font-semibold">{localizeText('Plan-only mod · AI kapalı')}</p>
          <p className="mt-0.5 opacity-90">
            {localizeText(
              providerInfo.message ||
                'Sohbet yerel görev planına çevrilir. Ollama açık değilse de görevler cihazda çalışır.'
            )}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setCurrentView('tasks')}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-700"
      >
        <ListTodo className="h-3.5 w-3.5" />
        {localizeText('Görevler')}
      </button>
    </div>
  );
}
