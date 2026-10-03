import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { HeroData } from '@/components/home/hero';
import { Icon } from '@/components/icon';
import { TransactionRow } from '@/components/transaction-row';
import { Card, EmptyState, IconBubble, ListCard, ProgressBar, PromoBanner, RoundAction, Row, SectionLabel, T, Touch } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney, monthKey, monthLabel } from '@/lib/format';
import { remindersSupported } from '@/lib/reminders';
import { monthTransactions, quickTemplates, spendByCategory, totals, upcomingBills } from '@/lib/selectors';
import { useBudget, type HomeSectionKey, type Transaction } from '@/store/budget';

export type Bolum = 'genel' | 'butce' | 'odemeler' | 'hedefler';

export function useGenelHero({ go }: { go: (b: Bolum) => void }): HeroData {
  const transactions = useBudget((s) => s.transactions);
  const month = monthKey();
  const sum = useMemo(() => totals(monthTransactions(transactions, month)), [transactions, month]);

  return {
    label: 'Bu ay kalan',
    value: sum.balance,
    pill: { icon: 'calendar', text: monthLabel(month) },
    onPill: () => router.push('/islemler'),
    actions: [
      { icon: 'arrowUp', label: 'Gider ekle', onPress: () => router.push('/ekle') },
      { icon: 'arrowDown', label: 'Gelir ekle', onPress: () => router.push({ pathname: '/ekle', params: { type: 'income' } }) },
      { icon: 'bill', label: 'Faturalar', onPress: () => go('odemeler') },
    ],
  };
}

export function GenelBody({ go }: { go: (b: Bolum) => void }) {
  const sections = useBudget((s) => s.settings.homeSections);
  return (
    <View>
      <Suggestions go={go} />
      <MemberCards />
      {sections
        .filter((s) => s.visible)
        .map((s, i) => (
          <View key={s.key}>
            <HomeSection k={s.key} go={go} />
          </View>
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

/** Aile üyelerinin bu ayki harcaması: küçük beyaz kartlar + sonda siyah "Üye ekle" kartı. */
function MemberCards() {
  const t = useTheme();
  const members = useBudget((s) => s.members);
  const transactions = useBudget((s) => s.transactions);
  const userName = useBudget((s) => s.settings.userName);
  const hidden = useBudget((s) => s.settings.hideBalance);
  const month = monthKey();

  const byMember = useMemo(() => {
    const inMonth = monthTransactions(transactions, month);
    return members.map((m) => ({ m, ...totals(inMonth.filter((x) => x.memberId === m.id)) }));
  }, [members, transactions, month]);

  return (
    <View>
      <SectionLabel hint="Kişiye dokun, harcamalarını gör">Ailen bu ay</SectionLabel>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -Spacing.three }}
        contentContainerStyle={{ gap: 10, paddingHorizontal: Spacing.three, paddingBottom: 6 }}>
        {byMember.map(({ m, expense }) => (
          <Touch
            key={m.id}
            pressScale={0.96}
            onPress={() => router.push({ pathname: '/islemler', params: { uye: m.id } })}
            style={[styles.memberCard, { backgroundColor: t.surface, shadowOpacity: t.scheme === 'dark' ? 0 : 0.05 }]}>
            <View style={[styles.memberAvatar, { backgroundColor: t.surfaceAlt }]}>
              <T style={{ fontSize: 17 }}>{m.emoji}</T>
            </View>
            <View>
              <T v="small" muted numberOfLines={1}>
                {m.id === 'me' && userName ? userName.split(' ')[0] : m.name}
              </T>
              <T v="bodyBold" numberOfLines={1}>
                {hidden ? '•••' : formatMoney(expense, { decimals: false })}
              </T>
            </View>
          </Touch>
        ))}
        <Touch
          pressScale={0.96}
          onPress={() => router.push('/profil')}
          accessibilityLabel="Üye ekle"
          style={[styles.memberCard, styles.addCard, { borderColor: t.border }]}>
          <Icon name="plus" size={20} color={t.text} />
        </Touch>
      </ScrollView>
    </View>
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
    <View style={{ gap: 10, marginTop: Spacing.four }}>
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

/** Sık girilen harcamalar: tek dokunuşla tekrar eklenen yuvarlak butonlar. */
function QuickTemplates() {
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
        hint="Dokun, aynısı bugüne eklensin"
        action={justAdded ? 'Geri al' : undefined}
        onAction={() => {
          if (justAdded) removeTransaction(justAdded);
          setJustAdded(null);
        }}>
        {justAdded ? '✓ Eklendi' : 'Hızlı ekle'}
      </SectionLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.three }} contentContainerStyle={{ paddingHorizontal: Spacing.two }}>
        {templates.map((tpl) => {
          const c = categories.find((x) => x.id === tpl.categoryId);
          return (
            <View key={tpl.id} style={{ width: 92 }}>
              <RoundAction
                icon={c?.icon ?? 'more'}
                tint={c?.color}
                label={`${tpl.note || c?.name}\n${formatMoney(tpl.amount, { decimals: tpl.amount % 1 !== 0 })}`}
                onPress={() => add(tpl)}
              />
            </View>
          );
        })}
      </ScrollView>
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
    <ListCard title="Yaklaşan ödemeler" meta={`${upcoming.length} ödeme`} onPress={() => go('odemeler')} style={{ marginTop: Spacing.four }}>
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
    <ListCard title="Bütçe limitleri" meta={`${rows.length} limit`} onPress={() => go('butce')} style={{ marginTop: Spacing.four }}>
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
    <ListCard title="Birikim hedefleri" meta={`${goals.length} hedef`} onPress={() => go('hedefler')} style={{ marginTop: Spacing.four }}>
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
    <View>
      <SectionLabel action="Tümü" onAction={() => router.push('/islemler')}>
        Son işlemler
      </SectionLabel>
      {transactions.length === 0 ? (
        <Card>
          <EmptyState icon="list" text="Henüz işlem yok. Alttaki + ile ilk harcamanı ekle." />
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {transactions.slice(0, 5).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} card />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 60,
    paddingLeft: 10,
    paddingRight: 16,
    borderRadius: Radius.pill,
    shadowColor: '#1B2A1F',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    width: 60,
    paddingLeft: 0,
    paddingRight: 0,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    shadowOpacity: 0,
    elevation: 0,
  },
});
