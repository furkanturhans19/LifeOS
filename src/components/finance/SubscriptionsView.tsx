'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  EXPENSE_CATEGORY_LABELS,
  SUBSCRIPTION_FREQUENCY_LABELS,
  toMonthlyLm,
  useFinanceStore,
  type ExpenseCategory,
  type SubscriptionFrequency,
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
const FREQUENCIES = Object.keys(SUBSCRIPTION_FREQUENCY_LABELS) as SubscriptionFrequency[];

export function SubscriptionsView() {
  const localizeText = useLocaleRender();
  const {
    subscriptions,
    addSubscription,
    toggleSubscription,
    removeSubscription,
    monthlySubscriptionsLm,
  } = useFinanceStore();

  const [title, setTitle] = useState('');
  const [amountTry, setAmountTry] = useState('');
  const [frequency, setFrequency] = useState<SubscriptionFrequency>('monthly');
  const [nextDue, setNextDue] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>('bills');
  const [error, setError] = useState<string | null>(null);

  const monthlyTotal = monthlySubscriptionsLm();

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
    if (!nextDue) {
      setError('Sonraki ödeme tarihi gerekli.');
      return;
    }
    addSubscription({
      title,
      amountLm: tryToLifeMoney(tryValue),
      frequency,
      nextDue,
      category,
    });
    setTitle('');
    setAmountTry('');
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/80 bg-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {localizeText('Tahmini aylık abonelik')}
        </p>
        <p className="mt-1 font-[family-name:var(--font-newsreader)] text-3xl font-medium text-foreground">
          {formatLifeMoney(monthlyTotal, { compact: true })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{formatTryEquivalent(monthlyTotal)}</p>
      </div>

      <form onSubmit={handleAdd} className="space-y-3 rounded-3xl border border-border/80 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">{localizeText('Abonelik ekle')}</p>
        <Input
          label={localizeText('Servis / fatura')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={localizeText('Netflix, internet, spor…')}
        />
        <Input
          label={localizeText('Tutar (₺)')}
          value={amountTry}
          onChange={(e) => setAmountTry(e.target.value)}
          inputMode="decimal"
          placeholder="0,00"
        />
        <Input
          label={localizeText('Sonraki ödeme')}
          type="date"
          value={nextDue}
          onChange={(e) => setNextDue(e.target.value)}
        />

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{localizeText('Sıklık')}</p>
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[11px] font-semibold',
                  frequency === freq
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {localizeText(SUBSCRIPTION_FREQUENCY_LABELS[freq])}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{localizeText('Kategori')}</p>
          <div className="flex flex-wrap gap-2">
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
        {subscriptions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {localizeText('Henüz abonelik yok. Düzenli ödemelerini ekle.')}
          </p>
        ) : (
          subscriptions.map((sub) => (
            <div
              key={sub.id}
              className={cn(
                'flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3',
                !sub.active && 'opacity-60'
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{sub.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {localizeText(SUBSCRIPTION_FREQUENCY_LABELS[sub.frequency])} ·{' '}
                  {localizeText(EXPENSE_CATEGORY_LABELS[sub.category])} ·{' '}
                  {localizeText('Sonraki')} {sub.nextDue}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  ≈ {formatLifeMoney(toMonthlyLm(sub.amountLm, sub.frequency), { compact: true })}
                  /{localizeText('ay')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {formatLifeMoney(sub.amountLm, { compact: true })}
                </p>
                <p className="text-[10px] text-muted-foreground">{formatTryEquivalent(sub.amountLm)}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleSubscription(sub.id)}
                className="rounded-lg bg-muted px-2 py-1 text-[10px] font-semibold"
              >
                {localizeText(sub.active ? 'Duraklat' : 'Aç')}
              </button>
              <button
                type="button"
                aria-label={localizeText('Sil')}
                onClick={() => removeSubscription(sub.id)}
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
