'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  EXPENSE_CATEGORY_LABELS,
  useFinanceStore,
  type ExpenseCategory,
} from '@/stores/useFinanceStore';
import {
  formatLifeMoney,
  formatTryEquivalent,
  lifeMoneyRateLabel,
  tryToLifeMoney,
} from '@/lib/money/lifemoney';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { cn } from '@/lib/utils';

const CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

export function ExpensesLedgerView() {
  const localizeText = useLocaleRender();
  const { expenses, addExpense, removeExpense, monthTotalLm } = useFinanceStore();
  const [title, setTitle] = useState('');
  const [amountTry, setAmountTry] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [error, setError] = useState<string | null>(null);

  const monthTotal = monthTotalLm();
  const previewLm = useMemo(() => {
    const n = Number(amountTry.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return 0;
    return tryToLifeMoney(n);
  }, [amountTry]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const tryValue = Number(amountTry.replace(',', '.'));
    if (!title.trim()) {
      setError('Başlık gerekli.');
      return;
    }
    if (!Number.isFinite(tryValue) || tryValue <= 0) {
      setError('Geçerli bir tutar girin.');
      return;
    }
    addExpense({
      title,
      category,
      amountLm: tryToLifeMoney(tryValue),
    });
    setTitle('');
    setAmountTry('');
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/80 bg-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {localizeText('Bu ay')}
        </p>
        <p className="mt-1 font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight text-foreground">
          {formatLifeMoney(monthTotal, { compact: true })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatTryEquivalent(monthTotal)} · {localizeText(lifeMoneyRateLabel())}
        </p>
      </div>

      <form onSubmit={handleAdd} className="space-y-3 rounded-3xl border border-border/80 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">{localizeText('Harcama ekle')}</p>
        <Input
          label={localizeText('Başlık')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={localizeText('Market, taksi, fatura…')}
        />
        <Input
          label={localizeText('Tutar (₺)')}
          value={amountTry}
          onChange={(e) => setAmountTry(e.target.value)}
          inputMode="decimal"
          placeholder="0,00"
        />
        {previewLm > 0 && (
          <p className="text-xs text-muted-foreground">
            {localizeText('LifeMoney karşılığı')}: {formatLifeMoney(previewLm, { compact: true })}
          </p>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{localizeText('Kategori')}</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors',
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
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
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {localizeText('Kayıtlar')} ({expenses.length})
        </p>
        {expenses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {localizeText('Henüz harcama yok. İlk kaydını ekle.')}
          </p>
        ) : (
          expenses.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {localizeText(EXPENSE_CATEGORY_LABELS[item.category])} · {item.spentAt}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {formatLifeMoney(item.amountLm, { compact: true })}
                </p>
                <p className="text-[10px] text-muted-foreground">{formatTryEquivalent(item.amountLm)}</p>
              </div>
              <button
                type="button"
                aria-label={localizeText('Sil')}
                onClick={() => removeExpense(item.id)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
