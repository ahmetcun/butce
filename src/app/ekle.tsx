import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Chip, IconBubble, Row, T, tap, Touch } from '@/components/ui';
import { FontFamily, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/lib/format';
import { frequentCategoryIds } from '@/lib/selectors';
import { useBudget, type TxType } from '@/store/budget';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'del'] as const;
const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];

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
  const accent = type === 'income' ? t.income : t.primary;

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

  // Her tuşa basışta tutar hafifçe zıplar
  const pop = useSharedValue(1);
  useEffect(() => {
    if (raw) pop.set(withSequence(withTiming(1.06, { duration: 70 }), withSpring(1, { damping: 12, stiffness: 300 })));
  }, [raw, pop]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      {/* Renkli üst alan: tür seçimi + tutar */}
      <View style={{ backgroundColor: accent, paddingTop: Platform.OS === 'ios' ? Spacing.three : insets.top + Spacing.two, paddingBottom: Spacing.four }}>
        <View style={styles.inner}>
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: Spacing.three }}>
            <Touch onPress={() => router.back()} hitSlop={12} accessibilityLabel="Kapat">
              <Icon name="close" color="#fff" size={24} />
            </Touch>
            <Row style={styles.segment}>
              {(['expense', 'income'] as const).map((k) => (
                <Touch key={k} onPress={() => setType(k)} style={[styles.segmentItem, type === k && { backgroundColor: '#fff' }]}>
                  <T v="bodyBold" color={type === k ? accent : '#fff'}>
                    {k === 'expense' ? 'Gider' : 'Gelir'}
                  </T>
                </Touch>
              ))}
            </Row>
            <View style={{ width: 24 }} />
          </Row>

          <View style={{ alignItems: 'center', paddingTop: Spacing.four }}>
            <T v="label" color="rgba(255,255,255,0.9)">
              {type === 'expense' ? 'HARCAMA TUTARI' : 'GELİR TUTARI'}
            </T>
            <Animated.View style={[{ marginTop: 6 }, popStyle]}>
              <Text style={{ color: '#fff', fontFamily: FontFamily.semibold, fontSize: 48, letterSpacing: -1, opacity: raw ? 1 : 0.6 }} numberOfLines={1} adjustsFontSizeToFit>
                {intText}
                <Text style={{ fontSize: 32, opacity: 0.6 }}>{fracText} TL</Text>
              </Text>
            </Animated.View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.three, marginTop: Spacing.three }}>
              {QUICK_AMOUNTS.map((v) => (
                <Touch key={v} pressScale={0.9} onPress={() => setRaw(String(v))} style={styles.quickAmount}>
                  <T v="small" color="#fff" style={{ fontWeight: '500' }}>
                    {v} TL
                  </T>
                </Touch>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      <View style={[styles.wrap, { paddingTop: Spacing.three }]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: Spacing.three, paddingBottom: Spacing.three }} keyboardShouldPersistTaps="handled">
          {/* Kategoriler */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two, paddingHorizontal: Spacing.three }}>
            {sorted.map((c) => {
              const sel = c.id === categoryId;
              return (
                <Touch
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  style={[styles.category, { backgroundColor: sel ? c.color + '1F' : t.surface, borderColor: sel ? c.color : t.border }]}>
                  <IconBubble icon={c.icon} color={c.color} size={36} />
                  <T v="caption" numberOfLines={2} style={{ textAlign: 'center', fontWeight: sel ? '800' : '600' }}>
                    {c.name}
                  </T>
                </Touch>
              );
            })}
          </ScrollView>

          {/* Kim, ne zaman, not */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: Spacing.three }}>
            {members.length > 1 &&
              members.map((m) => (
                <Chip key={m.id} label={`${m.emoji} ${m.name}`} selected={m.id === memberId} onPress={() => setMemberId(m.id)} />
              ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: Spacing.three }}>
            {['Bugün', 'Dün', '2 gün önce'].map((label, i) => (
              <Chip key={label} label={label} selected={daysAgo === i} onPress={() => setDaysAgo(i)} />
            ))}
            <Chip
              label={note ? `📝 ${note}` : 'Not ekle'}
              selected={noteOpen || !!note}
              onPress={() => setNoteOpen((o) => !o)}
            />
          </ScrollView>
          {noteOpen ? (
            <TextInput
              autoFocus
              value={note}
              onChangeText={setNote}
              onSubmitEditing={() => setNoteOpen(false)}
              placeholder="Örn: Haftalık market"
              placeholderTextColor={t.textMuted}
              returnKeyType="done"
              maxLength={40}
              style={[styles.note, { color: t.text, backgroundColor: t.surface, borderColor: t.border }]}
            />
          ) : null}
        </ScrollView>

        {/* Tuş takımı */}
        {!noteOpen ? (
          <View style={[styles.pad, { paddingBottom: insets.bottom + Spacing.two }]}>
            <View style={styles.keys}>
              {KEYS.map((k) => (
                <Touch key={k} haptic={false} onPress={() => press(k)} style={styles.key} accessibilityLabel={k === 'del' ? 'Sil' : k}>
                  {k === 'del' ? <Icon name="backspace" color={t.text} size={24} /> : <T style={{ fontSize: 26, fontWeight: '500' }}>{k}</T>}
                </Touch>
              ))}
            </View>
            <Touch
              haptic={false}
              disabled={!amount}
              onPress={save}
              style={[styles.save, { backgroundColor: accent, opacity: amount ? 1 : 0.4 }]}>
              <Icon name="check" color="#fff" size={22} />
              <T v="heading" color="#fff">
                Kaydet
              </T>
            </Touch>
          </View>
        ) : (
          <View style={{ padding: Spacing.three, paddingBottom: insets.bottom + Spacing.three }}>
            <Touch onPress={() => setNoteOpen(false)} style={[styles.save, { backgroundColor: t.surfaceAlt }]}>
              <T v="heading">Tamam</T>
            </Touch>
          </View>
        )}
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
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  segment: {
    padding: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  segmentItem: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  quickAmount: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  category: {
    width: 84,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  note: {
    marginHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
  pad: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  keys: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  key: {
    width: '33.333%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  save: {
    height: 56,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
