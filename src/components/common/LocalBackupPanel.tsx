'use client';

import React, { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useDocumentsStore } from '@/stores/useDocumentsStore';

export type BackupScope = 'finance' | 'family' | 'documents';

type Props = {
  scope: BackupScope;
  className?: string;
};

type Envelope = {
  kind: BackupScope;
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
};

function downloadJson(filename: string, payload: Envelope) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function LocalBackupPanel({ scope, className }: Props) {
  const localizeText = useLocaleRender();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function flash(text: string, error = false) {
    setMessage(text);
    setIsError(error);
    setTimeout(() => setMessage(null), 3200);
  }

  function handleExport() {
    const exportedAt = new Date().toISOString();
    if (scope === 'finance') {
      const { expenses, budgets, goals, subscriptions } = useFinanceStore.getState();
      downloadJson(`life-finance-backup.json`, {
        kind: 'finance',
        version: 1,
        exportedAt,
        data: { expenses, budgets, goals, subscriptions },
      });
    } else if (scope === 'family') {
      const { family, notes, events, memories, posts } = useFamilyStore.getState();
      downloadJson(`life-family-backup.json`, {
        kind: 'family',
        version: 1,
        exportedAt,
        data: { family, notes, events, memories, posts },
      });
    } else {
      const { docs } = useDocumentsStore.getState();
      downloadJson(`life-documents-backup.json`, {
        kind: 'documents',
        version: 1,
        exportedAt,
        data: { docs },
      });
    }
    flash(localizeText('Yedek indirildi'));
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Envelope;
      if (!parsed || parsed.version !== 1 || parsed.kind !== scope || !parsed.data) {
        flash(localizeText('Geçersiz veya yanlış türde yedek dosyası'), true);
        return;
      }

      if (scope === 'finance') {
        const d = parsed.data as {
          expenses?: unknown;
          budgets?: unknown;
          goals?: unknown;
          subscriptions?: unknown;
        };
        useFinanceStore.setState({
          expenses: Array.isArray(d.expenses) ? (d.expenses as never[]) : [],
          budgets: Array.isArray(d.budgets) ? (d.budgets as never[]) : [],
          goals: Array.isArray(d.goals) ? (d.goals as never[]) : [],
          subscriptions: Array.isArray(d.subscriptions)
            ? (d.subscriptions as never[])
            : [],
        });
      } else if (scope === 'family') {
        const d = parsed.data as {
          family?: unknown;
          notes?: unknown;
          events?: unknown;
          memories?: unknown;
          posts?: unknown;
        };
        useFamilyStore.setState({
          family: (d.family as never) ?? null,
          notes: Array.isArray(d.notes) ? (d.notes as never[]) : [],
          events: Array.isArray(d.events) ? (d.events as never[]) : [],
          memories: Array.isArray(d.memories) ? (d.memories as never[]) : [],
          posts: Array.isArray(d.posts) ? (d.posts as never[]) : [],
        });
      } else {
        const d = parsed.data as { docs?: unknown };
        useDocumentsStore.setState({
          docs: Array.isArray(d.docs) ? (d.docs as never[]) : [],
        });
      }
      flash(localizeText('Yedek geri yüklendi'));
    } catch {
      flash(localizeText('Dosya okunamadı'), true);
    }
  }

  const labels: Record<BackupScope, string> = {
    finance: 'Finans yedeği',
    family: 'Aile yedeği',
    documents: 'Belgeler yedeği',
  };

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-card/60 p-4 ${className || ''}`}
    >
      <p className="text-sm font-semibold text-foreground">
        {localizeText(labels[scope])}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {localizeText('JSON olarak dışa aktar veya geri yükle. Veri cihazında kalır.')}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={handleExport}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {localizeText('Dışa aktar')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          {localizeText('İçe aktar')}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
            e.target.value = '';
          }}
        />
      </div>
      {message && (
        <p
          className={`mt-2 text-xs font-medium ${
            isError ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
