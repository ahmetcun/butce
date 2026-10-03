import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Chip, Row, T, tap, Touch } from '@/components/ui';
import { FontFamily, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney, monthKey } from '@/lib/format';
import { frequentCategoryIds, monthTransactions, totals } from '@/lib/selectors';
import { useBudget, type TxType } from '@/store/budget';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'del'] as const;
const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];
const DAYS = ['Bugün', 'Dün', '2 gün önce'];

export default function AddTransaction() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: TxType; kategori?: string }>();

  const categories = useBudget((s) => s.categories);
  const members = useBudget((s) => s.members);
  const transactions = useBudget((s) => s.transactions);
  const defaultMemberId = useBudget((s) => s.settings.defaultMemberId);
  const addTransaction = useBudget((s) => s.addTransaction);

  const [type, setType] = useState<TxType>(params.type === 'income' ? 'income' : 'expense');
  const [raw, setRaw] = useState('');
  const [memberId, setMemberId] = useState(defaultMemberId);
  const [daysAgo, setDaysAgo] = useState(0);
  const [note, setNote] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);

  // En sık kullanılan kategoriler başta; ilk sıradaki önceden seçili gelir.
  const sorted = useMemo(() => {
    const freq = frequentCategoryIds(transactions, type);
    const list = categories.filter((c) => c.type === type);
    const rank = (id: string) => {
      const i = freq.indexOf(id);
      return i === -1 ? 999 : i;
    };
    return [...list].sort((a, b) => rank(a.id) - rank(b.id));
  }, [categories, transactions, type]);

  const [pickedCategory, setCategoryId] = useState<string | null>(params.kategori ?? null);
  const categoryId = pickedCategory && sorted.some((c) => c.id === pickedCategory) ? pickedCategory : sorted[0]?.id;

  const amount = Number(raw.replace(',', '.')) || 0;
  const monthBalance = useMemo(() => totals(monthTransactions(transactions, monthKey())).balance, [transactions]);
  const member = members.find((m) => m.id === memberId) ?? members[0];
  const nextMember = () => {
    const i = members.findIndex((m) => m.id === memberId);
    setMemberId(members[(i + 1) % members.length].id);
  };

  const press = (k: (typeof KEYS)[number]) => {
    tap();
    setRaw((prev) => {
      if (k === 'del') return prev.slice(0, -1);
      if (k === ',') return prev.includes(',') ? prev : (prev || '0') + ',';
      const [int, frac] = prev.split(',');
      if (frac !== undefined && frac.length >= 2) return prev;
      if (frac === undefined && int.length >= 9) return prev;
      if (prev === '0') return k;
      return prev + k;
    });
  };

  const save = () => {
    if (!amount || !categoryId) return;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    addTransaction({ type, amount, categoryId, memberId, note: note.trim() || undefined, date: d.toISOString() });
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  // Yazılanı aynen göster: "1.250," → kullanıcı virgülden sonrasını yazıyor
  const [intPart, fracPart] = raw.split(',');
  const intText = formatMoney(Number(intPart) || 0, { decimals: false }).replace(' TL', '');
  const fracText = fracPart !== undefined ? ',' + fracPart : '';

  // Her tuşa basışta tutar çok hafif büyüyüp döner (sekme yok, 140 ms)
  const pop = useSharedValue(1);
  useEffect(() => {
    if (raw) pop.set(withSequence(withTiming(1.03, { duration: 50 }), withTiming(1, { duration: 90 })));
  }, [raw, pop]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));

  return (
    <View style={{ flex: 1, backgroundColor: t.bgGradient[0] }}>
      <LinearGradient colors={t.bgGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[styles.wrap, { paddingTop: Platform.OS === 'ios' ? Spacing.two : insets.top + Spacing.two }]}>
        {/* Üst satır: kapat · başlık · gider/gelir değiştir */}
        <Row style={styles.topBar}>
          <Touch onPress={() => router.back()} hitSlop={12} style={styles.topBtn} accessibilityLabel="Kapat">
            <Icon name="close" color={t.text} size={22} />
          </Touch>
          <T v="heading" style={{ flex: 1, textAlign: 'center', fontSize: 18 }}>
            {type === 'expense' ? 'Gider ekle' : 'Gelir ekle'}
          </T>
          <Touch
            onPress={() => setType((x) => (x === 'expense' ? 'income' : 'expense'))}
            hitSlop={12}
            style={styles.topBtn}
            accessibilityLabel={type === 'expense' ? 'Gelire geç' : 'Gidere geç'}>
            <Icon name="swap" color={t.text} size={22} />
          </Touch>
        </Row>

        {/* Beyaz sayfa */}
        <View style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: insets.bottom + Spacing.two }]}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: Spacing.two }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Siyah hap: kim harcadı (dokununca sıradaki üye) */}
            <View style={{ alignItems: 'center' }}>
              <Touch onPress={nextMember} disabled={members.length < 2} style={[styles.memberPill, { backgroundColor: t.ink }]} accessibilityLabel="Kişiyi değiştir">
                <T style={{ fontSize: 16 }}>{member.emoji}</T>
                <T v="bodyBold" color={t.onInk}>
                  {member.name}
                </T>
                {members.length > 1 ? <Icon name="chevronDown" size={14} color={t.onInk} /> : null}
              </Touch>
            </View>

            {/* Kategoriler */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.three }} contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.three }}>
              {sorted.map((c) => {
                const sel = c.id === categoryId;
                return (
                  <Touch
                    key={c.id}
                    pressScale={0.94}
                    onPress={() => setCategoryId(c.id)}
                    style={[styles.category, { backgroundColor: sel ? t.ink : t.surfaceAlt }]}>
                    <View style={[styles.categoryDot, { backgroundColor: c.color }]}>
                      <Icon name={c.icon} size={15} color="#fff" weight="line" />
                    </View>
                    <T v="small" color={sel ? t.onInk : t.text} style={{ fontWeight: '500' }}>
                      {c.name}
                    </T>
                  </Touch>
                );
              })}
            </ScrollView>

            {/* Tutar */}
            <View style={{ alignItems: 'center', marginTop: Spacing.four }}>
              <Animated.View style={popStyle}>
                <Text
                  style={{ color: t.text, fontFamily: FontFamily.semibold, fontSize: 52, letterSpacing: -1.5, opacity: raw ? 1 : 0.35 }}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {intText}
                  <Text style={{ fontSize: 34, opacity: 0.45 }}>{fracText} TL</Text>
                </Text>
              </Animated.View>
              <T v="body" muted style={{ marginTop: 2 }}>
                Bu ay kalan: {formatMoney(monthBalance)}
              </T>
            </View>

            {/* Hızlı tutar ve gün */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.three }} contentContainerStyle={{ gap: 6, paddingHorizontal: Spacing.three }}>
              {QUICK_AMOUNTS.map((v) => (
                <Touch key={v} pressScale={0.9} onPress={() => setRaw(String(v))} style={[styles.quickAmount, { backgroundColor: t.surfaceAlt }]}>
                  <T v="small" style={{ fontWeight: '500' }}>
                    {v} TL
                  </T>
                </Touch>
              ))}
              <View style={{ width: 1, backgroundColor: t.border, marginHorizontal: 4 }} />
              {DAYS.map((label, i) => (
                <Chip key={label} label={label} selected={daysAgo === i} onPress={() => setDaysAgo(i)} />
              ))}
            </ScrollView>

            {/* Not */}
            <View style={[styles.note, { backgroundColor: t.surfaceAlt }]}>
              <Icon name="list" size={18} color={t.textMuted} weight="line" />
              <TextInput
                value={note}
                onChangeText={setNote}
                onFocus={() => setNoteOpen(true)}
                onBlur={() => setNoteOpen(false)}
                placeholder="Not (isteğe bağlı)"
                placeholderTextColor={t.textMuted}
                returnKeyType="done"
                maxLength={40}
                style={[styles.noteInput, { color: t.text }]}
              />
            </View>
          </ScrollView>

          {/* Tuş takımı + kaydet (not yazarken klavyeye yer açmak için gizlenir) */}
          {!noteOpen ? (
            <View style={styles.pad}>
              <View style={styles.keys}>
                {KEYS.map((k) => (
                  <Touch
                    key={k}
                    haptic={false}
                    pressScale={0.92}
                    onPress={() => press(k)}
                    style={[styles.key, k !== 'del' && k !== ',' && { backgroundColor: t.surfaceAlt }]}
                    accessibilityLabel={k === 'del' ? 'Sil' : k}>
                    {k === 'del' ? <Icon name="backspace" color={t.text} size={24} /> : <T style={{ fontSize: 24, fontWeight: '500' }}>{k}</T>}
                  </Touch>
                ))}
              </View>
              <Touch haptic={false} disabled={!amount} onPress={save} style={[styles.save, { backgroundColor: t.ink, opacity: amount ? 1 : 0.35 }]}>
                <T v="heading" color={t.onInk}>
                  Kaydet
                </T>
              </Touch>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  topBar: {
    paddingHorizontal: Spacing.three,
    height: 52,
  },
  topBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 4,
    paddingTop: Spacing.four,
    borderRadius: Radius.xl,
    shadowColor: '#1B2A1F',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 6,
    paddingRight: 14,
    height: 42,
    borderRadius: Radius.pill,
  },
  categoryDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmount: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    justifyContent: 'center',
    height: 36,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: Radius.md,
  },
  noteInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: FontFamily.regular,
  },
  pad: {
    paddingHorizontal: Spacing.three,
    gap: 12,
  },
  keys: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  key: {
    width: '31.8%',
    flexGrow: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  save: {
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
