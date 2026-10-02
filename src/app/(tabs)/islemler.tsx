import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { TransactionRow } from '@/components/transaction-row';
import { Card, Chip, EmptyState, Row, T, Touch } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/lib/confirm';
import { dayLabel, formatMoney, monthKey, monthLabel, shiftMonth } from '@/lib/format';
import { monthTransactions, totals } from '@/lib/selectors';
import { useBudget, type TxType } from '@/store/budget';

export default function Transactions() {
  const t = useTheme();
  const transactions = useBudget((s) => s.transactions);
  const members = useBudget((s) => s.members);
  const removeTransaction = useBudget((s) => s.removeTransaction);

  const [month, setMonth] = useState(monthKey());
  const [type, setType] = useState<TxType | 'all'>('all');
  const [memberId, setMemberId] = useState<string | null>(null);

  const inMonth = useMemo(() => monthTransactions(transactions, month), [transactions, month]);
  const sum = useMemo(() => totals(inMonth), [inMonth]);

  const groups = useMemo(() => {
    const filtered = inMonth
      .filter((x) => type === 'all' || x.type === type)
      .filter((x) => !memberId || x.memberId === memberId)
      .sort((a, b) => b.date.localeCompare(a.date));
    const map = new Map<string, typeof filtered>();
    for (const x of filtered) {
      // ISO tarih UTC'dir; gün gruplaması yerel saate göre yapılmalı
      const key = new Date(x.date).toDateString();
      map.set(key, [...(map.get(key) ?? []), x]);
    }
    return [...map.entries()];
  }, [inMonth, type, memberId]);

  const isCurrent = month === monthKey();

  return (
    <Screen
      title="İşlemler"
      hero={
        <View style={{ marginTop: Spacing.three, gap: Spacing.three }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Touch onPress={() => setMonth((m) => shiftMonth(m, -1))} hitSlop={12} accessibilityLabel="Önceki ay">
              <View style={{ transform: [{ scaleX: -1 }] }}>
                <Icon name="chevronRight" color="#fff" size={22} />
              </View>
            </Touch>
            <T v="heading" color="#fff">
              {monthLabel(month)}
            </T>
            <Touch
              onPress={() => !isCurrent && setMonth((m) => shiftMonth(m, 1))}
              hitSlop={12}
              accessibilityLabel="Sonraki ay"
              style={{ opacity: isCurrent ? 0.3 : 1 }}>
              <Icon name="chevronRight" color="#fff" size={22} />
            </Touch>
          </Row>
          <Row style={{ justifyContent: 'space-around' }}>
            <Stat label="GELİR" value={formatMoney(sum.income, { decimals: false })} />
            <Stat label="GİDER" value={formatMoney(sum.expense, { decimals: false })} />
            <Stat label="FARK" value={formatMoney(sum.balance, { decimals: false, sign: true })} />
          </Row>
        </View>
      }>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingVertical: Spacing.three }}>
        <Chip label="Tümü" selected={type === 'all'} onPress={() => setType('all')} />
        <Chip label="Gider" selected={type === 'expense'} onPress={() => setType('expense')} />
        <Chip label="Gelir" selected={type === 'income'} onPress={() => setType('income')} />
        {members.length > 1 && <View style={{ width: 1, backgroundColor: t.border, marginHorizontal: 4 }} />}
        {members.length > 1 &&
          members.map((m) => (
            <Chip
              key={m.id}
              label={`${m.emoji} ${m.name}`}
              selected={memberId === m.id}
              onPress={() => setMemberId((cur) => (cur === m.id ? null : m.id))}
            />
          ))}
      </ScrollView>

      {groups.length === 0 ? (
        <Card>
          <EmptyState icon="list" text="Bu dönemde işlem yok." />
        </Card>
      ) : (
        <View style={{ gap: Spacing.three }}>
          {groups.map(([day, list]) => {
            const net = totals(list).balance;
            return (
              <View key={day} style={{ gap: 6 }}>
                <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
                  <T v="small" muted style={{ fontWeight: '700' }}>
                    {dayLabel(list[0].date)}
                  </T>
                  <T v="small" muted>
                    {formatMoney(net, { sign: true, decimals: false })}
                  </T>
                </Row>
                <Card style={{ paddingVertical: Spacing.one }}>
                  {list.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      onLongPress={() =>
                        confirm('İşlem silinsin mi?', `${formatMoney(tx.amount)} tutarındaki işlem silinecek.`, () =>
                          removeTransaction(tx.id),
                        )
                      }
                    />
                  ))}
                </Card>
              </View>
            );
          })}
          <T v="small" muted style={{ textAlign: 'center' }}>
            Silmek için işleme basılı tut
          </T>
        </View>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <T v="caption" color="rgba(255,255,255,0.75)">
        {label}
      </T>
      <T v="bodyBold" color="#fff">
        {value}
      </T>
    </View>
  );
}
