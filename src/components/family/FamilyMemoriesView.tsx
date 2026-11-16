'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function FamilyMemoriesView() {
  const localizeText = useLocaleRender();
  const { memories, addMemory, removeMemory } = useFamilyStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addMemory(title, description, date);
    setTitle('');
    setDescription('');
  }

  return (
    <div className="space-y-4">
      <p className="px-1 text-xs text-muted-foreground">
        {localizeText(
          'Fotoğraf yükleme henüz yok — anıları metin olarak kaydedebilirsin. Cihazında saklanır.'
        )}
      </p>

      <form onSubmit={handleAdd} className="space-y-3 rounded-3xl border border-border/80 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">{localizeText('Anı ekle')}</p>
        <Input
          label={localizeText('Başlık')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={localizeText('İlk tatil, mezuniyet…')}
        />
        <Input
          label={localizeText('Tarih')}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">
            {localizeText('Açıklama')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={localizeText('Ne olmuştu?')}
          />
        </div>
        <Button type="submit" className="w-full" size="lg">
          <Plus className="mr-1.5 h-4 w-4" />
          {localizeText('Kaydet')}
        </Button>
      </form>

      <div className="space-y-2">
        {memories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {localizeText('Henüz anı yok.')}
          </p>
        ) : (
          memories.map((memory) => (
            <div
              key={memory.id}
              className="flex gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{memory.title}</p>
                <p className="text-[11px] text-muted-foreground">{memory.date}</p>
                {memory.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{memory.description}</p>
                )}
              </div>
              <button
                type="button"
                aria-label={localizeText('Sil')}
                onClick={() => removeMemory(memory.id)}
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
