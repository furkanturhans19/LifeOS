'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function FamilyNotesView() {
  const localizeText = useLocaleRender();
  const { notes, addNote, removeNote } = useFamilyStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addNote(title, body);
    setTitle('');
    setBody('');
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="space-y-3 rounded-3xl border border-border/80 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">{localizeText('Ortak not')}</p>
        <Input
          label={localizeText('Başlık')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={localizeText('Alışveriş listesi, yapılacaklar…')}
        />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">
            {localizeText('Not')}
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={localizeText('Süt, ekmek, doktor randevusu…')}
          />
        </div>
        <Button type="submit" className="w-full" size="lg">
          <Plus className="mr-1.5 h-4 w-4" />
          {localizeText('Kaydet')}
        </Button>
      </form>

      <div className="space-y-2">
        {notes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {localizeText('Henüz not yok.')}
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="flex gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{note.title}</p>
                {note.body && (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{note.body}</p>
                )}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(note.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <button
                type="button"
                aria-label={localizeText('Sil')}
                onClick={() => removeNote(note.id)}
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
