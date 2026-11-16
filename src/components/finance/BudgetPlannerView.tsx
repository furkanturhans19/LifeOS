'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  EXPENSE_CATEGORY_LABELS,
  useFinanceStore,
  type ExpenseCategory,
} from '@/stores/useFinanceStore';
import {
  formatLifeMoney,
  formatTryEquivalent,
  tryToLifeMoney,
} from '@/lib/money/lifemoney';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { cn } from '@/lib/utils';

const CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

export function BudgetPlannerView() {
  const localizeText = useLocaleRender();
  const {
    budgets,
    addBudget,
    removeBudget,
    monthTotalLm,
    categoryMonthTotalLm,
  } = useFinanceStore();

  const [title, setTitle] = useState('');
  const [limitTry, setLimitTry] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const tryValue = Number(limitTry.replace(',', '.'));
    if (!title.trim()) {
      setError('Başlık gerekli.');
      return;
    }
    if (!Number.isFinite(tryValue) || tryValue <= 0) {
      setError('Geçerli bir limit girin.');
      return;
    }
    addBudget({
      title,
      category: category === 'all' ? null : category,
      limitLm: tryToLifeMoney(tryValue),
    });
    setTitle('');
    setLimitTry('');
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="space-y-3 rounded-3xl border border-border/80 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">{localizeText('Bütçe oluştur')}</p>
        <Input
          label={localizeText('Başlık')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={localizeText('Aylık genel, yemek…')}
        />
        <Input
          label={localizeText('Limit (₺)')}
          value={limitTry}
          onChange={(e) => setLimitTry(e.target.value)}
          inputMode="decimal"
          placeholder="0,00"
        />

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{localizeText('Kapsam')}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={cn(
                'rounded-full px-3 py-1.5 text-[11px] font-semibold',
                category === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {localizeText('Tümü')}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[11px] font-semibold',
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {localizeText(EXPENSE_CATEGORY_LABELS[cat])}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{localizeText(error)}</p>}
        <Button type="submit" className="w-full" size="lg">
          <Plus className="mr-1.5 h-4 w-4" />
          {localizeText('Kaydet')}
        </Button>
      </form>

      <div className="space-y-2">
        {budgets.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {localizeText('Henüz bütçe yok. Aylık limit belirle.')}
          </p>
        ) : (
          budgets.map((budget) => {
            const spent = budget.category
              ? categoryMonthTotalLm(budget.category)
              : monthTotalLm();
            const ratio = budget.limitLm > 0 ? Math.min(1, spent / budget.limitLm) : 0;
            const over = spent > budget.limitLm;
            return (
              <div
                key={budget.id}
                className="space-y-2 rounded-2xl border border-border/70 bg-card px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{budget.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {budget.category
                        ? localizeText(EXPENSE_CATEGORY_LABELS[budget.category])
                        : localizeText('Genel')}
                      {' · '}
                      {localizeText('Limit')} {formatLifeMoney(budget.limitLm, { compact: true })}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={localizeText('Sil')}
                    onClick={() => removeBudget(budget.id)}
                    className="rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      over ? 'bg-destructive' : ratio > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${Math.min(100, ratio * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className={over ? 'font-semibold text-destructive' : 'text-muted-foreground'}>
                    {localizeText('Harcanan')} {formatLifeMoney(spent, { compact: true })}
                  </span>
                  <span className="text-muted-foreground">{formatTryEquivalent(spent)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
