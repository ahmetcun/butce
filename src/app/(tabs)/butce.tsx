import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Card, Chip, EmptyState, IconBubble, ProgressBar, Row, SectionHeader, T, Touch } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/lib/confirm';
import { formatMoney, monthKey, monthLabel } from '@/lib/format';
import { monthTransactions, spendByCategory } from '@/lib/selectors';
import { useBudget } from '@/store/budget';

type Tab = 'limits' | 'bills' | 'goals';

export default function Budget() {
  const t = useTheme();
  const [tab, setTab] = useState<Tab>('limits');

  return (
    <Screen
      title="Bütçe"
      subtitle={monthLabel(monthKey())}
      hero={
        <Row style={[styles.segment, { marginTop: Spacing.three }]}>
          {(
            [
              ['limits', 'Limitler'],
              ['bills', 'Ödemeler'],
              ['goals', 'Hedefler'],
            ] as const
          ).map(([k, label]) => (
            <Touch key={k} onPress={() => setTab(k)} style={[styles.segmentItem, tab === k && { backgroundColor: '#fff' }]}>
              <T v="bodyBold" color={tab === k ? t.primary : '#fff'}>
                {label}
              </T>
            </Touch>
          ))}
        </Row>
      }>
      <View style={{ height: Spacing.three }} />
      {tab === 'limits' ? <Limits /> : tab === 'bills' ? <Bills /> : <Goals />}
    </Screen>
  );
}

/* ------------------------------ Limitler ------------------------------ */

function Limits() {
  const t = useTheme();
  const transactions = useBudget((s) => s.transactions);
  const categories = useBudget((s) => s.categories);
  const setCategoryLimit = useBudget((s) => s.setCategoryLimit);
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState('');

  const rows = useMemo(
    () => spendByCategory(monthTransactions(transactions, monthKey()), categories),
    [transactions, categories],
  );
  const totalLimit = rows.reduce((a, r) => a + (r.category.limit ?? 0), 0);
  const totalSpent = rows.reduce((a, r) => a + (r.category.limit ? r.spent : 0), 0);

  return (
    <View>
      {totalLimit > 0 ? (
        <Card style={{ gap: 8 }}>
          <T v="small" muted>
            Limitli kategorilerde toplam
          </T>
          <T v="title">
            {formatMoney(totalSpent, { decimals: false })}{' '}
            <T v="body" muted>
              / {formatMoney(totalLimit, { decimals: false })}
            </T>
          </T>
          <ProgressBar value={totalSpent / totalLimit} height={10} />
        </Card>
      ) : null}

      <SectionHeader title="Kategoriler" />
      <T v="small" muted style={{ marginTop: -4, marginBottom: Spacing.two }}>
        {`Limit koymak için kategoriye dokun. %80'i geçince sarı, aşınca kırmızı olur.`}
      </T>
      <Card style={{ paddingVertical: Spacing.one }}>
        {rows.map(({ category: c, spent }) => {
          const isEditing = editing === c.id;
          return (
            <View key={c.id} style={[styles.limitRow, { borderBottomColor: t.border }]}>
              <Touch
                onPress={() => {
                  setEditing(isEditing ? null : c.id);
                  setValue(c.limit ? String(c.limit) : '');
                }}>
                <Row style={{ gap: Spacing.three }}>
                  <IconBubble icon={c.icon} color={c.color} size={36} />
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
                      <T v="caption" color={t.primary}>
                        + LİMİT KOY
                      </T>
                    )}
                  </View>
                </Row>
              </Touch>
              {isEditing ? (
                <Row style={{ gap: Spacing.two, marginTop: Spacing.two }}>
                  <MoneyInput value={value} onChange={setValue} placeholder="Aylık limit" autoFocus />
                  <SmallBtn
                    label="Kaydet"
                    onPress={() => {
                      const n = Number(value.replace(',', '.'));
                      setCategoryLimit(c.id, n > 0 ? n : undefined);
                      setEditing(null);
                    }}
                  />
                  {c.limit ? (
                    <SmallBtn
                      label="Kaldır"
                      subtle
                      onPress={() => {
                        setCategoryLimit(c.id, undefined);
                        setEditing(null);
                      }}
                    />
                  ) : null}
                </Row>
              ) : null}
            </View>
          );
        })}
      </Card>
    </View>
  );
}

/* ------------------------------ Ödemeler ------------------------------ */

function Bills() {
  const t = useTheme();
  const bills = useBudget((s) => s.bills);
  const categories = useBudget((s) => s.categories);
  const toggleBillPaid = useBudget((s) => s.toggleBillPaid);
  const removeBill = useBudget((s) => s.removeBill);
  const addBill = useBudget((s) => s.addBill);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [categoryId, setCategoryId] = useState('fatura');

  const month = monthKey();
  const sorted = [...bills].sort((a, b) => a.day - b.day);
  const total = bills.reduce((a, b) => a + b.amount, 0);
  const paid = bills.filter((b) => b.paidMonths.includes(month)).reduce((a, b) => a + b.amount, 0);

  const submit = () => {
    const n = Number(amount.replace(',', '.'));
    const d = Math.min(31, Math.max(1, Number(day) || 1));
    if (!name.trim() || !n) return;
    addBill({ name: name.trim(), amount: n, day: d, categoryId });
    setName('');
    setAmount('');
    setDay('');
    setAdding(false);
  };

  return (
    <View>
      {bills.length > 0 ? (
        <Card style={{ gap: 8 }}>
          <T v="small" muted>
            Bu ay ödenen
          </T>
          <T v="title">
            {formatMoney(paid, { decimals: false })}{' '}
            <T v="body" muted>
              / {formatMoney(total, { decimals: false })}
            </T>
          </T>
          <ProgressBar value={total ? paid / total : 0} color={t.income} height={10} />
        </Card>
      ) : null}

      <SectionHeader title="Düzenli Ödemeler" action={adding ? 'Vazgeç' : '+ Ekle'} onAction={() => setAdding((a) => !a)} />

      {adding ? (
        <Card style={{ gap: Spacing.two, marginBottom: Spacing.three }}>
          <TextField value={name} onChange={setName} placeholder="Ödeme adı (Örn: İnternet)" autoFocus />
          <Row style={{ gap: Spacing.two }}>
            <MoneyInput value={amount} onChange={setAmount} placeholder="Tutar" />
            <TextField value={day} onChange={setDay} placeholder="Ayın günü" keyboardType="number-pad" style={{ width: 110 }} />
          </Row>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {categories
              .filter((c) => c.type === 'expense')
              .map((c) => (
                <Chip key={c.id} label={c.name} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
              ))}
          </ScrollView>
          <SmallBtn label="Ödemeyi kaydet" onPress={submit} />
        </Card>
      ) : null}

      <Card style={{ paddingVertical: Spacing.one }}>
        {sorted.length === 0 ? (
          <EmptyState icon="calendar" text="Kira, fatura, kredi kartı gibi her ay tekrar eden ödemelerini ekle; günü gelince hatırlatalım." />
        ) : (
          sorted.map((b) => {
            const c = categories.find((x) => x.id === b.categoryId);
            const isPaid = b.paidMonths.includes(month);
            return (
              <Touch
                key={b.id}
                haptic
                onPress={() => toggleBillPaid(b.id)}
                onLongPress={() => confirm('Ödeme silinsin mi?', `"${b.name}" listeden kaldırılacak.`, () => removeBill(b.id))}>
                <Row style={{ gap: Spacing.three, paddingVertical: 10 }}>
                  <IconBubble icon={c?.icon ?? 'bill'} color={c?.color ?? t.textMuted} size={36} />
                  <View style={{ flex: 1 }}>
                    <T v="bodyBold" style={isPaid && { textDecorationLine: 'line-through', opacity: 0.6 }}>
                      {b.name}
                    </T>
                    <T v="small" muted>
                      {`Ayın ${b.day}'i · ${formatMoney(b.amount, { decimals: false })}`}
                    </T>
                  </View>
                  <View
                    style={[
                      styles.check,
                      { borderColor: isPaid ? t.income : t.border, backgroundColor: isPaid ? t.income : 'transparent' },
                    ]}>
                    {isPaid ? <Icon name="check" color="#fff" size={16} /> : null}
                  </View>
                </Row>
              </Touch>
            );
          })
        )}
      </Card>
      {sorted.length > 0 ? (
        <T v="small" muted style={{ textAlign: 'center', marginTop: Spacing.two }}>
          Dokun: ödendi olarak işaretle (gider olarak da eklenir) · Basılı tut: sil
        </T>
      ) : null}
    </View>
  );
}

/* ------------------------------ Hedefler ------------------------------ */

const GOAL_EMOJIS = ['🏖️', '🏠', '🚗', '🎓', '🛟', '💍', '📱', '👶'];

function Goals() {
  const t = useTheme();
  const goals = useBudget((s) => s.goals);
  const addGoal = useBudget((s) => s.addGoal);
  const contributeGoal = useBudget((s) => s.contributeGoal);
  const removeGoal = useBudget((s) => s.removeGoal);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState(GOAL_EMOJIS[0]);
  const [customFor, setCustomFor] = useState<string | null>(null);
  const [custom, setCustom] = useState('');

  const submit = () => {
    const n = Number(target.replace(',', '.'));
    if (!name.trim() || !n) return;
    addGoal({ name: name.trim(), target: n, emoji });
    setName('');
    setTarget('');
    setAdding(false);
  };

  return (
    <View>
      <SectionHeader title="Birikim Hedefleri" action={adding ? 'Vazgeç' : '+ Yeni hedef'} onAction={() => setAdding((a) => !a)} />

      {adding ? (
        <Card style={{ gap: Spacing.two, marginBottom: Spacing.three }}>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {GOAL_EMOJIS.map((e) => (
              <Touch
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emoji, { backgroundColor: emoji === e ? t.primarySoft : t.surfaceAlt, borderColor: emoji === e ? t.primary : 'transparent' }]}>
                <T v="title">{e}</T>
              </Touch>
            ))}
          </Row>
          <TextField value={name} onChange={setName} placeholder="Hedef adı (Örn: Yaz tatili)" autoFocus />
          <MoneyInput value={target} onChange={setTarget} placeholder="Hedef tutar" />
          <SmallBtn label="Hedefi oluştur" onPress={submit} />
        </Card>
      ) : null}

      {goals.length === 0 && !adding ? (
        <Card>
          <EmptyState icon="target" text="Tatil, araba, acil durum fonu... Ailece biriktirdiğiniz hedefleri burada takip edin." />
        </Card>
      ) : null}

      <View style={{ gap: Spacing.three }}>
        {goals.map((g) => {
          const ratio = g.saved / g.target;
          const done = ratio >= 1;
          return (
            <Card key={g.id} style={{ gap: Spacing.two }}>
              <Touch haptic={false} onLongPress={() => confirm('Hedef silinsin mi?', `"${g.name}" silinecek.`, () => removeGoal(g.id))}>
                <Row style={{ gap: Spacing.three }}>
                  <T style={{ fontSize: 34 }}>{g.emoji}</T>
                  <View style={{ flex: 1 }}>
                    <T v="heading">{g.name}</T>
                    <T v="small" muted>
                      {done ? 'Hedefe ulaşıldı 🎉' : `${formatMoney(g.target - g.saved, { decimals: false })} kaldı`}
                    </T>
                  </View>
                  <T v="heading" color={t.primary}>
                    %{Math.min(100, Math.round(ratio * 100))}
                  </T>
                </Row>
              </Touch>
              <ProgressBar value={ratio} color={done ? t.income : t.primary} height={10} />
              <T v="small" muted>
                {formatMoney(g.saved, { decimals: false })} / {formatMoney(g.target, { decimals: false })}
              </T>
              {customFor === g.id ? (
                <Row style={{ gap: Spacing.two }}>
                  <MoneyInput value={custom} onChange={setCustom} placeholder="Tutar" autoFocus />
                  <SmallBtn
                    label="Ekle"
                    onPress={() => {
                      const n = Number(custom.replace(',', '.'));
                      if (n) contributeGoal(g.id, n);
                      setCustom('');
                      setCustomFor(null);
                    }}
                  />
                </Row>
              ) : (
                <Row style={{ gap: 6 }}>
                  {[500, 1000, 2500].map((v) => (
                    <Chip key={v} label={`+${formatMoney(v, { decimals: false })}`} onPress={() => contributeGoal(g.id, v)} />
                  ))}
                  <Chip label="Diğer" onPress={() => setCustomFor(g.id)} />
                </Row>
              )}
            </Card>
          );
        })}
      </View>
    </View>
  );
}

/* ------------------------------ Form parçaları ------------------------------ */

function TextField({
  value,
  onChange,
  placeholder,
  autoFocus,
  keyboardType,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  style?: object;
}) {
  const t = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={t.textMuted}
      autoFocus={autoFocus}
      keyboardType={keyboardType}
      style={[styles.input, { color: t.text, backgroundColor: t.surfaceAlt }, style]}
    />
  );
}

function MoneyInput(props: { value: string; onChange: (v: string) => void; placeholder: string; autoFocus?: boolean }) {
  return (
    <TextField
      {...props}
      onChange={(v) => props.onChange(v.replace(/[^0-9,]/g, ''))}
      keyboardType="decimal-pad"
      style={{ flex: 1 }}
    />
  );
}

function SmallBtn({ label, onPress, subtle }: { label: string; onPress: () => void; subtle?: boolean }) {
  const t = useTheme();
  return (
    <Touch onPress={onPress} style={[styles.btn, { backgroundColor: subtle ? t.surfaceAlt : t.primary }]}>
      <T v="bodyBold" color={subtle ? t.text : t.onPrimary}>
        {label}
      </T>
    </Touch>
  );
}

const styles = StyleSheet.create({
  segment: {
    padding: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  limitRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    width: 46,
    height: 46,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  input: {
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
