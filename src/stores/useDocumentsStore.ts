import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LifeDocument } from '@/types/documents';

interface DocumentsState {
  docs: LifeDocument[];
  addDoc: (title?: string, body?: string) => string;
  updateDoc: (id: string, patch: Partial<Pick<LifeDocument, 'title' | 'body'>>) => void;
  removeDoc: (id: string) => void;
  getDoc: (id: string) => LifeDocument | undefined;
}

function uid() {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set, get) => ({
      docs: [],

      addDoc: (title = 'Yeni belge', body = '') => {
        const now = new Date().toISOString();
        const id = uid();
        const doc: LifeDocument = {
          id,
          title: title.trim().slice(0, 120) || 'Yeni belge',
          body: body.slice(0, 20000),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ docs: [doc, ...s.docs] }));
        return id;
      },

      updateDoc: (id, patch) => {
        const now = new Date().toISOString();
        set((s) => ({
          docs: s.docs.map((d) =>
            d.id === id
              ? {
                  ...d,
                  title:
                    patch.title !== undefined
                      ? patch.title.trim().slice(0, 120) || d.title
                      : d.title,
                  body:
                    patch.body !== undefined ? patch.body.slice(0, 20000) : d.body,
                  updatedAt: now,
                }
              : d
          ),
        }));
      },

      removeDoc: (id) => set((s) => ({ docs: s.docs.filter((d) => d.id !== id) })),

      getDoc: (id) => get().docs.find((d) => d.id === id),
    }),
    {
      name: 'life-documents-v1',
      partialize: (s) => ({ docs: s.docs }),
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<DocumentsState>;
        return { ...current, ...p, docs: p.docs ?? current.docs };
      },
    }
  )
);
