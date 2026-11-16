'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Laptop, ShieldCheck } from 'lucide-react';
import { useLocaleRender } from '@/lib/i18n/runtime';

export default function DevicesSettingsPage() {
  const localizeText = useLocaleRender();

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-28 pt-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/settings"
          className="rounded-xl border border-border/70 bg-card/60 p-2 text-foreground transition-all hover:bg-card active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {localizeText('Bağlı Cihazlar')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {localizeText('Yalnızca bu tarayıcı oturumu doğrulanır')}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-primary/5 p-4 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/20 p-2.5 text-primary">
            <Laptop className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {localizeText('Bu tarayıcı')}
              </h3>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                {localizeText('Aktif')}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {localizeText('Life Web · imzalı httpOnly oturum')}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{localizeText('Şu anda aktif')}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 px-1 text-xs leading-relaxed text-muted-foreground">
        {localizeText(
          'Çok cihazlı oturum listesi henüz bağlanmadı. Sahte cihaz kayıtları gösterilmez. Çıkış yapmak için profil veya ayarlardan oturumu kapatın.'
        )}
      </p>
    </div>
  );
}
