'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { Button } from '@/components/ui/Button';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function FamilySharedSpaceView() {
  const localizeText = useLocaleRender();
  const { posts, addPost, removePost, family } = useFamilyStore();
  const [text, setText] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addPost(text);
    setText('');
  }

  return (
    <div className="space-y-4">
      <p className="px-1 text-xs text-muted-foreground">
        {localizeText(
          'Aile duyuruları bu cihazda saklanır. Gerçek çok kullanıcılı paylaşım için bulut henüz bağlı değil.'
        )}
      </p>

      <form onSubmit={handleAdd} className="space-y-3 rounded-3xl border border-border/80 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">{localizeText('Duyuru yaz')}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder={localizeText('Akşam yemeği 19:00’da…')}
        />
        <Button type="submit" className="w-full" size="lg" disabled={!family}>
          <Plus className="mr-1.5 h-4 w-4" />
          {localizeText('Paylaş')}
        </Button>
      </form>

      <div className="space-y-2">
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {localizeText('Henüz duyuru yok.')}
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {post.authorName}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{post.text}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(post.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <button
                type="button"
                aria-label={localizeText('Sil')}
                onClick={() => removePost(post.id)}
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
