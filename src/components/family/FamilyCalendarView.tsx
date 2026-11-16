'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function FamilyCalendarView() {
  const localizeText = useLocaleRender();
  const { events, addEvent, removeEvent } = useFamilyStore();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    addEvent(title, date, note);
    setTitle('');
    setNote('');
  }

  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="space-y-3 rounded-3xl border border-border/80 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">{localizeText('Etkinlik ekle')}</p>
        <Input
          label={localizeText('Başlık')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={localizeText('Doğum günü, toplantı, piknik…')}
        />
        <Input
          label={localizeText('Tarih')}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label={localizeText('Not (opsiyonel)')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={localizeText('Detay…')}
        />
        <Button type="submit" className="w-full" size="lg">
          <Plus className="mr-1.5 h-4 w-4" />
          {localizeText('Kaydet')}
        </Button>
      </form>

      <div className="space-y-2">
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {localizeText('Henüz etkinlik yok.')}
          </p>
        ) : (
          upcoming.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3"
            >
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
                <span className="text-[10px] font-semibold uppercase">
                  {new Date(event.date + 'T12:00:00').toLocaleDateString('tr-TR', {
                    month: 'short',
                  })}
                </span>
                <span className="text-sm font-bold">
                  {new Date(event.date + 'T12:00:00').getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                {event.note && (
                  <p className="truncate text-xs text-muted-foreground">{event.note}</p>
                )}
              </div>
              <button
                type="button"
                aria-label={localizeText('Sil')}
                onClick={() => removeEvent(event.id)}
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
