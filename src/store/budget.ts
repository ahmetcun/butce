import { storage } from '@/lib/storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GlyphName } from '@/components/icon';
import type { AccentKey } from '@/constants/theme';
import { MONTHS, monthKey, uid } from '@/lib/format';

export type TxType = 'expense' | 'income';

export type Member = { id: string; name: string; emoji: string };

export type Category = {
  id: string;
  name: string;
  icon: GlyphName;
  color: string;
  type: TxType;
  /** Aylık harcama limiti (yalnızca gider kategorileri) */
  limit?: number;
};

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  categoryId: string;
  memberId: string;
  note?: string;
  date: string;
  /** Düzenli ödemeden oluşturulduysa */
  billId?: string;
};

export type Bill = {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  /** Ayın kaçında ödenir */
  day: number;
  /** Ödendiği aylar: "2026-10" */
  paidMonths: string[];
};

export type Goal = { id: string; name: string; emoji: string; target: number; saved: number };

export type HomeSectionKey = 'quick' | 'bills' | 'budgets' | 'goals' | 'recent';

export const HomeSectionNames: Record<HomeSectionKey, string> = {
  quick: 'Hızlı Ekle',
  bills: 'Yaklaşan Ödemeler',
  budgets: 'Bütçe Limitleri',
  goals: 'Birikim Hedefleri',
  recent: 'Son İşlemler',
};

export type Settings = {
  userName: string;
  familyName: string;
  accent: AccentKey;
  themeMode: 'system' | 'light' | 'dark';
  hideBalance: boolean;
  homeSections: { key: HomeSectionKey; visible: boolean }[];
  /** Ekle ekranında varsayılan olarak seçili üye */
  defaultMemberId: string;
};

type State = {
  onboarded: boolean;
  settings: Settings;
  members: Member[];
  categories: Category[];
  transactions: Transaction[];
  bills: Bill[];
  goals: Goal[];
};

type Actions = {
  completeOnboarding: (p: { userName: string; familyName: string; accent: AccentKey; demo: boolean }) => void;
  updateSettings: (p: Partial<Settings>) => void;
  moveHomeSection: (key: HomeSectionKey, delta: -1 | 1) => void;
  toggleHomeSection: (key: HomeSectionKey) => void;

  addTransaction: (t: Omit<Transaction, 'id' | 'date'> & { date?: string }) => void;
  removeTransaction: (id: string) => void;

  addMember: (name: string, emoji: string) => void;
  removeMember: (id: string) => void;

  setCategoryLimit: (id: string, limit: number | undefined) => void;

  addBill: (b: Omit<Bill, 'id' | 'paidMonths'>) => void;
  removeBill: (id: string) => void;
  toggleBillPaid: (id: string, month?: string) => void;

  addGoal: (g: Omit<Goal, 'id' | 'saved'>) => void;
  contributeGoal: (id: string, amount: number) => void;
  removeGoal: (id: string) => void;

  resetAll: () => void;
};

const ME = 'me';

const defaultCategories: Category[] = [
  { id: 'market', name: 'Market', icon: 'cart', color: '#16A34A', type: 'expense' },
  { id: 'fatura', name: 'Faturalar', icon: 'bolt', color: '#EAB308', type: 'expense' },
  { id: 'konut', name: 'Kira / Konut', icon: 'house', color: '#8B5CF6', type: 'expense' },
  { id: 'ulasim', name: 'Ulaşım', icon: 'car', color: '#0EA5E9', type: 'expense' },
  { id: 'yemek', name: 'Dışarıda Yemek', icon: 'food', color: '#F97316', type: 'expense' },
  { id: 'saglik', name: 'Sağlık', icon: 'health', color: '#EF4444', type: 'expense' },
  { id: 'egitim', name: 'Eğitim', icon: 'school', color: '#6366F1', type: 'expense' },
  { id: 'cocuk', name: 'Çocuk', icon: 'child', color: '#EC4899', type: 'expense' },
  { id: 'giyim', name: 'Giyim', icon: 'clothes', color: '#14B8A6', type: 'expense' },
  { id: 'eglence', name: 'Eğlence', icon: 'fun', color: '#A855F7', type: 'expense' },
  { id: 'kredi', name: 'Kredi / Kart', icon: 'card', color: '#64748B', type: 'expense' },
  { id: 'diger', name: 'Diğer', icon: 'more', color: '#94A3B8', type: 'expense' },
  { id: 'maas', name: 'Maaş', icon: 'salary', color: '#16A34A', type: 'income' },
  { id: 'ekgelir', name: 'Ek Gelir', icon: 'extra', color: '#0EA5E9', type: 'income' },
  { id: 'kiragelir', name: 'Kira Geliri', icon: 'building', color: '#8B5CF6', type: 'income' },
  { id: 'hediye', name: 'Hediye / Diğer', icon: 'gift', color: '#F97316', type: 'income' },
];

const defaultSettings: Settings = {
  userName: '',
  familyName: '',
  accent: 'zumrut',
  themeMode: 'system',
  hideBalance: false,
  homeSections: [
    { key: 'quick', visible: true },
    { key: 'bills', visible: true },
    { key: 'budgets', visible: true },
    { key: 'goals', visible: true },
    { key: 'recent', visible: true },
  ],
  defaultMemberId: ME,
};

const initialState: State = {
  onboarded: false,
  settings: defaultSettings,
  members: [{ id: ME, name: 'Ben', emoji: '🙂' }],
  categories: defaultCategories,
  transactions: [],
  bills: [],
  goals: [],
};

/** İlk açılışta "örnek verilerle dene" seçilirse */
function demoData(userName: string): Pick<State, 'members' | 'transactions' | 'bills' | 'goals' | 'categories'> {
  const now = new Date();
  const day = (d: number, h = 12) => new Date(now.getFullYear(), now.getMonth(), Math.max(1, Math.min(d, now.getDate())), h).toISOString();
  const tx = (type: TxType, amount: number, categoryId: string, memberId: string, date: string, note?: string): Transaction => ({
    id: uid(), type, amount, categoryId, memberId, date, note,
  });
  const month = monthKey(now);
  return {
    members: [
      { id: ME, name: userName || 'Ben', emoji: '🙂' },
      { id: 'es', name: 'Eşim', emoji: '💐' },
      { id: 'cocuk1', name: 'Çocuk', emoji: '🧒' },
    ],
    categories: defaultCategories.map((c) =>
      c.id === 'market' ? { ...c, limit: 9000 }
        : c.id === 'yemek' ? { ...c, limit: 2500 }
          : c.id === 'ulasim' ? { ...c, limit: 3000 }
            : c.id === 'eglence' ? { ...c, limit: 1500 }
              : c,
    ),
    transactions: [
      tx('income', 52000, 'maas', ME, day(1, 9), `${MONTHS[now.getMonth()]} maaşı`),
      tx('income', 38000, 'maas', 'es', day(1, 10)),
      tx('expense', 18000, 'konut', ME, day(2), 'Kira'),
      tx('expense', 1840, 'market', 'es', day(3), 'Haftalık alışveriş'),
      tx('expense', 650, 'ulasim', ME, day(3), 'Akaryakıt'),
      tx('expense', 420, 'yemek', ME, day(4)),
      tx('expense', 2350, 'market', ME, day(5)),
      tx('expense', 780, 'cocuk', 'es', day(6), 'Okul kırtasiye'),
      tx('expense', 1290, 'fatura', ME, day(7), 'Elektrik'),
      tx('expense', 310, 'eglence', 'cocuk1', day(8)),
      tx('expense', 95, 'market', ME, day(9), 'Ekmek & süt'),
    ],
    bills: [
      { id: uid(), name: 'Kira', amount: 18000, categoryId: 'konut', day: 2, paidMonths: [month] },
      { id: uid(), name: 'Elektrik', amount: 1290, categoryId: 'fatura', day: 7, paidMonths: [month] },
      { id: uid(), name: 'İnternet', amount: 549, categoryId: 'fatura', day: 15, paidMonths: [] },
      { id: uid(), name: 'Doğalgaz', amount: 950, categoryId: 'fatura', day: 20, paidMonths: [] },
      { id: uid(), name: 'Kredi kartı', amount: 7400, categoryId: 'kredi', day: 25, paidMonths: [] },
    ],
    goals: [
      { id: uid(), name: 'Yaz tatili', emoji: '🏖️', target: 60000, saved: 21500 },
      { id: uid(), name: 'Acil durum fonu', emoji: '🛟', target: 100000, saved: 64000 },
    ],
  };
}

export const useBudget = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      completeOnboarding: ({ userName, familyName, accent, demo }) =>
        set((s) => ({
          onboarded: true,
          settings: { ...s.settings, userName, familyName, accent },
          members: s.members.map((m) => (m.id === ME ? { ...m, name: userName || 'Ben' } : m)),
          ...(demo ? demoData(userName) : {}),
        })),

      updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

      moveHomeSection: (key, delta) =>
        set((s) => {
          const list = [...s.settings.homeSections];
          const i = list.findIndex((x) => x.key === key);
          const j = i + delta;
          if (i < 0 || j < 0 || j >= list.length) return s;
          [list[i], list[j]] = [list[j], list[i]];
          return { settings: { ...s.settings, homeSections: list } };
        }),

      toggleHomeSection: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            homeSections: s.settings.homeSections.map((x) => (x.key === key ? { ...x, visible: !x.visible } : x)),
          },
        })),

      addTransaction: ({ date, ...t }) =>
        set((s) => ({
          transactions: [{ ...t, id: uid(), date: date ?? new Date().toISOString() }, ...s.transactions],
        })),

      removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addMember: (name, emoji) => set((s) => ({ members: [...s.members, { id: uid(), name, emoji }] })),

      removeMember: (id) =>
        set((s) => {
          if (id === ME) return s;
          return {
            members: s.members.filter((m) => m.id !== id),
            settings: s.settings.defaultMemberId === id ? { ...s.settings, defaultMemberId: ME } : s.settings,
          };
        }),

      setCategoryLimit: (id, limit) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, limit } : c)) })),

      addBill: (b) => set((s) => ({ bills: [...s.bills, { ...b, id: uid(), paidMonths: [] }] })),

      removeBill: (id) => set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),

      /** Ödendi işaretlenince gider olarak da kaydedilir; geri alınınca silinir. */
      toggleBillPaid: (id, month = monthKey()) => {
        const bill = get().bills.find((b) => b.id === id);
        if (!bill) return;
        const paid = bill.paidMonths.includes(month);
        set((s) => ({
          bills: s.bills.map((b) =>
            b.id === id
              ? { ...b, paidMonths: paid ? b.paidMonths.filter((m) => m !== month) : [...b.paidMonths, month] }
              : b,
          ),
          transactions: paid
            ? s.transactions.filter((t) => !(t.billId === id && monthKey(t.date) === month))
            : [
                {
                  id: uid(),
                  type: 'expense',
                  amount: bill.amount,
                  categoryId: bill.categoryId,
                  memberId: s.settings.defaultMemberId,
                  note: bill.name,
                  date: new Date().toISOString(),
                  billId: id,
                },
                ...s.transactions,
              ],
        }));
      },

      addGoal: (g) => set((s) => ({ goals: [...s.goals, { ...g, id: uid(), saved: 0 }] })),

      contributeGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g)),
        })),

      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      resetAll: () => set({ ...initialState }),
    }),
    {
      name: 'aile-butce-v1',
      storage: createJSONStorage(() => storage),
      partialize: (s) => Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function')) as State,
    },
  ),
);

/** Kayıtlı veriler diskten yüklendi mi? (Web'de anında, telefonda birkaç ms sonra.) */
export function useHydrated() {
  return useSyncExternalStore(
    (cb) => useBudget.persist.onFinishHydration(cb),
    () => useBudget.persist.hasHydrated(),
    () => false,
  );
}
