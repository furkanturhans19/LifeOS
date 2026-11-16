'use client';

import { AppArtwork } from '@/components/ui/AppArtwork';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Check, BookOpen, Clock } from 'lucide-react';
import { Dock } from '@/components/os/Dock';
import {
  getActiveModules,
  getComingSoonModules,
  getLibraryHonesty,
  getLocalizedModuleName,
  getLocalizedModuleDescription,
} from '@/modules/registry';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ModuleCategory, ModuleDefinition } from '@/types/module';
import { useLocaleRender } from '@/lib/i18n/runtime';

const CATEGORIES: ModuleCategory[] = [
  'productivity',
  'communication',
  'health',
  'finance',
  'entertainment',
  'home',
  'utility',
];

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">…</div>}>
      <LibraryPageInner />
    </Suspense>
  );
}

function LibraryPageInner() {
  const localizeText = useLocaleRender();
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const {
    addModuleToHomescreen,
    removeModuleFromHomescreen,
    removeModuleFromDock,
    isModuleOnHomescreen,
    isModuleInDock,
  } = useHomescreenStore();
  const [activeCategory, setActiveCategory] = useState<ModuleCategory | 'all'>('all');
  const [tab, setTab] = useState<'active' | 'soon'>('active');

  useEffect(() => {
    if (searchParams.get('tab') === 'soon') setTab('soon');
  }, [searchParams]);

  const activeModules = getActiveModules();
  const soonModules = getComingSoonModules();

  const source = tab === 'active' ? activeModules : soonModules;
  const filtered =
    activeCategory === 'all'
      ? source
      : source.filter((m) => m.category === activeCategory);

  function handleToggle(moduleId: string, isOnHomescreen: boolean) {
    if (tab === 'soon') return;
    if (isOnHomescreen) {
      removeModuleFromHomescreen(moduleId);
      if (isModuleInDock(moduleId)) {
        removeModuleFromDock(moduleId);
      }
    } else {
      addModuleToHomescreen(moduleId);
    }
  }

  const categoryLabelMap: Record<ModuleCategory, string> = {
    productivity: t.categories.core,
    communication: t.categories.social,
    health: t.categories.services,
    finance: t.categories.finance,
    entertainment: t.categories.entertainment,
    home: t.categories.smarthome,
    utility: t.categories.services,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-4 pt-8"
        >
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <BookOpen className="h-6 w-6 text-primary" />
            {localizeText(t.library.title)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{localizeText(t.library.subtitle)}</p>
        </motion.div>

        <div className="mb-4 flex gap-2 px-6">
          <button
            type="button"
            aria-pressed={tab === 'active'}
            onClick={() => setTab('active')}
            className={cn(
              'min-h-11 flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition-all',
              tab === 'active'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {localizeText('Kullanılabilir')} ({activeModules.length})
          </button>
          <button
            type="button"
            aria-pressed={tab === 'soon'}
            onClick={() => setTab('soon')}
            className={cn(
              'min-h-11 flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition-all',
              tab === 'soon'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {localizeText('Yakında')} ({soonModules.length})
          </button>
        </div>

        {tab === 'soon' ? (
          <div className="mb-3 mx-6 space-y-1.5 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-950 dark:text-amber-100">
            <p className="flex items-start gap-2 font-semibold">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {localizeText('Yol haritası · ekran yok')}
            </p>
            <p className="leading-relaxed opacity-90 pl-5">
              {localizeText(
                'Bu maddeler ürünleştirilmedi. Ana ekrana / dock’a eklenemez. Açık API veya sahte “aktif” iddiası yok — sadece plan.'
              )}
            </p>
          </div>
        ) : (
          <p className="mb-3 px-6 text-xs leading-relaxed text-muted-foreground">
            {localizeText(
              'Kullanılabilir = ekranı var. “Bulut kapalı” ve “Yerel demo” rozetleri dürüst sınırlardır.'
            )}
          </p>
        )}

        <div className="flex gap-2 overflow-x-auto px-6 pb-4 scrollbar-none">
          <button
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            className={cn(
              'min-h-11 flex-shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition-all',
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {localizeText(t.library.filterAll)}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {localizeText(categoryLabelMap[cat] || cat)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 px-4 sm:px-6 md:grid-cols-2">
          {filtered.map((module, index) => (
            <ModuleRow
              key={module.id}
              module={module}
              index={index}
              locale={locale}
              soon={tab === 'soon'}
              onHomescreen={isModuleOnHomescreen(module.id) || isModuleInDock(module.id)}
              onToggle={handleToggle}
              t={t}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full px-2 py-8 text-center text-sm text-muted-foreground">
              {localizeText('Bu kategoride modül yok.')}
            </p>
          )}
        </div>
      </div>
      <Dock />
    </div>
  );
}

function ModuleRow({
  module,
  index,
  locale,
  soon,
  onHomescreen,
  onToggle,
  t,
}: {
  module: ModuleDefinition;
  index: number;
  locale: string;
  soon: boolean;
  onHomescreen: boolean;
  onToggle: (id: string, on: boolean) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const localizeText = useLocaleRender();
  const name = getLocalizedModuleName(module, locale);
  const description = getLocalizedModuleDescription(module, locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="flex flex-wrap items-center gap-3 rounded-3xl border border-border/80 bg-card p-4 shadow-sm"
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[18px] border border-border/60 bg-card text-2xl shadow-sm">
        <AppArtwork id={module.id} fallback={module.icon} className="h-full w-full p-2" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="break-words text-base font-semibold text-foreground">{localizeText(name)}</span>
          {soon && (
            <span className="flex-shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-300">
              {localizeText(t.common.soon)}
            </span>
          )}
          {!soon && getLibraryHonesty(module.id) === 'cloud_off' && (
            <span className="flex-shrink-0 rounded-full border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-800 dark:text-rose-300">
              {localizeText('Bulut kapalı')}
            </span>
          )}
          {!soon && getLibraryHonesty(module.id) === 'local_demo' && (
            <span className="flex-shrink-0 rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-800 dark:text-sky-300">
              {localizeText('Yerel demo')}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {localizeText(description)}
        </p>
      </div>

      {!soon ? (
        <motion.button
          aria-label={`${onHomescreen ? t.library.removeFromHome : t.library.addToHome}: ${name}`}
          aria-pressed={onHomescreen}
          onClick={() => onToggle(module.id, onHomescreen)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex min-h-11 w-full flex-shrink-0 items-center justify-center gap-1 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 sm:w-auto',
            onHomescreen
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive dark:text-emerald-400'
              : 'border-transparent bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
          )}
        >
          {onHomescreen ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>{localizeText(t.library.removeFromHome)}</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              <span>{localizeText(t.library.addToHome)}</span>
            </>
          )}
        </motion.button>
      ) : (
        <span className="w-full rounded-xl bg-muted/60 px-3 py-2 text-center text-[11px] font-medium text-muted-foreground sm:w-auto">
          {localizeText('Ana ekrana eklenemez')}
        </span>
      )}
    </motion.div>
  );
}
