import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { MoneyInput, parseMoney, PillButton, TextField } from '@/components/form';
import type { HeroData } from '@/components/home/hero';
import { Icon } from '@/components/icon';
import { Card, Chip, EmptyState, IconBubble, ListCard, PromoBanner, Row, SectionLabel, T, Touch } from '@/components/ui';
import { enter, layout } from '@/constants/motion';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/lib/confirm';
import { formatMoney, monthKey } from '@/lib/format';
import { remindersSupported, requestReminderPermission } from '@/lib/reminders';
import { useBudget } from '@/store/budget';

export function useOdemelerHero({ setAdding }: { setAdding: (v: boolean) => void }): HeroData {
  const bills = useBudget((s) => s.bills);
  const reminders = useBudget((s) => s.settings.billReminders);
  const updateSettings = useBudget((s) => s.updateSettings);
  const month = monthKey();
  const unpaid = bills.filter((b) => !b.paidMonths.includes(month));
  const remaining = unpaid.reduce((a, b) => a + b.amount, 0);

  return {
    label: 'Bu ay ödenecek',
    value: remaining,
    pill: { icon: 'calendar', text: `${bills.length} düzenli ödeme · ${unpaid.length} bekliyor` },
    actions: [
      { icon: 'plusCircle', label: 'Ödeme ekle', onPress: () => setAdding(true) },
      {
        icon: 'bellOutline',
        label: reminders ? 'Hatırlatıcı ✓' : 'Hatırlat',
        onPress: async () => {
          if (reminders) return router.push('/profil');
          if (await requestReminderPermission()) updateSettings({ billReminders: true });
          else router.push('/profil');
        },
      },
      { icon: 'arrowUp', label: 'Gider ekle', onPress: () => router.push('/ekle') },
    ],
  };
}

export function OdemelerBody({ adding, setAdding }: { adding: boolean; setAdding: (v: boolean) => void }) {
  const t = useTheme();
  const bills = useBudget((s) => s.bills);
  const categories = useBudget((s) => s.categories);
  const reminders = useBudget((s) => s.settings.billReminders);
  const updateSettings = useBudget((s) => s.updateSettings);
  const toggleBillPaid = useBudget((s) => s.toggleBillPaid);
  const removeBill = useBudget((s) => s.removeBill);
  const addBill = useBudget((s) => s.addBill);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [categoryId, setCategoryId] = useState('fatura');
  const [promoClosed, setPromoClosed] = useState(false);

  const month = monthKey();
  const today = new Date().getDate();
  const sorted = [...bills].sort((a, b) => a.day - b.day);

  const submit = () => {
    const n = parseMoney(amount);
    if (!name.trim() || !n) return;
    addBill({ name: name.trim(), amount: n, day: Math.min(31, Math.max(1, Number(day) || 1)), categoryId });
    setName('');
    setAmount('');
    setDay('');
    setAdding(false);
  };

  return (
    <View>
      {remindersSupported && !reminders && bills.length > 0 && !promoClosed ? (
        <View style={{ marginTop: Spacing.four }}>
          <PromoBanner
            icon="bellOutline"
            text="Son ödeme gününden önce haber verelim."
            action="Hatırlatmaları aç"
            onPress={async () => {
              if (await requestReminderPermission()) updateSettings({ billReminders: true });
            }}
            onClose={() => setPromoClosed(true)}
          />
        </View>
      ) : null}

      {adding ? (
        <Animated.View entering={enter}>
          <SectionLabel action="Vazgeç" onAction={() => setAdding(false)}>
            Yeni düzenli ödeme
          </SectionLabel>
          <Card style={{ gap: Spacing.two }}>
            <TextField value={name} onChange={setName} placeholder="Ödeme adı (Örn: İnternet)" autoFocus />
            <Row style={{ gap: Spacing.two }}>
              <MoneyInput value={amount} onChange={setAmount} placeholder="Tutar (TL)" />
              <TextField value={day} onChange={setDay} placeholder="Ayın günü" keyboardType="number-pad" style={{ width: 110 }} />
            </Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {categories
                .filter((c) => c.type === 'expense')
                .map((c) => (
                  <Chip key={c.id} label={c.name} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
                ))}
            </ScrollView>
            <PillButton label="Ödemeyi kaydet" onPress={submit} />
          </Card>
        </Animated.View>
      ) : null}

      <SectionLabel action={adding ? undefined : 'Ekle'} onAction={() => setAdding(true)}>
        Faturalar ve ödemeler
      </SectionLabel>
      <ListCard>
        {sorted.length === 0 ? (
          <EmptyState icon="calendar" text="Kira, fatura, kredi kartı gibi her ay tekrar eden ödemelerini ekle; günü gelince hatırlatalım." />
        ) : (
          sorted.map((b, i) => {
            const c = categories.find((x) => x.id === b.categoryId);
            const paid = b.paidMonths.includes(month);
            const late = !paid && b.day < today;
            return (
              <Animated.View key={b.id} layout={layout}>
                <Touch
                  pressScale={0.98}
                  onPress={() => toggleBillPaid(b.id)}
                  onLongPress={() => confirm('Ödeme silinsin mi?', `"${b.name}" listeden kaldırılacak.`, () => removeBill(b.id))}
                  style={[styles.row, i < sorted.length - 1 && { borderBottomColor: t.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                  <IconBubble icon={c?.icon ?? 'bill'} color={c?.color ?? t.textMuted} />
                  <View style={{ flex: 1 }}>
                    <T v="bodyBold" style={paid && { textDecorationLine: 'line-through', opacity: 0.5 }}>
                      {b.name}
                    </T>
                    <T v="small" color={late ? t.expense : t.textMuted}>
                      {paid ? 'Bu ay ödendi' : late ? `Gecikti · ayın ${b.day}'i` : b.day === today ? 'Son gün bugün' : `Ayın ${b.day}'i · ${b.day - today} gün kaldı`}
                    </T>
                  </View>
                  <T v="bodyBold" style={paid && { opacity: 0.5 }}>
                    {formatMoney(b.amount)}
                  </T>
                  <View style={[styles.check, { borderColor: paid ? t.income : t.border, backgroundColor: paid ? t.income : 'transparent' }]}>
                    {paid ? (
                      <Animated.View entering={enter}>
                        <Icon name="check" color="#fff" size={15} />
                      </Animated.View>
                    ) : null}
                  </View>
                </Touch>
              </Animated.View>
            );
          })
        )}
      </ListCard>
      {sorted.length > 0 ? (
        <T v="small" muted style={{ textAlign: 'center', marginTop: 12 }}>
          Dokun: ödendi işaretle (gider olarak da eklenir) · Basılı tut: sil
        </T>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
