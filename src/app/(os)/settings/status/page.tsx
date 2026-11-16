'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dock } from '@/components/os/Dock';
import { getSystemStatus, healthLabel, type FeatureHealth } from '@/lib/system-status';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { cn } from '@/lib/utils';

const tone: Record<FeatureHealth, string> = {
  ready: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  partial: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  stub: 'bg-sky-500/15 text-sky-800 dark:text-sky-300',
  off: 'bg-muted text-muted-foreground',
};

export default function SystemStatusPage() {
  const localizeText = useLocaleRender();
  const items = getSystemStatus();
  const groups = [
    { id: 'core' as const, title: 'Çekirdek' },
    { id: 'infra' as const, title: 'Altyapı' },
    { id: 'module' as const, title: 'Modüller' },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 pb-2 pt-12"
        >
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{localizeText('Sistem Durumu')}</h1>
            <p className="text-xs text-muted-foreground">
              {localizeText('Ne çalışıyor, ne kısmi, ne kapalı — dürüst özet')}
            </p>
          </div>
        </motion.div>

        <p className="mb-4 px-6 text-xs leading-relaxed text-muted-foreground">
          {localizeText(
            'Supabase ve ödeme bilerek bağlı değil. Bu ekran vaat değil; mevcut yapılandırmanın haritasıdır.'
          )}
        </p>

        {groups.map((group) => {
          const rows = items.filter((item) => item.group === group.id);
          if (rows.length === 0) return null;
          return (
            <section key={group.id} className="mb-5">
              <p className="px-6 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {localizeText(group.title)}
              </p>
              <div className="mx-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {rows.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">{localizeText(item.title)}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{localizeText(item.detail)}</div>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold',
                        tone[item.health]
                      )}
                    >
                      {localizeText(healthLabel(item.health))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <Dock />
    </div>
  );
}
