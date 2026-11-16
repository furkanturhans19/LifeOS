'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dock } from '@/components/os/Dock';
import { useDocumentsStore } from '@/stores/useDocumentsStore';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { LocalBackupPanel } from '@/components/common/LocalBackupPanel';

export function DocumentsScreen() {
  const localizeText = useLocaleRender();
  const { docs, addDoc, updateDoc, removeDoc } = useDocumentsStore();
  const [openId, setOpenId] = useState<string | null>(null);

  const openDoc = docs.find((d) => d.id === openId) || null;

  function handleCreate() {
    const id = addDoc('Yeni belge', '');
    setOpenId(id);
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <PageHeader
        backHref="/home"
        title={localizeText('Belgeler')}
        action={
          !openDoc ? (
            <Button size="sm" onClick={handleCreate} className="text-xs font-semibold">
              <Plus className="mr-1 h-3.5 w-3.5" />
              {localizeText('Yeni')}
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth px-4 sm:px-6">
        {openDoc ? (
          <div className="space-y-3 pt-4">
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {localizeText('Listeye dön')}
            </button>

            <Input
              label={localizeText('Başlık')}
              value={openDoc.title}
              onChange={(e) => updateDoc(openDoc.id, { title: e.target.value })}
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {localizeText('İçerik')}
              </label>
              <textarea
                value={openDoc.body}
                onChange={(e) => updateDoc(openDoc.id, { body: e.target.value })}
                rows={14}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={localizeText('Notlarını, sözleşmeleri, taslakları buraya yaz…')}
              />
            </div>

            <p className="text-[11px] text-muted-foreground">
              {localizeText('Son güncelleme')}:{' '}
              {new Date(openDoc.updatedAt).toLocaleString('tr-TR')}
            </p>

            <Button
              variant="ghost"
              className="w-full text-destructive"
              onClick={() => {
                removeDoc(openDoc.id);
                setOpenId(null);
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              {localizeText('Belgeyi sil')}
            </Button>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-500/15">
                  <FileText className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {localizeText('Yerel belgeler')}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {localizeText(
                      'Metin belgeleri bu cihazda saklanır. Bulut senkron ve dosya yükleme henüz yok.'
                    )}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    {localizeText('Offline MVP · cihaz lokal')}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-4 space-y-2">
              {docs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    {localizeText('Henüz belge yok.')}
                  </p>
                  <Button className="mt-4" onClick={handleCreate}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    {localizeText('İlk belgeyi oluştur')}
                  </Button>
                </div>
              ) : (
                docs.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setOpenId(doc.id)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 text-left hover:border-primary/40"
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{doc.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {doc.body || localizeText('(boş)')}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(doc.updatedAt).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <LocalBackupPanel scope="documents" className="mt-4" />
          </>
        )}
      </div>

      <Dock />
    </div>
  );
}
