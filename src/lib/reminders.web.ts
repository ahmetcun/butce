import type { Bill, Settings } from '@/store/budget';

/** Web'de bildirim desteği yok; bu fonksiyonlar bir şey yapmaz. */
export const remindersSupported = false;

export async function requestReminderPermission() {
  return false;
}

export async function syncBillReminders(_bills: Bill[], _settings: Settings) {}

export function onReminderTap(_handler: (url: string) => void) {
  return () => {};
}
