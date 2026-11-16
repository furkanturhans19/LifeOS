'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import {
  formatLifeMoney,
  formatTryEquivalent,
  tryToLifeMoney,
} from '@/lib/money/lifemoney';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { cn } from '@/lib/utils';

export function GoalsTrackerView() {
  const localizeText = useLocaleRender();
  const { goals, addGoal, addToGoal, removeGoal } = useFinanceStore();

  const [title, setTitle] = useState('');
  const [targetTry, setTargetTry] = useState('');
  const [deadline, setDeadline] = useState('');
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [contributeTry, setContributeTry] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const tryValue = Number(targetTry.replace(',', '.'));
    if (!title.trim()) {
      setError('Başlık gerekli.');
      return;
    }
    if (!Number.isFinite(tryValue) || tryValue <= 0) {
      setError('Geçerli bir hedef tutarı girin.');
      return;
    }
    addGoal({
      title,
      targetLm: tryToLifeMoney(tryValue),
      deadline: deadline || undefined,
    });
    setTitle('');
    setTargetTry('');
    setDeadline('');
  }

  function handleContribute(goalId: string) {
    const tryValue = Number(contributeTry.replace(',', '.'));
    if (!Number.isFinite(tryValue) || tryValue <= 0) return;
    addToGoal(goalId, tryToLifeMoney(tryValue));
    setContributeId(null);
    setContributeTry('');
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="space-y-3 rounded-3xl border border-border/80 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">{localizeText('Birikim hedefi')}</p>
        <Input
          label={localizeText('Hedef adı')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={localizeText('Tatil, bilgisayar, acil fon…')}
        />
        <Input
          label={localizeText('Hedef tutar (₺)')}
          value={targetTry}
          onChange={(e) => setTargetTry(e.target.value)}
          inputMode="decimal"
          placeholder="0,00"
        />
        <Input
          label={localizeText('Son tarih (opsiyonel)')}
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        {error && <p className="text-xs text-destructive">{localizeText(error)}</p>}
        <Button type="submit" className="w-full" size="lg">
          <Plus className="mr-1.5 h-4 w-4" />
          {localizeText('Hedef ekle')}
        </Button>
      </form>

      <div className="space-y-2">
        {goals.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {localizeText('Henüz hedef yok. İlk birikim hedefini oluştur.')}
          </p>
        ) : (
          goals.map((goal) => {
            const ratio = goal.targetLm > 0 ? Math.min(1, goal.savedLm / goal.targetLm) : 0;
            const done = goal.savedLm >= goal.targetLm;
            return (
              <div
                key={goal.id}
                className="space-y-2 rounded-2xl border border-border/70 bg-card px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{goal.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatLifeMoney(goal.savedLm, { compact: true })} /{' '}
                      {formatLifeMoney(goal.targetLm, { compact: true })}
                      {goal.deadline ? ` · ${goal.deadline}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={localizeText('Sil')}
                    onClick={() => removeGoal(goal.id)}
                    className="rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      done ? 'bg-emerald-500' : 'bg-primary'
                    )}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {formatTryEquivalent(goal.savedLm)}
                    {done ? ` · ${localizeText('Tamamlandı')}` : ''}
                  </span>
                  {!done && (
                    <button
                      type="button"
                      onClick={() =>
                        setContributeId(contributeId === goal.id ? null : goal.id)
                      }
                      className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground"
                    >
                      {localizeText('Biriktir')}
                    </button>
                  )}
                </div>
                {contributeId === goal.id && (
                  <div className="flex gap-2 pt-1">
                    <Input
                      value={contributeTry}
                      onChange={(e) => setContributeTry(e.target.value)}
                      inputMode="decimal"
                      placeholder={localizeText('₺ tutar')}
                      className="flex-1"
                    />
                    <Button type="button" onClick={() => handleContribute(goal.id)}>
                      {localizeText('Ekle')}
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
