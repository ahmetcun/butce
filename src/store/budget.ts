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
  /** Düzenli ödemeler için hatırlatma bildirimi */
  billReminders: boolean;
  /** Son ödeme gününden kaç gün önce hatırlatılsın */
  reminderDaysBefore: number;
  /** Hatırlatma saati (0-23) */
  reminderHour: number;
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
  reorderHomeSections: (keys: HomeSectionKey[]) => void;
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

  /** Mevcut işlem, ödeme, hedef ve üyelerin yerine örnek verileri koyar (ayarlar korunur). */
  loadDemoData: () => void;
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
  billReminders: false,
  reminderDaysBefore: 2,
  reminderHour: 9,
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

/**
 * Örnek veriler: son 3 ayın gerçekçi aile harcamaları. Bazı faturaların son günü
 * önümüzdeki günlere denk gelir; böylece hatırlatmalar hemen planlanır.
 * Rastgelelik sabit tohumlu, her yüklemede aynı sonucu verir.
 */
function demoData(userName: string): Pick<State, 'members' | 'transactions' | 'bills' | 'goals' | 'categories'> {
  const now = new Date();
  let seed = 42;
  const rand = (min: number, max: number) => {
    seed = (seed * 16807) % 2147483647;
    return Math.round(min + ((seed - 1) / 2147483646) * (max - min));
  };

  const transactions: Transaction[] = [];
  const add = (monthsAgo: number, dayOfMonth: number, type: TxType, amount: number, categoryId: string, memberId: string, note?: string) => {
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, dayOfMonth, rand(9, 20), rand(0, 59));
    if (d.getMonth() !== (now.getMonth() - monthsAgo + 12) % 12) return; // ayın son gününü taşma
    if (d > now) return; // gelecek tarihli işlem olmasın
    transactions.push({ id: uid(), type, amount, categoryId, memberId, date: d.toISOString(), note });
  };

  for (const m of [2, 1, 0]) {
    const monthName = MONTHS[(now.getMonth() - m + 12) % 12];
    add(m, 1, 'income', 52000, 'maas', ME, `${monthName} maaşı`);
    add(m, 1, 'income', 38000, 'maas', 'es', `${monthName} maaşı`);
    add(m, 2, 'expense', 18000, 'konut', ME, 'Kira');
    for (const d of [3, 10, 17, 24]) add(m, d, 'expense', rand(1400, 2600), 'market', d % 2 ? 'es' : ME, 'Haftalık alışveriş');
    for (let d = 2; d <= 30; d += rand(2, 4)) add(m, d, 'expense', rand(60, 180), 'market', ME, 'Ekmek & süt');
    for (const d of [5, 19]) add(m, d, 'expense', rand(600, 950), 'ulasim', ME, 'Akaryakıt');
    for (const d of [8, 15, 22, 27]) add(m, d, 'expense', rand(280, 750), 'yemek', d % 2 ? 'es' : ME);
    add(m, 7, 'expense', rand(1150, 1450), 'fatura', ME, 'Elektrik');
    add(m, 12, 'expense', rand(400, 950), 'cocuk', 'es', 'Okul masrafı');
    for (const d of [14, 28]) add(m, d, 'expense', rand(180, 480), 'eglence', 'cocuk1');
    add(m, 18, 'expense', rand(250, 600), 'saglik', 'es', 'Eczane');
    add(m, 25, 'expense', 7400, 'kredi', ME, 'Kredi kartı');
  }
  add(1, 16, 'income', 3500, 'ekgelir', ME, 'Serbest iş');
  add(1, 21, 'expense', 2400, 'giyim', 'es', 'Kışlık mont');
  add(2, 11, 'expense', 1850, 'egitim', 'cocuk1', 'Kurs ücreti');
  transactions.sort((x, y) => y.date.localeCompare(x.date));

  // Son günleri bugünden itibaren yakın tarihlere denk gelen faturalar
  const today = now.getDate();
  const soon = (n: number) => Math.min(28, today + n);
  const month = monthKey(now);
  const paidIfPast = (d: number) => (d < today ? [month] : []);

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
    transactions,
    bills: [
      { id: uid(), name: 'Kira', amount: 18000, categoryId: 'konut', day: 2, paidMonths: paidIfPast(2) },
      { id: uid(), name: 'Elektrik', amount: 1290, categoryId: 'fatura', day: 7, paidMonths: paidIfPast(7) },
      { id: uid(), name: 'İnternet', amount: 549, categoryId: 'fatura', day: soon(1), paidMonths: [] },
      { id: uid(), name: 'Su', amount: 320, categoryId: 'fatura', day: soon(2), paidMonths: [] },
      { id: uid(), name: 'Doğalgaz', amount: 950, categoryId: 'fatura', day: soon(4), paidMonths: [] },
      { id: uid(), name: 'Kredi kartı', amount: 7400, categoryId: 'kredi', day: 25, paidMonths: paidIfPast(25) },
    ],
    goals: [
      { id: uid(), name: 'Yaz tatili', emoji: '🏖️', target: 60000, saved: 21500 },
      { id: uid(), name: 'Acil durum fonu', emoji: '🛟', target: 100000, saved: 64000 },
      { id: uid(), name: 'Yeni araba', emoji: '🚗', target: 400000, saved: 85000 },
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

      reorderHomeSections: (keys) =>
        set((s) => {
          const byKey = new Map(s.settings.homeSections.map((x) => [x.key, x]));
          const list = keys.map((k) => byKey.get(k)).filter((x) => x !== undefined);
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

      loadDemoData: () => set((s) => ({ ...demoData(s.settings.userName), settings: { ...s.settings, defaultMemberId: ME } })),

      resetAll: () => set({ ...initialState }),
    }),
    {
      name: 'aile-butce-v1',
      storage: createJSONStorage(() => storage),
      // Yeni eklenen ayarlar eski kayıtlarda yok; varsayılanlarla tamamla
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return { ...current, ...p, settings: { ...current.settings, ...p.settings } };
      },
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
