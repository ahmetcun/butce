import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Page, PageHeader } from '@/components/headers';
import { Icon } from '@/components/icon';
import { TransactionRow } from '@/components/transaction-row';
import { Card, Chip, EmptyState, RoundAction, Row, SectionLabel, T, Touch } from '@/components/ui';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/lib/confirm';
import { dayLabel, formatMoney, monthKey, monthLabel, shiftMonth } from '@/lib/format';
import { frequentCategoryIds, monthTransactions, totals } from '@/lib/selectors';
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
  const [query, setQuery] = useState('');

  // Ana sayfadaki kartlardan filtreyle gelindiğinde
  const [lastParams, setLastParams] = useState(`${params.uye}|${params.tur}`);
  if (`${params.uye}|${params.tur}` !== lastParams) {
    setLastParams(`${params.uye}|${params.tur}`);
    setMemberId(params.uye ?? null);
    setType(params.tur ?? 'all');
  }

  const frequent = useMemo(() => {
    const ids = frequentCategoryIds(transactions, 'expense');
    const list = categories.filter((c) => c.type === 'expense');
    return [...ids.map((id) => list.find((c) => c.id === id)).filter((c) => c !== undefined), ...list.filter((c) => !ids.includes(c.id))].slice(0, 4);
  }, [transactions, categories]);

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
          subtitle="Ailenin tüm gelir ve giderleri"
          search={
            <View style={[styles.search, { backgroundColor: t.surface }]}>
              <Icon name="search" size={22} color={t.text} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                autoFocus={params.ara === '1'}
                placeholder="Market, kira, Ahmet..."
                placeholderTextColor={t.textMuted}
                returnKeyType="search"
                style={[styles.searchInput, { color: t.text }]}
              />
              {query ? (
                <Touch onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Aramayı temizle">
                  <Icon name="close" size={18} color={t.textMuted} />
                </Touch>
              ) : null}
            </View>
          }
        />
      }>
      {!query ? (
        <>
          <SectionLabel>Önerilen hızlı işlemler</SectionLabel>
          <Row style={{ alignItems: 'flex-start' }}>
            {frequent.map((c) => (
              <RoundAction
                key={c.id}
                icon={c.icon}
                label={c.name}
                onPress={() => router.push({ pathname: '/ekle', params: { kategori: c.id } })}
              />
            ))}
          </Row>

          {/* Ay seçici ve özet */}
          <Card style={{ marginTop: Spacing.four }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Touch onPress={() => setMonth((m) => shiftMonth(m, -1))} hitSlop={12} style={[styles.arrow, { backgroundColor: t.surfaceAlt }]} accessibilityLabel="Önceki ay">
                <View style={{ transform: [{ scaleX: -1 }] }}>
                  <Icon name="chevronRight" color={t.text} size={16} />
                </View>
              </Touch>
              <T v="heading">{monthLabel(month)}</T>
              <Touch
                onPress={() => !isCurrent && setMonth((m) => shiftMonth(m, 1))}
                hitSlop={12}
                style={[styles.arrow, { backgroundColor: t.surfaceAlt, opacity: isCurrent ? 0.3 : 1 }]}
                accessibilityLabel="Sonraki ay">
                <Icon name="chevronRight" color={t.text} size={16} />
              </Touch>
            </Row>
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border, marginVertical: Spacing.three }} />
            <Row>
              <Stat label="Gelir" value={formatMoney(sum.income, { decimals: false })} color={t.income} />
              <Stat label="Gider" value={formatMoney(sum.expense, { decimals: false })} color={t.expense} />
              <Stat label="Fark" value={formatMoney(sum.balance, { decimals: false, sign: true })} />
            </Row>
          </Card>
        </>
      ) : null}

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
          {groups.map(([day, list]) => {
            const net = totals(list).balance;
            return (
              <View key={day}>
                <SectionLabel>{`${dayLabel(list[0].date)} · ${formatMoney(net, { sign: true, decimals: false })}`}</SectionLabel>
                <Card style={{ paddingVertical: Spacing.one }}>
                  {list.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      onLongPress={() =>
                        confirm('İşlem silinsin mi?', `${formatMoney(tx.amount)} tutarındaki işlem silinecek.`, () => removeTransaction(tx.id))
                      }
                    />
                  ))}
                </Card>
              </View>
            );
          })}
          <T v="small" muted style={{ textAlign: 'center', marginTop: Spacing.three }}>
            Silmek için işleme basılı tut
          </T>
        </View>
      )}
    </Page>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <T v="small" muted>
        {label}
      </T>
      <T v="bodyBold" color={color} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 50,
    borderRadius: Radius.pill,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FontFamily.regular,
    height: '100%',
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
