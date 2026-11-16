import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FinancialSecurityConfig } from '@/types/finance';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'home'
  | 'health'
  | 'education'
  | 'fun'
  | 'shopping'
  | 'bills'
  | 'other';

export type FinanceExpense = {
  id: string;
  title: string;
  category: ExpenseCategory;
  amountLm: number;
  note?: string;
  spentAt: string;
  createdAt: string;
};

export type FinanceBudget = {
  id: string;
  title: string;
  /** null = genel aylık bütçe */
  category: ExpenseCategory | null;
  limitLm: number;
  createdAt: string;
};

export type FinanceGoal = {
  id: string;
  title: string;
  targetLm: number;
  savedLm: number;
  deadline?: string;
  createdAt: string;
};

export type SubscriptionFrequency = 'weekly' | 'monthly' | 'yearly';

export type FinanceSubscription = {
  id: string;
  title: string;
  amountLm: number;
  frequency: SubscriptionFrequency;
  nextDue: string; // YYYY-MM-DD
  category: ExpenseCategory;
  active: boolean;
  createdAt: string;
};

interface FinanceState {
  securityConfig: FinancialSecurityConfig;
  expenses: FinanceExpense[];
  budgets: FinanceBudget[];
  goals: FinanceGoal[];
  subscriptions: FinanceSubscription[];

  setPrivacyMode: (active: boolean) => void;
  setBiometricRequired: (required: boolean) => void;

  addExpense: (input: {
    title: string;
    category: ExpenseCategory;
    amountLm: number;
    note?: string;
    spentAt?: string;
  }) => void;
  removeExpense: (id: string) => void;
  clearExpenses: () => void;
  monthTotalLm: (monthKey?: string) => number;
  categoryMonthTotalLm: (category: ExpenseCategory, monthKey?: string) => number;

  addBudget: (input: {
    title: string;
    category: ExpenseCategory | null;
    limitLm: number;
  }) => void;
  removeBudget: (id: string) => void;

  addGoal: (input: { title: string; targetLm: number; deadline?: string }) => void;
  addToGoal: (id: string, amountLm: number) => void;
  removeGoal: (id: string) => void;

  addSubscription: (input: {
    title: string;
    amountLm: number;
    frequency: SubscriptionFrequency;
    nextDue: string;
    category: ExpenseCategory;
  }) => void;
  toggleSubscription: (id: string) => void;
  removeSubscription: (id: string) => void;
  monthlySubscriptionsLm: () => number;
}

function monthKeyFromIso(iso: string): string {
  return iso.slice(0, 7);
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function roundLm(n: number) {
  return Math.round(n * 100) / 100;
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Yemek',
  transport: 'Ulaşım',
  home: 'Ev',
  health: 'Sağlık',
  education: 'Eğitim',
  fun: 'Eğlence',
  shopping: 'Alışveriş',
  bills: 'Faturalar',
  other: 'Diğer',
};

export const SUBSCRIPTION_FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  weekly: 'Haftalık',
  monthly: 'Aylık',
  yearly: 'Yıllık',
};

/** Normalize subscription amount to approximate monthly LifeMoney. */
export function toMonthlyLm(amountLm: number, frequency: SubscriptionFrequency): number {
  if (frequency === 'weekly') return roundLm(amountLm * (52 / 12));
  if (frequency === 'yearly') return roundLm(amountLm / 12);
  return roundLm(amountLm);
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      securityConfig: {
        isBiometricRequired: false,
        isPrivacyModeActive: true,
        dataEncryption: 'e2ee',
      },
      expenses: [],
      budgets: [],
      goals: [],
      subscriptions: [],

      setPrivacyMode: (isPrivacyModeActive) =>
        set((state) => ({
          securityConfig: { ...state.securityConfig, isPrivacyModeActive },
        })),

      setBiometricRequired: (isBiometricRequired) =>
        set((state) => ({
          securityConfig: { ...state.securityConfig, isBiometricRequired },
        })),

      addExpense: ({ title, category, amountLm, note, spentAt }) => {
        const trimmed = title.trim();
        if (!trimmed || !Number.isFinite(amountLm) || amountLm <= 0) return;
        const now = new Date().toISOString();
        const entry: FinanceExpense = {
          id: uid('exp'),
          title: trimmed.slice(0, 80),
          category,
          amountLm: roundLm(amountLm),
          note: note?.trim().slice(0, 200) || undefined,
          spentAt: spentAt || now.slice(0, 10),
          createdAt: now,
        };
        set((state) => ({ expenses: [entry, ...state.expenses] }));
      },

      removeExpense: (id) =>
        set((state) => ({ expenses: state.expenses.filter((item) => item.id !== id) })),

      clearExpenses: () => set({ expenses: [] }),

      monthTotalLm: (monthKey) => {
        const key = monthKey || monthKeyFromIso(new Date().toISOString());
        return get()
          .expenses.filter((item) => monthKeyFromIso(item.spentAt) === key)
          .reduce((sum, item) => sum + item.amountLm, 0);
      },

      categoryMonthTotalLm: (category, monthKey) => {
        const key = monthKey || monthKeyFromIso(new Date().toISOString());
        return get()
          .expenses.filter(
            (item) => item.category === category && monthKeyFromIso(item.spentAt) === key
          )
          .reduce((sum, item) => sum + item.amountLm, 0);
      },

      addBudget: ({ title, category, limitLm }) => {
        const trimmed = title.trim();
        if (!trimmed || !Number.isFinite(limitLm) || limitLm <= 0) return;
        const budget: FinanceBudget = {
          id: uid('bud'),
          title: trimmed.slice(0, 80),
          category,
          limitLm: roundLm(limitLm),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ budgets: [budget, ...state.budgets] }));
      },

      removeBudget: (id) =>
        set((state) => ({ budgets: state.budgets.filter((item) => item.id !== id) })),

      addGoal: ({ title, targetLm, deadline }) => {
        const trimmed = title.trim();
        if (!trimmed || !Number.isFinite(targetLm) || targetLm <= 0) return;
        const goal: FinanceGoal = {
          id: uid('goal'),
          title: trimmed.slice(0, 80),
          targetLm: roundLm(targetLm),
          savedLm: 0,
          deadline: deadline || undefined,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ goals: [goal, ...state.goals] }));
      },

      addToGoal: (id, amountLm) => {
        if (!Number.isFinite(amountLm) || amountLm <= 0) return;
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  savedLm: roundLm(Math.min(goal.targetLm, goal.savedLm + amountLm)),
                }
              : goal
          ),
        }));
      },

      removeGoal: (id) =>
        set((state) => ({ goals: state.goals.filter((item) => item.id !== id) })),

      addSubscription: ({ title, amountLm, frequency, nextDue, category }) => {
        const trimmed = title.trim();
        if (!trimmed || !Number.isFinite(amountLm) || amountLm <= 0 || !nextDue) return;
        const sub: FinanceSubscription = {
          id: uid('sub'),
          title: trimmed.slice(0, 80),
          amountLm: roundLm(amountLm),
          frequency,
          nextDue,
          category,
          active: true,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ subscriptions: [sub, ...state.subscriptions] }));
      },

      toggleSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((item) =>
            item.id === id ? { ...item, active: !item.active } : item
          ),
        })),

      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((item) => item.id !== id),
        })),

      monthlySubscriptionsLm: () =>
        get()
          .subscriptions.filter((item) => item.active)
          .reduce((sum, item) => sum + toMonthlyLm(item.amountLm, item.frequency), 0),
    }),
    {
      name: 'life-finance-v2',
      partialize: (state) => ({
        securityConfig: state.securityConfig,
        expenses: state.expenses,
        budgets: state.budgets,
        goals: state.goals,
        subscriptions: state.subscriptions,
      }),
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<FinanceState>;
        return {
          ...current,
          ...p,
          expenses: p.expenses ?? current.expenses,
          budgets: p.budgets ?? current.budgets,
          goals: p.goals ?? current.goals,
          subscriptions: p.subscriptions ?? current.subscriptions,
          securityConfig: p.securityConfig ?? current.securityConfig,
        };
      },
    }
  )
);
