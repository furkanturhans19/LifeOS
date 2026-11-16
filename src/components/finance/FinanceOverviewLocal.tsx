'use client';

import { useMemo } from 'react';
import {
  EXPENSE_CATEGORY_LABELS,
  useFinanceStore,
  type ExpenseCategory,
} from '@/stores/useFinanceStore';
import {
  formatLifeMoney,
  formatTryEquivalent,
  lifeMoneyRateLabel,
} from '@/lib/money/lifemoney';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function FinanceOverviewLocal() {
  const localizeText = useLocaleRender();
  const { expenses, monthTotalLm } = useFinanceStore();
  const total = monthTotalLm();

  const byCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    const key = new Date().toISOString().slice(0, 7);
    for (const item of expenses) {
      if (!item.spentAt.startsWith(key)) continue;
      map.set(item.category, (map.get(item.category) || 0) + item.amountLm);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          {localizeText('LifeMoney özeti')}
        </p>
        <p className="mt-2 font-[family-name:var(--font-newsreader)] text-3xl font-medium text-foreground">
          {formatLifeMoney(total, { compact: true })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatTryEquivalent(total)} · {localizeText(lifeMoneyRateLabel())}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {localizeText(
            'Bu ayki yerel harcamaların toplamı. Veriler cihazında saklanır; buluta gönderilmez.'
          )}
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {localizeText('Kategori dağılımı')}
        </p>
        {byCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {localizeText('Henüz veri yok. Harcamalar sekmesinden ekle.')}
          </p>
        ) : (
          <ul className="space-y-2">
            {byCategory.map(([cat, amount]) => (
              <li key={cat} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {localizeText(EXPENSE_CATEGORY_LABELS[cat])}
                </span>
                <span className="font-semibold text-foreground">
                  {formatLifeMoney(amount, { compact: true })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
