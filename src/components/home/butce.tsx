import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { MoneyInput, parseMoney, PillButton } from '@/components/form';
import type { Bolum } from '@/components/home/genel';
import { HeroSummary } from '@/components/home/hero';
import { IconBubble, ListCard, ProgressBar, Row, SectionLabel, T, Touch } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney, monthKey, monthLabel } from '@/lib/format';
import { monthTransactions, spendByCategory } from '@/lib/selectors';
import { useBudget } from '@/store/budget';

function useLimitRows() {
  const transactions = useBudget((s) => s.transactions);
  const categories = useBudget((s) => s.categories);
  return useMemo(() => spendByCategory(monthTransactions(transactions, monthKey()), categories), [transactions, categories]);
}

export function ButceHero({ setEditing }: { go: (b: Bolum) => void; setEditing: (id: string | null) => void }) {
  const rows = useLimitRows();
  const limited = rows.filter((r) => r.category.limit);
  const totalLimit = limited.reduce((a, r) => a + (r.category.limit ?? 0), 0);
  const spent = limited.reduce((a, r) => a + r.spent, 0);
  const firstWithout = rows.find((r) => !r.category.limit);

  return (
    <HeroSummary
      label="Kalan limit"
      value={totalLimit - spent}
      pill={{ icon: 'chart', text: `${monthLabel(monthKey())} · ${limited.length} limit` }}
      actions={[
        { icon: 'plusCircle', label: 'Limit\nkoy', onPress: () => setEditing(firstWithout?.category.id ?? rows[0]?.category.id ?? null) },
        { icon: 'arrowUp', label: 'Gider\nekle', onPress: () => router.push('/ekle') },
        { icon: 'list', label: 'Harca-\nmalar', onPress: () => router.push({ pathname: '/islemler', params: { tur: 'expense' } }) },
        { icon: 'dots', label: 'Diğer\nişlemler', onPress: () => router.push('/islemler') },
      ]}
    />
  );
}

export function ButceBody({ editing, setEditing }: { editing: string | null; setEditing: (id: string | null) => void }) {
  const t = useTheme();
  const rows = useLimitRows();
  const setCategoryLimit = useBudget((s) => s.setCategoryLimit);
  const [value, setValue] = useState('');

  const open = (id: string, current?: number) => {
    setEditing(editing === id ? null : id);
    setValue(current ? String(current) : '');
  };

  return (
    <View>
      <SectionLabel>Kategori limitleri</SectionLabel>
      <ListCard title="Gider kategorileri" meta={`${rows.length} kategori`}>
        {rows.map(({ category: c, spent }, i) => {
          const isEditing = editing === c.id;
          return (
            <Animated.View
              key={c.id}
              layout={LinearTransition}
              style={[styles.row, i < rows.length - 1 && { borderBottomColor: t.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
              <Touch pressScale={0.98} onPress={() => open(c.id, c.limit)}>
                <Row style={{ gap: 14 }}>
                  <IconBubble icon={c.icon} color={c.color} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <T v="bodyBold">{c.name}</T>
                      <T v="small" muted>
                        {formatMoney(spent, { decimals: false })}
                        {c.limit ? ` / ${formatMoney(c.limit, { decimals: false })}` : ''}
                      </T>
                    </Row>
                    {c.limit ? (
                      <ProgressBar value={spent / c.limit} />
                    ) : (
                      <T v="small" color={t.primary} style={{ fontWeight: '500' }}>
                        + Limit koy
                      </T>
                    )}
                  </View>
                </Row>
              </Touch>
              {isEditing ? (
                <Animated.View entering={FadeInDown.duration(200)}>
                  <Row style={{ gap: Spacing.two, marginTop: 12 }}>
                    <MoneyInput value={value} onChange={setValue} placeholder="Aylık limit (TL)" autoFocus />
                    <PillButton
                      label="Kaydet"
                      onPress={() => {
                        const n = parseMoney(value);
                        setCategoryLimit(c.id, n > 0 ? n : undefined);
                        setEditing(null);
                      }}
                    />
                  </Row>
                  {c.limit ? (
                    <Touch
                      onPress={() => {
                        setCategoryLimit(c.id, undefined);
                        setEditing(null);
                      }}
                      style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                      <T v="small" color={t.expense}>
                        Limiti kaldır
                      </T>
                    </Touch>
                  ) : null}
                </Animated.View>
              ) : null}
            </Animated.View>
          );
        })}
      </ListCard>
      <T v="small" muted style={{ textAlign: 'center', marginTop: 12 }}>
        {`Limitin %80'ini geçince sarı, aşınca kırmızı olur.`}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
  },
});
