import type { Bill, Settings } from '@/store/budget';

/** Web'de bildirim desteği yok; bu fonksiyonlar bir şey yapmaz. */
export const remindersSupported = false;

export async function requestReminderPermission() {
  return false;
}

export async function syncBillReminders(_bills: Bill[], _settings: Settings) {}

export type TestResult = { ok: boolean; message: string };

export async function sendTestNotification(_seconds = 5): Promise<TestResult> {
  return { ok: false, message: 'Web tarayıcısında bildirim yok; telefonda Expo Go ile dene.' };
}

export function onNotificationReceived(_handler: (title: string) => void) {
  return () => {};
}

export async function scheduledReminderCount() {
  return 0;
}

export function onReminderTap(_handler: (url: string) => void) {
  return () => {};
}
