/**
 * Intl desteğine güvenmeden Türkçe para ve tarih biçimlendirme.
 * Örn: 12345.5 → "12.345,50 TL"
 */
export function formatMoney(value: number, opts: { decimals?: boolean; sign?: boolean } = {}) {
  const { decimals = true, sign = false } = opts;
  const abs = Math.abs(value);
  const fixed = abs.toFixed(decimals ? 2 : 0);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const prefix = value < 0 ? '-' : sign && value > 0 ? '+' : '';
  return `${prefix}${grouped}${frac ? ',' + frac : ''} TL`;
}

/** Akbank tarzı gösterim için: { int: "65", frac: ",80" } */
export function splitMoney(value: number) {
  const [int, frac] = formatMoney(value).replace(' TL', '').split(',');
  return { int, frac: ',' + frac };
}

export const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

/** "2026-10" biçiminde ay anahtarı */
export function monthKey(date: Date | string = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "Bugün", "Dün" ya da "3 Ekim" */
export function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return 'Bugün';
  if (isSameDay(d, yesterday)) return 'Dün';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 6) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
