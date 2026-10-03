import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { IconButton, Page, PageHeader } from '@/components/headers';
import { Icon } from '@/components/icon';
import { TransactionRow } from '@/components/transaction-row';
import { Card, Chip, EmptyState, Row, T, Touch } from '@/components/ui';
import { enter } from '@/constants/motion';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/lib/confirm';
import { dayLabel, formatMoney, monthKey, monthLabel, shiftMonth } from '@/lib/format';
import { monthTransactions, totals } from '@/lib/selectors';
import { useBudget, type TxType } from '@/store/budget';

export default function Transactions() {
  const t = useTheme();
  const params = useLocalSearchParams<{ ara?: string; uye?: string; tur?: TxType }>();
  const transactions = useBudget((s) => s.transactions);
  const members = useBudget((s) => s.members);
  const categories = useBudget((s) => s.categories);
  const removeTransaction = useBudget((s) => s.removeTransaction);

  const [month, setMonth] = useState(monthKey());
  const [type, setType] = useState<TxType | 'all'>(params.tur ?? 'all');
  const [memberId, setMemberId] = useState<string | null>(params.uye ?? null);
  const [searching, setSearching] = useState(params.ara === '1');
  const [query, setQuery] = useState('');

  // Ana sayfadan filtreyle ya da aramayla gelindiğinde
  const paramKey = `${params.uye}|${params.tur}|${params.ara}`;
  const [lastParams, setLastParams] = useState(paramKey);
  if (paramKey !== lastParams) {
    setLastParams(paramKey);
    setMemberId(params.uye ?? null);
    setType(params.tur ?? 'all');
    if (params.ara === '1') setSearching(true);
  }

  const inMonth = useMemo(() => monthTransactions(transactions, month), [transactions, month]);
  const sum = useMemo(() => totals(inMonth), [inMonth]);

  const groups = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    const source = q ? transactions : inMonth;
    const filtered = source
      .filter((x) => type === 'all' || x.type === type)
      .filter((x) => !memberId || x.memberId === memberId)
      .filter((x) => {
        if (!q) return true;
        const c = categories.find((c) => c.id === x.categoryId);
        const m = members.find((m) => m.id === x.memberId);
        return [x.note, c?.name, m?.name].some((s) => s?.toLocaleLowerCase('tr-TR').includes(q));
      })
      .sort((a, b) => b.date.localeCompare(a.date));
    const map = new Map<string, typeof filtered>();
    for (const x of filtered) {
      // ISO tarih UTC'dir; gün gruplaması yerel saate göre yapılmalı
      const key = new Date(x.date).toDateString();
      map.set(key, [...(map.get(key) ?? []), x]);
    }
    return [...map.entries()];
  }, [inMonth, transactions, type, memberId, query, categories, members]);

  const isCurrent = month === monthKey();

  return (
    <Page
      header={
        <PageHeader
          title="İşlemler"
          right={
            <IconButton
              icon={searching ? 'close' : 'search'}
              label={searching ? 'Aramayı kapat' : 'Ara'}
              onPress={() => {
                setSearching((v) => !v);
                setQuery('');
              }}
            />
          }>
          {searching ? (
            <Animated.View entering={enter} style={[styles.search, { backgroundColor: t.surface }]}>
              <Icon name="search" size={20} color={t.textMuted} weight="line" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                autoFocus
                placeholder="Market, kira, Ahmet..."
                placeholderTextColor={t.textMuted}
                returnKeyType="search"
                style={[styles.searchInput, { color: t.text }]}
              />
            </Animated.View>
          ) : (
            // Siyah hap ay seçici
            <View style={{ alignItems: 'center', marginTop: Spacing.two }}>
              <Row style={[styles.monthPill, { backgroundColor: t.ink }]}>
                <Touch onPress={() => setMonth((m) => shiftMonth(m, -1))} hitSlop={10} accessibilityLabel="Önceki ay" style={styles.monthArrow}>
                  <View style={{ transform: [{ scaleX: -1 }] }}>
                    <Icon name="chevronRight" color={t.onInk} size={16} />
                  </View>
                </Touch>
                <T v="bodyBold" color={t.onInk} style={{ minWidth: 104, textAlign: 'center' }}>
                  {monthLabel(month)}
                </T>
                <Touch
                  onPress={() => !isCurrent && setMonth((m) => shiftMonth(m, 1))}
                  hitSlop={10}
                  accessibilityLabel="Sonraki ay"
                  style={[styles.monthArrow, { opacity: isCurrent ? 0.3 : 1 }]}>
                  <Icon name="chevronRight" color={t.onInk} size={16} />
                </Touch>
              </Row>
              <Row style={{ gap: Spacing.three, marginTop: 12 }}>
                <T v="small" color={t.income}>
                  +{formatMoney(sum.income, { decimals: false })}
                </T>
                <T v="small" color={t.expense}>
                  -{formatMoney(sum.expense, { decimals: false })}
                </T>
                <T v="small" muted>
                  Fark {formatMoney(sum.balance, { decimals: false, sign: true })}
                </T>
              </Row>
            </View>
          )}
        </PageHeader>
      }>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -Spacing.three }}
        contentContainerStyle={{ gap: 6, paddingVertical: Spacing.three, paddingHorizontal: Spacing.three }}>
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
          <EmptyState icon={query ? 'search' : 'list'} text={query ? `"${query}" ile eşleşen işlem yok.` : 'Bu dönemde işlem yok.'} />
        </Card>
      ) : (
        <View>
          {groups.map(([day, list]) => (
            <View key={day}>
              {/* Ortalanmış gri gün başlığı */}
              <T v="body" muted style={styles.dayHeader}>
                {dayLabel(list[0].date)}
              </T>
              <View style={{ gap: 10 }}>
                {list.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    card
                    onLongPress={() =>
                      confirm('İşlem silinsin mi?', `${formatMoney(tx.amount)} tutarındaki işlem silinecek.`, () => removeTransaction(tx.id))
                    }
                  />
                ))}
              </View>
            </View>
          ))}
          <T v="small" muted style={{ textAlign: 'center', marginTop: Spacing.four }}>
            Silmek için işleme basılı tut
          </T>
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    marginTop: Spacing.two,
    borderRadius: Radius.pill,
    paddingHorizontal: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FontFamily.regular,
    height: '100%',
  },
  monthPill: {
    height: 46,
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    gap: 4,
  },
  monthArrow: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeader: {
    textAlign: 'center',
    marginTop: Spacing.four,
    marginBottom: 12,
  },
});
