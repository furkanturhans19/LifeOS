'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  CreditCard,
  Target,
  Trophy,
  Repeat,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceSectionKey } from '@/types/finance';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLocaleRender } from '@/lib/i18n/runtime';

export interface FinanceFeatureCardConfig {
  id: FinanceSectionKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  available?: boolean;
}

const FINANCE_SECTIONS: FinanceFeatureCardConfig[] = [
  {
    id: 'overview',
    title: 'Genel Bakış',
    description: 'Bu ay LifeMoney özeti ve kategori dağılımı',
    icon: <PieChart className="h-5 w-5 text-emerald-500" />,
    available: true,
  },
  {
    id: 'expenses',
    title: 'Harcamalar',
    description: '₺ gir, LifeMoney olarak kaydet — cihazında saklanır',
    icon: <CreditCard className="h-5 w-5 text-teal-500" />,
    available: true,
  },
  {
    id: 'budget',
    title: 'Bütçe',
    description: 'Aylık LifeMoney limitleri ve harcama ilerlemesi',
    icon: <Target className="h-5 w-5 text-cyan-500" />,
    available: true,
  },
  {
    id: 'goals',
    title: 'Hedefler',
    description: 'Birikim hedefleri ve LifeMoney ile katkı ekleme',
    icon: <Trophy className="h-5 w-5 text-amber-500" />,
    available: true,
  },
  {
    id: 'subscriptions',
    title: 'Abonelikler',
    description: 'Düzenli ödemeler, sıklık ve tahmini aylık LM',
    icon: <Repeat className="h-5 w-5 text-indigo-500" />,
    available: true,
  },
];

interface FinanceFeaturesGridProps {
  onFeatureClick: (feature: FinanceFeatureCardConfig) => void;
}

export function FinanceFeaturesGrid({ onFeatureClick }: FinanceFeaturesGridProps) {
  const localizeText = useLocaleRender();
  return (
    <div className="mt-4 px-4 sm:px-6">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {localizeText('Finansal Bölümler')}
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          {localizeText('5 hazır')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {FINANCE_SECTIONS.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            onClick={() => onFeatureClick(section)}
            className={cn(
              'group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md',
              index === 0 ? 'sm:col-span-2' : ''
            )}
          >
            <div>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 shadow-xs transition-transform group-hover:scale-105">
                  {section.icon}
                </div>
                <StatusBadge status="active" label={localizeText('Hazır')} size="sm" />
              </div>

              <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                {localizeText(section.title)}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {localizeText(section.description)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-medium text-primary">{localizeText('Aç')}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
