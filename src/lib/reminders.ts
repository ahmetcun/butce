import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { formatMoney, monthKey } from '@/lib/format';
import type { Bill, Settings } from '@/store/budget';

const CHANNEL = 'odemeler';
/** iOS en fazla 64 planlı bildirime izin veriyor */
const MAX_SCHEDULED = 60;
const MONTHS_AHEAD = 3;

export const remindersSupported = true;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** İzin ister; verildiyse true döner. */
export async function requestReminderPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Ödeme hatırlatmaları',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const res = await Notifications.requestPermissionsAsync();
  return res.granted;
}

/**
 * Tüm hatırlatmaları silip baştan planlar. Ödenmemiş her fatura için
 * önümüzdeki aylarda "X gün kaldı" ve "bugün son gün" bildirimleri kurulur.
 */
export async function syncBillReminders(bills: Bill[], settings: Settings) {
  // Yalnızca fatura hatırlatmalarını sil; bekleyen test bildirimi kalsın
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind !== 'test')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!settings.billReminders || bills.length === 0) return;

  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  const now = new Date();
  const items: { date: Date; title: string; body: string }[] = [];

  for (let m = 0; m < MONTHS_AHEAD; m++) {
    const year = now.getFullYear();
    const month = now.getMonth() + m;
    const key = monthKey(new Date(year, month, 1));
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (const b of bills) {
      if (b.paidMonths.includes(key)) continue;
      const due = new Date(year, month, Math.min(b.day, lastDay), settings.reminderHour);
      const amount = formatMoney(b.amount, { decimals: false });

      if (settings.reminderDaysBefore > 0) {
        const before = new Date(due);
        before.setDate(due.getDate() - settings.reminderDaysBefore);
        items.push({
          date: before,
          title: `${b.name} ödemesi yaklaşıyor`,
          body: `${settings.reminderDaysBefore} gün sonra son gün · ${amount}`,
        });
      }
      items.push({ date: due, title: `Bugün ${b.name} ödeme günü`, body: `${amount} ödemeyi unutma. Ödediysen uygulamada işaretle.` });
    }
  }

  const upcoming = items
    .filter((i) => i.date.getTime() > now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_SCHEDULED);

  for (const i of upcoming) {
    await Notifications.scheduleNotificationAsync({
      content: { title: i.title, body: i.body, data: { kind: 'bill', url: '/?bolum=odemeler' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: i.date, channelId: CHANNEL },
    });
  }
}

export type TestResult = { ok: boolean; message: string };

/**
 * Bildirimlerin çalıştığını dener: biri hemen, biri birkaç saniye sonra.
 * Sorun olursa nedenini metin olarak döndürür ki ekranda gösterilebilsin.
 */
export async function sendTestNotification(seconds = 5): Promise<TestResult> {
  try {
    if (!(await requestReminderPermission())) {
      const p = await Notifications.getPermissionsAsync();
      return { ok: false, message: `Bildirim izni yok (durum: ${p.status}). Ayarlar > Bildirimler > Expo Go'dan izin ver.` };
    }
    const content = {
      body: 'Bildirimler çalışıyor! Fatura hatırlatmaları bu şekilde gelecek.',
      data: { kind: 'test', url: '/?bolum=odemeler' },
    };
    // Hemen: uygulama açıkken üstte banner olarak görünmeli
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Test bildirimi 🔔', ...content },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL } : null,
    });
    // Gecikmeli: uygulamayı arka plana alınca kilit ekranında görünmeli
    await Notifications.scheduleNotificationAsync({
      content: { title: `Test bildirimi (${seconds} sn) 🔔`, ...content },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL },
    });
    return { ok: true, message: `Biri hemen, biri ${seconds} saniye sonra gelecek.` };
  } catch (e) {
    return { ok: false, message: `Hata: ${e instanceof Error ? e.message : String(e)}` };
  }
}

/** Uygulama açıkken bir bildirim ulaştığında haber verir (testin gerçekten geldiğini görmek için). */
export function onNotificationReceived(handler: (title: string) => void) {
  const sub = Notifications.addNotificationReceivedListener((n) => handler(n.request.content.title ?? ''));
  return () => sub.remove();
}

/** Şu an planlanmış fatura hatırlatması sayısı. */
export async function scheduledReminderCount() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.filter((n) => n.content.data?.kind === 'bill').length;
}

/** Bildirime dokunulunca ilgili ekranı açmak için. */
export function onReminderTap(handler: (url: string) => void) {
  const sub = Notifications.addNotificationResponseReceivedListener((res) => {
    const url = res.notification.request.content.data?.url;
    if (typeof url === 'string') handler(url);
  });
  return () => sub.remove();
}
