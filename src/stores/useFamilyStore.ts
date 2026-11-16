import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamilyUnit, FamilyMember, FamilyRole } from '@/types/family';

export type FamilyNote = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type FamilyEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
};

export type FamilyMemory = {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
};

export type FamilyPost = {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
};

interface FamilyState {
  family: FamilyUnit | null;
  notes: FamilyNote[];
  events: FamilyEvent[];
  memories: FamilyMemory[];
  posts: FamilyPost[];
  isLoading: boolean;

  createFamily: (name: string, myName: string, myRole: FamilyRole, avatarEmoji?: string) => void;
  inviteMember: (name: string, role: FamilyRole, avatarEmoji?: string) => void;
  removeMember: (memberId: string) => void;
  renameFamily: (name: string) => void;
  resetFamily: () => void;

  addNote: (title: string, body: string) => void;
  removeNote: (id: string) => void;
  addEvent: (title: string, date: string, note?: string) => void;
  removeEvent: (id: string) => void;
  addMemory: (title: string, description: string, date: string) => void;
  removeMemory: (id: string) => void;
  addPost: (text: string) => void;
  removePost: (id: string) => void;
}

function generateInviteCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LIFE-FAM-${num}`;
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const ROLE_EMOJIS: Record<FamilyRole, string> = {
  mother: '👩',
  father: '👨',
  child: '🧒',
  grandfather: '👴',
  grandmother: '👵',
  sibling: '🧑',
  spouse: '💍',
  other: '👤',
};

const ROLE_GRADIENTS: Record<FamilyRole, string> = {
  mother: 'from-pink-500 to-rose-600',
  father: 'from-blue-500 to-indigo-600',
  child: 'from-amber-400 to-orange-500',
  grandfather: 'from-emerald-500 to-teal-600',
  grandmother: 'from-purple-400 to-violet-600',
  sibling: 'from-cyan-400 to-blue-500',
  spouse: 'from-red-400 to-pink-500',
  other: 'from-stone-400 to-gray-600',
};

export { ROLE_EMOJIS };

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      family: null,
      notes: [],
      events: [],
      memories: [],
      posts: [],
      isLoading: false,

      createFamily: (name, myName, myRole, avatarEmoji = '🏡') => {
        const creatorMember: FamilyMember = {
          id: uid('mem'),
          name: myName.trim() || 'Ben',
          role: myRole,
          avatarEmoji: ROLE_EMOJIS[myRole] || '👤',
          avatarBg: ROLE_GRADIENTS[myRole] || 'from-amber-400 to-orange-500',
          isCurrentUser: true,
          isAdmin: true,
          joinedAt: new Date().toISOString(),
          status: 'active',
        };

        set({
          family: {
            id: uid('fam'),
            name: name.trim() || 'Yeni Ailemiz',
            avatarEmoji,
            inviteCode: generateInviteCode(),
            createdAt: new Date().toISOString(),
            createdBy: creatorMember.id,
            members: [creatorMember],
          },
        });
      },

      inviteMember: (name, role, customEmoji) => {
        const currentFamily = get().family;
        if (!currentFamily) return;
        const trimmed = name.trim();
        if (!trimmed) return;

        const newMember: FamilyMember = {
          id: uid('mem'),
          name: trimmed.slice(0, 40),
          role,
          avatarEmoji: customEmoji || ROLE_EMOJIS[role] || '👤',
          avatarBg: ROLE_GRADIENTS[role] || 'from-blue-400 to-indigo-600',
          isCurrentUser: false,
          isAdmin: false,
          joinedAt: new Date().toISOString(),
          status: 'active',
        };

        set({
          family: {
            ...currentFamily,
            members: [...currentFamily.members, newMember],
          },
        });
      },

      removeMember: (memberId) => {
        const currentFamily = get().family;
        if (!currentFamily) return;
        const target = currentFamily.members.find((m) => m.id === memberId);
        if (!target || target.isCurrentUser) return;

        set({
          family: {
            ...currentFamily,
            members: currentFamily.members.filter((m) => m.id !== memberId),
          },
        });
      },

      renameFamily: (name) => {
        const currentFamily = get().family;
        if (!currentFamily) return;
        const trimmed = name.trim();
        if (!trimmed) return;
        set({ family: { ...currentFamily, name: trimmed.slice(0, 60) } });
      },

      resetFamily: () =>
        set({
          family: null,
          notes: [],
          events: [],
          memories: [],
          posts: [],
        }),

      addNote: (title, body) => {
        const t = title.trim();
        if (!t) return;
        const now = new Date().toISOString();
        const note: FamilyNote = {
          id: uid('note'),
          title: t.slice(0, 80),
          body: body.trim().slice(0, 2000),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ notes: [note, ...state.notes] }));
      },

      removeNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

      addEvent: (title, date, note) => {
        const t = title.trim();
        if (!t || !date) return;
        const event: FamilyEvent = {
          id: uid('evt'),
          title: t.slice(0, 80),
          date,
          note: note?.trim().slice(0, 300) || undefined,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          events: [event, ...state.events].sort((a, b) => a.date.localeCompare(b.date)),
        }));
      },

      removeEvent: (id) =>
        set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

      addMemory: (title, description, date) => {
        const t = title.trim();
        if (!t) return;
        const memory: FamilyMemory = {
          id: uid('memry'),
          title: t.slice(0, 80),
          description: description.trim().slice(0, 1000),
          date: date || new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ memories: [memory, ...state.memories] }));
      },

      removeMemory: (id) =>
        set((state) => ({ memories: state.memories.filter((m) => m.id !== id) })),

      addPost: (text) => {
        const body = text.trim();
        if (!body) return;
        const family = get().family;
        const author =
          family?.members.find((m) => m.isCurrentUser)?.name || 'Ben';
        const post: FamilyPost = {
          id: uid('post'),
          text: body.slice(0, 500),
          authorName: author,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ posts: [post, ...state.posts] }));
      },

      removePost: (id) =>
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),
    }),
    {
      name: 'life-family-v2',
      partialize: (state) => ({
        family: state.family,
        notes: state.notes,
        events: state.events,
        memories: state.memories,
        posts: state.posts,
      }),
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<FamilyState>;
        // Drop legacy sample family if somehow restored
        const family =
          p.family?.id === 'fam_sample_01' ? null : (p.family ?? current.family);
        return {
          ...current,
          ...p,
          family,
          notes: p.notes ?? current.notes,
          events: p.events ?? current.events,
          memories: p.memories ?? current.memories,
          posts: p.posts ?? current.posts,
        };
      },
    }
  )
);
