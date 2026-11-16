'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Sparkles, Wallet, PieChart, ArrowLeft } from 'lucide-react';
import { FinanceHeader } from './FinanceHeader';
import { FinanceFeaturesGrid, type FinanceFeatureCardConfig } from './FinanceFeaturesGrid';
import { ExpensesLedgerView } from './ExpensesLedgerView';
import { FinanceOverviewLocal } from './FinanceOverviewLocal';
import { BudgetPlannerView } from './BudgetPlannerView';
import { GoalsTrackerView } from './GoalsTrackerView';
import { SubscriptionsView } from './SubscriptionsView';
import { WalletDashboardView } from '@/components/wallet/WalletDashboardView';
import { UniversalCheckoutModal } from '@/components/payment/UniversalCheckoutModal';
import { Dock } from '@/components/os/Dock';
import { cn } from '@/lib/utils';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { lifeMoneyRateLabel } from '@/lib/money/lifemoney';
import type { FinanceSectionKey } from '@/types/finance';
import { LocalBackupPanel } from '@/components/common/LocalBackupPanel';

type FinanceTab = 'wallet' | 'features';
type OpenTool = Exclude<FinanceSectionKey, never> | null;

const TOOL_TITLES: Record<FinanceSectionKey, string> = {
  overview: 'Genel Bakış',
  expenses: 'Harcamalar',
  budget: 'Bütçe',
  goals: 'Hedefler',
  subscriptions: 'Abonelikler',
};

export function FinanceScreen() {
  const localizeText = useLocaleRender();
  const [activeTab, setActiveTab] = useState<FinanceTab>('features');
  const [openTool, setOpenTool] = useState<OpenTool>(null);

  function handleFeatureClick(feature: FinanceFeatureCardConfig) {
    setOpenTool(feature.id);
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <FinanceHeader />

      <div className="flex-1 space-y-4 overflow-x-hidden overflow-y-auto scroll-smooth px-4 pb-32 sm:px-6">
        <div className="mt-3 flex select-none gap-1 rounded-2xl border border-border/70 bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('wallet');
              setOpenTool(null);
            }}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all',
              activeTab === 'wallet'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Wallet className="h-4 w-4 text-emerald-500" />
            <span>{localizeText('Life Cüzdanım')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all',
              activeTab === 'features'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <PieChart className="h-4 w-4 text-primary" />
            <span>{localizeText('Finansal Yaşam')}</span>
          </button>
        </div>

        <p className="px-1 text-[11px] text-muted-foreground">
          {localizeText('Uygulama para birimi')}:{' '}
          <strong className="text-foreground">LifeMoney</strong>
          {' · '}
          {localizeText(lifeMoneyRateLabel())}
        </p>

        {activeTab === 'wallet' ? (
          <WalletDashboardView />
        ) : openTool ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setOpenTool(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {localizeText('Bölümlere dön')}
              <span className="text-foreground">· {localizeText(TOOL_TITLES[openTool])}</span>
            </button>
            {openTool === 'overview' && <FinanceOverviewLocal />}
            {openTool === 'expenses' && <ExpensesLedgerView />}
            {openTool === 'budget' && <BudgetPlannerView />}
            {openTool === 'goals' && <GoalsTrackerView />}
            {openTool === 'subscriptions' && <SubscriptionsView />}
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{localizeText('LifeMoney ile takip')}</span>
                  </div>
                  <h2 className="mt-1 text-base font-bold text-foreground">
                    {localizeText('Finansal Yaşam Alanın')}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {localizeText(
                      'Harcama, bütçe, hedef ve aboneliklerini LifeMoney ile yönet. Veriler cihazında kalır.'
                    )}
                  </p>
                </div>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  LM
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{localizeText('Cihazda saklama')}</span>
                </div>
                <span className="text-muted-foreground/40">•</span>
                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                  <span>{localizeText(lifeMoneyRateLabel())}</span>
                </div>
              </div>
            </motion.div>

            <FinanceFeaturesGrid onFeatureClick={handleFeatureClick} />
            <LocalBackupPanel scope="finance" className="mt-4" />
          </>
        )}

        <div className="h-6" />
      </div>

      <Dock />
      <UniversalCheckoutModal />
    </div>
  );
}
