import { router } from 'expo-router';
import { useEffect } from 'react';

import { onReminderTap, syncBillReminders } from '@/lib/reminders';
import { useBudget, useHydrated } from '@/store/budget';

/**
 * Faturalar ya da hatırlatma ayarları değiştikçe bildirimleri yeniden planlar.
 * Kök layout'ta bir kez çağrılır.
 */
export function useBillReminders() {
  const hydrated = useHydrated();
  const bills = useBudget((s) => s.bills);
  const settings = useBudget((s) => s.settings);
  const { billReminders, reminderDaysBefore, reminderHour } = settings;

  useEffect(() => {
    if (!hydrated) return;
    // Art arda gelen değişiklikleri tek seferde işle
    const id = setTimeout(() => {
      syncBillReminders(bills, useBudget.getState().settings).catch(() => {});
    }, 500);
    return () => clearTimeout(id);
  }, [hydrated, bills, billReminders, reminderDaysBefore, reminderHour]);

  useEffect(() => onReminderTap((url) => router.push(url as '/butce')), []);
}
