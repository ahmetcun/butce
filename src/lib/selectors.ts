import { monthKey } from '@/lib/format';
import type { Bill, Category, Transaction } from '@/store/budget';

export function monthTransactions(transactions: Transaction[], month: string) {
  return transactions.filter((t) => monthKey(t.date) === month);
}

export function totals(transactions: Transaction[]) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

/** Kategori bazında harcama, büyükten küçüğe. */
export function spendByCategory(transactions: Transaction[], categories: Category[]) {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
  }
  return categories
    .filter((c) => c.type === 'expense')
    .map((c) => ({ category: c, spent: map.get(c.id) ?? 0 }))
    .sort((a, b) => b.spent - a.spent);
}

/** Bu ay henüz ödenmemiş düzenli ödemeler, en yakın günden başlayarak. */
export function upcomingBills(bills: Bill[], month = monthKey()) {
  return bills
    .filter((b) => !b.paidMonths.includes(month))
    .sort((a, b) => a.day - b.day);
}

/**
 * En sık kullanılan kategoriler; ekleme ekranında öne çıkarılır.
 * Az veri varsa varsayılan sıra korunur.
 */
export function frequentCategoryIds(transactions: Transaction[], type: 'expense' | 'income', limit = 30) {
  const counts = new Map<string, number>();
  for (const t of transactions.slice(0, 200)) {
    if (t.type !== type) continue;
    counts.set(t.categoryId, (counts.get(t.categoryId) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
}

/**
 * Tekrar eden giderler: aynı kategori + tutar + not ile 2+ kez girilenler.
 * Ana sayfada "tek dokunuşla tekrar ekle" kısayolu olarak gösterilir.
 */
export function quickTemplates(transactions: Transaction[], max = 6) {
  const seen = new Map<string, { t: Transaction; count: number }>();
  for (const t of transactions.slice(0, 300)) {
    if (t.billId || t.type === 'income') continue;
    const key = `${t.type}|${t.categoryId}|${t.amount}|${t.note ?? ''}`;
    const prev = seen.get(key);
    if (prev) prev.count++;
    else seen.set(key, { t, count: 1 });
  }
  return [...seen.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, max)
    .map((x) => x.t);
}
