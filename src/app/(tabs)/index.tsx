import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon, type GlyphName } from '@/components/icon';
import { Screen } from '@/components/screen';
import { TransactionRow } from '@/components/transaction-row';
import { Card, EmptyState, IconBubble, ProgressBar, Row, SectionHeader, T, Touch } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney, greeting, monthKey, monthLabel } from '@/lib/format';
import { monthTransactions, quickTemplates, spendByCategory, totals, upcomingBills } from '@/lib/selectors';
import { useBudget, type HomeSectionKey, type Transaction } from '@/store/budget';

export default function Home() {
  const t = useTheme();
  const settings = useBudget((s) => s.settings);
  const transactions = useBudget((s) => s.transactions);
  const updateSettings = useBudget((s) => s.updateSettings);

  const month = monthKey();
  const sum = useMemo(() => totals(monthTransactions(transactions, month)), [transactions, month]);
  const hidden = settings.hideBalance;
  const money = (v: number) => (hidden ? '••••• ₺' : formatMoney(v));

  const firstName = settings.userName.split(' ')[0];

  return (
    <Screen
      subtitle={settings.familyName ? `${settings.familyName} Ailesi` : monthLabel(month)}
      title={`${greeting()}${firstName ? ', ' + firstName : ''}`}
      right={
        <Touch
          onPress={() => updateSettings({ hideBalance: !hidden })}
          hitSlop={10}
          style={styles.headerBtn}
          accessibilityLabel={hidden ? 'Tutarları göster' : 'Tutarları gizle'}>
          <Icon name={hidden ? 'eyeOff' : 'eye'} color="#fff" size={20} />
        </Touch>
      }
      overlap={44}
      hero={
        <View style={{ marginTop: Spacing.four }}>
          <T v="small" color="rgba(255,255,255,0.8)">
            {monthLabel(month)} · Kalan
          </T>
          <T v="display" color="#fff" style={{ marginTop: 2 }}>
            {money(sum.balance)}
          </T>
          <Row style={{ gap: Spacing.three, marginTop: Spacing.three }}>
            <HeroStat icon="arrowDown" label="GELİR" value={money(sum.income)} />
            <HeroStat icon="arrowUp" label="GİDER" value={money(sum.expense)} />
          </Row>
        </View>
      }>
      <Card style={styles.actions}>
        <QuickAction icon="arrowUp" label="Gider Ekle" color={t.expense} onPress={() => router.push('/ekle')} />
        <QuickAction
          icon="arrowDown"
          label="Gelir Ekle"
          color={t.income}
          onPress={() => router.push({ pathname: '/ekle', params: { type: 'income' } })}
        />
        <QuickAction icon="calendar" label="Ödemeler" color={t.primary} onPress={() => router.push('/butce?tab=bills')} />
        <QuickAction icon="target" label="Hedefler" color="#8B5CF6" onPress={() => router.push('/butce?tab=goals')} />
      </Card>

      {settings.homeSections
        .filter((s) => s.visible)
        .map((s) => (
          <HomeSection key={s.key} k={s.key} />
        ))}
    </Screen>
  );
}

function HomeSection({ k }: { k: HomeSectionKey }) {
  switch (k) {
    case 'quick':
      return <QuickTemplates />;
    case 'bills':
      return <UpcomingBills />;
    case 'budgets':
      return <BudgetLimits />;
    case 'goals':
      return <Goals />;
    case 'recent':
      return <Recent />;
  }
}

function HeroStat({ icon, label, value }: { icon: GlyphName; label: string; value: string }) {
  return (
    <Row style={styles.heroStat}>
      <View style={styles.heroStatIcon}>
        <Icon name={icon} color="#fff" size={14} />
      </View>
      <View>
        <T v="caption" color="rgba(255,255,255,0.75)">
          {label}
        </T>
        <T v="bodyBold" color="#fff">
          {value}
        </T>
      </View>
    </Row>
  );
}

function QuickAction({ icon, label, color, onPress }: { icon: GlyphName; label: string; color: string; onPress: () => void }) {
  return (
    <Touch onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
      <IconBubble icon={icon} color={color} size={46} />
      <T v="small" style={{ fontWeight: '600', textAlign: 'center' }}>
        {label}
      </T>
    </Touch>
  );
}

/** Sık girilen işlemleri tek dokunuşla tekrar ekler; 4 sn içinde geri alınabilir. */
function QuickTemplates() {
  const t = useTheme();
  const transactions = useBudget((s) => s.transactions);
  const categories = useBudget((s) => s.categories);
  const addTransaction = useBudget((s) => s.addTransaction);
  const removeTransaction = useBudget((s) => s.removeTransaction);
  const templates = useMemo(() => quickTemplates(transactions), [transactions]);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (templates.length === 0) return null;

  const add = (tpl: Transaction) => {
    addTransaction({ type: tpl.type, amount: tpl.amount, categoryId: tpl.categoryId, memberId: tpl.memberId, note: tpl.note });
    const newest = useBudget.getState().transactions[0];
    setJustAdded(newest.id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(null), 4000);
  };

  return (
    <View>
      <SectionHeader
        title="Hızlı Ekle"
        action={justAdded ? 'Geri al' : undefined}
        onAction={() => {
          if (justAdded) removeTransaction(justAdded);
          setJustAdded(null);
        }}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two }}>
        {templates.map((tpl) => {
          const c = categories.find((x) => x.id === tpl.categoryId);
          return (
            <Touch
              key={tpl.id}
              onPress={() => add(tpl)}
              style={[styles.template, { backgroundColor: t.surface, borderColor: t.border }]}>
              <IconBubble icon={c?.icon ?? 'more'} color={c?.color ?? t.textMuted} size={32} />
              <View>
                <T v="small" style={{ fontWeight: '600' }} numberOfLines={1}>
                  {tpl.note || c?.name}
                </T>
                <T v="small" color={tpl.type === 'income' ? t.income : t.textMuted}>
                  {formatMoney(tpl.amount, { decimals: tpl.amount % 1 !== 0 })}
                </T>
              </View>
            </Touch>
          );
        })}
      </ScrollView>
      {justAdded ? (
        <T v="small" color={t.income} style={{ marginTop: 6, fontWeight: '600' }}>
          ✓ Eklendi
        </T>
      ) : null}
    </View>
  );
}

function UpcomingBills() {
  const t = useTheme();
  const bills = useBudget((s) => s.bills);
  const categories = useBudget((s) => s.categories);
  const toggleBillPaid = useBudget((s) => s.toggleBillPaid);
  const upcoming = useMemo(() => upcomingBills(bills).slice(0, 3), [bills]);
  const today = new Date().getDate();

  if (bills.length === 0) return null;

  return (
    <View>
      <SectionHeader title="Yaklaşan Ödemeler" action="Tümü" onAction={() => router.push('/butce?tab=bills')} />
      <Card style={{ paddingVertical: Spacing.two }}>
        {upcoming.length === 0 ? (
          <EmptyState icon="check" text="Bu ayın tüm ödemeleri yapıldı 🎉" />
        ) : (
          upcoming.map((b) => {
            const c = categories.find((x) => x.id === b.categoryId);
            const late = b.day < today;
            return (
              <Row key={b.id} style={{ gap: Spacing.three, paddingVertical: 8 }}>
                <IconBubble icon={c?.icon ?? 'bill'} color={c?.color ?? t.textMuted} />
                <View style={{ flex: 1 }}>
                  <T v="bodyBold">{b.name}</T>
                  <T v="small" color={late ? t.expense : t.textMuted}>
                    {late ? `Gecikti · ayın ${b.day}'i` : b.day === today ? 'Bugün' : `Ayın ${b.day}'i · ${b.day - today} gün kaldı`}
                  </T>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <T v="bodyBold">{formatMoney(b.amount, { decimals: false })}</T>
                  <Touch onPress={() => toggleBillPaid(b.id)} style={[styles.payBtn, { backgroundColor: t.primarySoft }]}>
                    <T v="caption" color={t.primary}>
                      ÖDE
                    </T>
                  </Touch>
                </View>
              </Row>
            );
          })
        )}
      </Card>
    </View>
  );
}

function BudgetLimits() {
  const t = useTheme();
  const transactions = useBudget((s) => s.transactions);
  const categories = useBudget((s) => s.categories);
  const rows = useMemo(
    () => spendByCategory(monthTransactions(transactions, monthKey()), categories).filter((r) => r.category.limit),
    [transactions, categories],
  );

  return (
    <View>
      <SectionHeader title="Bütçe Limitleri" action="Düzenle" onAction={() => router.push('/butce')} />
      <Card style={{ gap: Spacing.three }}>
        {rows.length === 0 ? (
          <EmptyState icon="chart" text="Henüz limit yok. Bütçe sekmesinden kategorilere aylık limit koyabilirsin." />
        ) : (
          rows.slice(0, 4).map(({ category: c, spent }) => {
            const ratio = spent / (c.limit ?? 1);
            return (
              <View key={c.id} style={{ gap: 6 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Row style={{ gap: 8 }}>
                    <Icon name={c.icon} color={c.color} size={16} />
                    <T v="bodyBold">{c.name}</T>
                  </Row>
                  <T v="small" color={ratio >= 1 ? t.expense : t.textMuted}>
                    {formatMoney(spent, { decimals: false })} / {formatMoney(c.limit ?? 0, { decimals: false })}
                  </T>
                </Row>
                <ProgressBar value={ratio} />
              </View>
            );
          })
        )}
      </Card>
    </View>
  );
}

function Goals() {
  const t = useTheme();
  const goals = useBudget((s) => s.goals);
  if (goals.length === 0) return null;
  return (
    <View>
      <SectionHeader title="Birikim Hedefleri" action="Tümü" onAction={() => router.push('/butce?tab=goals')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two }}>
        {goals.map((g) => (
          <Card key={g.id} style={{ width: 200, gap: 8 }}>
            <T v="title">{g.emoji}</T>
            <T v="bodyBold" numberOfLines={1}>
              {g.name}
            </T>
            <ProgressBar value={g.saved / g.target} color={t.primary} />
            <T v="small" muted>
              {formatMoney(g.saved, { decimals: false })} / {formatMoney(g.target, { decimals: false })}
            </T>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

function Recent() {
  const transactions = useBudget((s) => s.transactions);
  return (
    <View>
      <SectionHeader title="Son İşlemler" action="Tümü" onAction={() => router.push('/islemler')} />
      <Card style={{ paddingVertical: Spacing.one }}>
        {transactions.length === 0 ? (
          <EmptyState icon="list" text="Henüz işlem yok. Ortadaki + ile ilk harcamanı ekle." />
        ) : (
          transactions.slice(0, 5).map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStat: {
    flex: 1,
    gap: 8,
    padding: 10,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroStatIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  template: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 220,
  },
  payBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
});
