import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { HeroSummary } from '@/components/home/hero';
import { TransactionRow } from '@/components/transaction-row';
import { Amount, DotsButton, EmptyState, IconBubble, ListCard, ProgressBar, PromoBanner, RoundAction, Row, SectionLabel, T } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney, monthKey, monthLabel } from '@/lib/format';
import { remindersSupported } from '@/lib/reminders';
import { monthTransactions, quickTemplates, spendByCategory, totals, upcomingBills } from '@/lib/selectors';
import { useBudget, type HomeSectionKey, type Transaction } from '@/store/budget';

export type Bolum = 'genel' | 'butce' | 'odemeler' | 'hedefler';

export function GenelHero({ go }: { go: (b: Bolum) => void }) {
  const transactions = useBudget((s) => s.transactions);
  const month = monthKey();
  const sum = useMemo(() => totals(monthTransactions(transactions, month)), [transactions, month]);

  return (
    <HeroSummary
      label="Bu ay kalan"
      value={sum.balance}
      pill={{ icon: 'calendar', text: monthLabel(month) }}
      onPill={() => router.push('/islemler')}
      actions={[
        { icon: 'arrowUp', label: 'Gider\nekle', onPress: () => router.push('/ekle') },
        { icon: 'arrowDown', label: 'Gelir\nekle', onPress: () => router.push({ pathname: '/ekle', params: { type: 'income' } }) },
        { icon: 'bill', label: 'Fatura\nöde', onPress: () => go('odemeler') },
        { icon: 'dots', label: 'Diğer\nişlemler', onPress: () => router.push('/islemler') },
      ]}
    />
  );
}

export function GenelBody({ go }: { go: (b: Bolum) => void }) {
  const sections = useBudget((s) => s.settings.homeSections);
  return (
    <View>
      <MemberCards />
      <Suggestions go={go} />
      {sections
        .filter((s) => s.visible)
        .map((s, i) => (
          <Animated.View key={s.key} entering={FadeInDown.delay(120 + i * 70).springify().damping(18)}>
            <HomeSection k={s.key} go={go} />
          </Animated.View>
        ))}
    </View>
  );
}

function HomeSection({ k, go }: { k: HomeSectionKey; go: (b: Bolum) => void }) {
  switch (k) {
    case 'quick':
      return <QuickTemplates />;
    case 'bills':
      return <UpcomingBills go={go} />;
    case 'budgets':
      return <BudgetLimits go={go} />;
    case 'goals':
      return <Goals go={go} />;
    case 'recent':
      return <Recent />;
  }
}

/** Akbank'taki kaydırmalı hesap kartları yerine: aile üyelerinin bu ayki durumu. */
function MemberCards() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const members = useBudget((s) => s.members);
  const transactions = useBudget((s) => s.transactions);
  const userName = useBudget((s) => s.settings.userName);
  const hidden = useBudget((s) => s.settings.hideBalance);
  const month = monthKey();
  const cardWidth = Math.min(width, MaxContentWidth) * 0.72;

  const byMember = useMemo(() => {
    const inMonth = monthTransactions(transactions, month);
    return members.map((m) => ({ m, ...totals(inMonth.filter((x) => x.memberId === m.id)) }));
  }, [members, transactions, month]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + 12}
      decelerationRate="fast"
      style={{ marginHorizontal: -Spacing.three, marginTop: Spacing.four }}
      contentContainerStyle={{ gap: 12, paddingHorizontal: Spacing.three }}>
      {byMember.map(({ m, expense, income }, i) => (
        <Animated.View
          key={m.id}
          entering={FadeInRight.delay(i * 80).springify().damping(18)}
          style={[styles.memberCard, { width: cardWidth, backgroundColor: t.surface, shadowOpacity: t.scheme === 'dark' ? 0 : 0.06 }]}>
          <Row style={{ gap: 12 }}>
            <View style={[styles.memberAvatar, { borderColor: t.primary, backgroundColor: t.primarySoft }]}>
              <T style={{ fontSize: 22 }}>{m.emoji}</T>
            </View>
            <View style={{ flex: 1 }}>
              <T v="heading" numberOfLines={1}>
                {m.id === 'me' && userName ? userName : m.name}
              </T>
              <T v="small" muted>
                {monthLabel(month)}
              </T>
            </View>
            <DotsButton onPress={() => router.push({ pathname: '/islemler', params: { uye: m.id } })} />
          </Row>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border, marginVertical: Spacing.three }} />
          <T v="body">Bu ay harcama</T>
          <Amount value={expense} size={30} hidden={hidden} />
          <T v="small" muted style={{ marginTop: 4 }}>
            Gelir: {hidden ? '•••••' : formatMoney(income)}
          </T>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

/** Duruma göre çıkan, kapatılabilir nane yeşili öneriler. */
function Suggestions({ go }: { go: (b: Bolum) => void }) {
  const transactions = useBudget((s) => s.transactions);
  const categories = useBudget((s) => s.categories);
  const bills = useBudget((s) => s.bills);
  const reminders = useBudget((s) => s.settings.billReminders);
  const [closed, setClosed] = useState<string[]>([]);

  const items = useMemo(() => {
    const list: { id: string; icon: 'chart' | 'bellOutline' | 'sparkles'; text: string; action: string; onPress: () => void }[] = [];
    const over = spendByCategory(monthTransactions(transactions, monthKey()), categories)
      .filter((r) => r.category.limit && r.spent / r.category.limit >= 0.8)
      .sort((a, b) => b.spent / (b.category.limit ?? 1) - a.spent / (a.category.limit ?? 1))[0];
    if (over) {
      const pct = Math.round((over.spent / (over.category.limit ?? 1)) * 100);
      list.push({ id: 'limit', icon: 'chart', text: `${over.category.name} limitinin %${pct}'ini kullandın.`, action: 'Limitleri gör', onPress: () => go('butce') });
    }
    if (remindersSupported && !reminders && bills.length > 0) {
      list.push({ id: 'remind', icon: 'bellOutline', text: 'Son ödeme günlerini kaçırmamak için', action: 'hatırlatmaları aç', onPress: () => go('odemeler') });
    }
    if (transactions.length === 0) {
      list.push({ id: 'first', icon: 'sparkles', text: 'İlk harcamanı 3 dokunuşta ekle.', action: 'Hemen başla', onPress: () => router.push('/ekle') });
    }
    return list;
  }, [transactions, categories, bills, reminders, go]);

  const visible = items.filter((i) => !closed.includes(i.id));
  if (visible.length === 0) return null;

  return (
    <View style={{ gap: 10, marginTop: Spacing.three }}>
      {visible.map((i) => (
        <PromoBanner
          key={i.id}
          icon={i.icon}
          text={i.text}
          action={i.action}
          onPress={i.onPress}
          onClose={() => setClosed((c) => [...c, i.id])}
        />
      ))}
    </View>
  );
}

/** Sık girilen harcamalar, Akbank'taki "Önerilen hızlı işlemler" gibi yuvarlak butonlar. */
function QuickTemplates() {
  const t = useTheme();
  const transactions = useBudget((s) => s.transactions);
  const categories = useBudget((s) => s.categories);
  const addTransaction = useBudget((s) => s.addTransaction);
  const removeTransaction = useBudget((s) => s.removeTransaction);
  const templates = useMemo(() => quickTemplates(transactions, 8), [transactions]);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (templates.length === 0) return null;

  const add = (tpl: Transaction) => {
    addTransaction({ type: tpl.type, amount: tpl.amount, categoryId: tpl.categoryId, memberId: tpl.memberId, note: tpl.note });
    setJustAdded(useBudget.getState().transactions[0].id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(null), 4000);
  };

  return (
    <View>
      <SectionLabel
        action={justAdded ? 'Geri al' : undefined}
        onAction={() => {
          if (justAdded) removeTransaction(justAdded);
          setJustAdded(null);
        }}>
        {justAdded ? '✓ Eklendi' : 'Önerilen hızlı işlemler'}
      </SectionLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.three }} contentContainerStyle={{ paddingHorizontal: Spacing.two }}>
        {templates.map((tpl) => {
          const c = categories.find((x) => x.id === tpl.categoryId);
          return (
            <View key={tpl.id} style={{ width: 92 }}>
              <RoundAction
                icon={c?.icon ?? 'more'}
                label={`${tpl.note || c?.name}\n${formatMoney(tpl.amount, { decimals: tpl.amount % 1 !== 0 })}`}
                onPress={() => add(tpl)}
              />
            </View>
          );
        })}
      </ScrollView>
      <T v="caption" muted style={{ textAlign: 'center', marginTop: 8, color: t.textMuted }}>
        Dokun, aynısını bugüne ekle
      </T>
    </View>
  );
}

function UpcomingBills({ go }: { go: (b: Bolum) => void }) {
  const t = useTheme();
  const bills = useBudget((s) => s.bills);
  const categories = useBudget((s) => s.categories);
  const upcoming = useMemo(() => upcomingBills(bills), [bills]);
  const today = new Date().getDate();

  if (bills.length === 0) return null;

  return (
    <ListCard title="Yaklaşan Ödemeler" meta={`${upcoming.length} ödeme`} onPress={() => go('odemeler')} style={{ marginTop: Spacing.four }}>
      {upcoming.length === 0 ? (
        <EmptyState icon="check" text="Bu ayın tüm ödemeleri yapıldı 🎉" />
      ) : (
        upcoming.slice(0, 3).map((b) => {
          const c = categories.find((x) => x.id === b.categoryId);
          const late = b.day < today;
          return (
            <Row key={b.id} style={{ gap: 14, paddingVertical: 10 }}>
              <IconBubble icon={c?.icon ?? 'bill'} color={c?.color ?? t.textMuted} />
              <View style={{ flex: 1 }}>
                <T v="bodyBold">{b.name}</T>
                <T v="small" color={late ? t.expense : t.textMuted}>
                  {late ? `Gecikti · ayın ${b.day}'i` : b.day === today ? 'Son gün bugün' : `${b.day - today} gün kaldı`}
                </T>
              </View>
              <T v="bodyBold">{formatMoney(b.amount)}</T>
            </Row>
          );
        })
      )}
    </ListCard>
  );
}

function BudgetLimits({ go }: { go: (b: Bolum) => void }) {
  const t = useTheme();
  const transactions = useBudget((s) => s.transactions);
  const categories = useBudget((s) => s.categories);
  const rows = useMemo(
    () => spendByCategory(monthTransactions(transactions, monthKey()), categories).filter((r) => r.category.limit),
    [transactions, categories],
  );

  return (
    <ListCard title="Bütçe Limitleri" meta={`${rows.length} limit`} onPress={() => go('butce')} style={{ marginTop: Spacing.four }}>
      {rows.length === 0 ? (
        <EmptyState icon="chart" text="Henüz limit yok. Bütçe bölümünden kategorilere aylık limit koyabilirsin." />
      ) : (
        <View style={{ gap: 16, paddingVertical: 8 }}>
          {rows.slice(0, 4).map(({ category: c, spent }) => {
            const ratio = spent / (c.limit ?? 1);
            return (
              <View key={c.id} style={{ gap: 8 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <T v="bodyBold">{c.name}</T>
                  <T v="small" color={ratio >= 1 ? t.expense : t.textMuted}>
                    {formatMoney(spent, { decimals: false })} / {formatMoney(c.limit ?? 0, { decimals: false })}
                  </T>
                </Row>
                <ProgressBar value={ratio} />
              </View>
            );
          })}
        </View>
      )}
    </ListCard>
  );
}

function Goals({ go }: { go: (b: Bolum) => void }) {
  const goals = useBudget((s) => s.goals);
  if (goals.length === 0) return null;
  return (
    <ListCard title="Birikim Hedefleri" meta={`${goals.length} hedef`} onPress={() => go('hedefler')} style={{ marginTop: Spacing.four }}>
      <View style={{ gap: 16, paddingVertical: 8 }}>
        {goals.slice(0, 3).map((g) => (
          <Row key={g.id} style={{ gap: 14 }}>
            <T style={{ fontSize: 28 }}>{g.emoji}</T>
            <View style={{ flex: 1, gap: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <T v="bodyBold">{g.name}</T>
                <T v="small" muted>
                  %{Math.min(100, Math.round((g.saved / g.target) * 100))}
                </T>
              </Row>
              <ProgressBar value={g.saved / g.target} />
            </View>
          </Row>
        ))}
      </View>
    </ListCard>
  );
}

function Recent() {
  const transactions = useBudget((s) => s.transactions);
  return (
    <ListCard title="Son İşlemler" meta={`${transactions.length} işlem`} onPress={() => router.push('/islemler')} style={{ marginTop: Spacing.four }}>
      {transactions.length === 0 ? (
        <EmptyState icon="list" text="Henüz işlem yok. Alttaki Ekle ile ilk harcamanı ekle." />
      ) : (
        transactions.slice(0, 5).map((tx) => <TransactionRow key={tx.id} tx={tx} />)
      )}
    </ListCard>
  );
}

const styles = StyleSheet.create({
  memberCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  memberAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
