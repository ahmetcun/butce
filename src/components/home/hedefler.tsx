import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { MoneyInput, parseMoney, PillButton, TextField } from '@/components/form';
import type { HeroData } from '@/components/home/hero';
import { Icon } from '@/components/icon';
import { Card, Chip, EmptyState, ProgressBar, Row, SectionLabel, T, Touch } from '@/components/ui';
import { enter, layout } from '@/constants/motion';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/lib/confirm';
import { formatMoney } from '@/lib/format';
import { useBudget } from '@/store/budget';

const GOAL_EMOJIS = ['🏖️', '🏠', '🚗', '🎓', '🛟', '💍', '📱', '👶'];

export function useHedeflerHero({ setAdding, setCustomFor }: { setAdding: (v: boolean) => void; setCustomFor: (id: string | null) => void }): HeroData {
  const goals = useBudget((s) => s.goals);
  const saved = goals.reduce((a, g) => a + g.saved, 0);
  const target = goals.reduce((a, g) => a + g.target, 0);

  return {
    label: 'Toplam birikim',
    value: saved,
    pill: { icon: 'target', text: target ? `Hedef: ${formatMoney(target, { decimals: false })}` : 'Henüz hedef yok' },
    actions: [
      { icon: 'plusCircle', label: 'Hedef ekle', onPress: () => setAdding(true) },
      { icon: 'piggy', label: 'Para ekle', onPress: () => setCustomFor(goals[0]?.id ?? null) },
      { icon: 'arrowDown', label: 'Gelir ekle', onPress: () => router.push({ pathname: '/ekle', params: { type: 'income' } }) },
    ],
  };
}

export function HedeflerBody({
  adding,
  setAdding,
  customFor,
  setCustomFor,
}: {
  adding: boolean;
  setAdding: (v: boolean) => void;
  customFor: string | null;
  setCustomFor: (id: string | null) => void;
}) {
  const t = useTheme();
  const goals = useBudget((s) => s.goals);
  const addGoal = useBudget((s) => s.addGoal);
  const contributeGoal = useBudget((s) => s.contributeGoal);
  const removeGoal = useBudget((s) => s.removeGoal);

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState(GOAL_EMOJIS[0]);
  const [custom, setCustom] = useState('');

  const submit = () => {
    const n = parseMoney(target);
    if (!name.trim() || !n) return;
    addGoal({ name: name.trim(), target: n, emoji });
    setName('');
    setTarget('');
    setAdding(false);
  };

  return (
    <View>
      {/* Akbank "Yatırım işlemleri · Yatırım yap" satırı */}
      <Row style={{ marginTop: Spacing.four, gap: Spacing.three }}>
        <View style={{ flex: 1 }}>
          <T v="title" style={{ fontSize: 20 }}>
            Birikim hedefleri
          </T>
          <T v="body" muted>
            Ailece neye biriktiriyorsunuz?
          </T>
        </View>
        {!adding ? (
          <Touch onPress={() => setAdding(true)} style={[styles.outlineBtn, { borderColor: t.primary }]}>
            <Icon name="plusCircle" size={18} color={t.primary} />
            <T v="bodyBold" color={t.primary}>
              Hedef ekle
            </T>
          </Touch>
        ) : null}
      </Row>

      {adding ? (
        <Animated.View entering={enter}>
          <Card style={{ gap: Spacing.two, marginTop: Spacing.three }}>
            <Row style={{ gap: 6, flexWrap: 'wrap' }}>
              {GOAL_EMOJIS.map((e) => (
                <Touch
                  key={e}
                  pressScale={0.88}
                  onPress={() => setEmoji(e)}
                  style={[styles.emoji, { backgroundColor: emoji === e ? t.primarySoft : t.surfaceAlt, borderColor: emoji === e ? t.primary : 'transparent' }]}>
                  <T style={{ fontSize: 22 }}>{e}</T>
                </Touch>
              ))}
            </Row>
            <TextField value={name} onChange={setName} placeholder="Hedef adı (Örn: Yaz tatili)" autoFocus />
            <MoneyInput value={target} onChange={setTarget} placeholder="Hedef tutar (TL)" />
            <Row style={{ gap: Spacing.two }}>
              <View style={{ flex: 1 }}>
                <PillButton label="Hedefi oluştur" onPress={submit} />
              </View>
              <PillButton label="Vazgeç" outline onPress={() => setAdding(false)} />
            </Row>
          </Card>
        </Animated.View>
      ) : null}

      {goals.length === 0 && !adding ? (
        <Card style={{ marginTop: Spacing.three }}>
          <EmptyState icon="target" text="Tatil, araba, acil durum fonu... Ailece biriktirdiğiniz hedefleri burada takip edin." />
        </Card>
      ) : null}

      {goals.length > 0 ? <SectionLabel>Hedeflerin</SectionLabel> : null}
      <View style={{ gap: 12 }}>
        {goals.map((g, i) => {
          const ratio = g.saved / g.target;
          const done = ratio >= 1;
          return (
            <Animated.View key={g.id} entering={enter} layout={layout}>
              <Card style={{ gap: 12 }}>
                <Touch haptic={false} pressScale={0.99} onLongPress={() => confirm('Hedef silinsin mi?', `"${g.name}" silinecek.`, () => removeGoal(g.id))}>
                  <Row style={{ gap: 14 }}>
                    <View style={[styles.goalEmoji, { backgroundColor: t.surfaceAlt }]}>
                      <T style={{ fontSize: 26 }}>{g.emoji}</T>
                    </View>
                    <View style={{ flex: 1 }}>
                      <T v="heading">{g.name}</T>
                      <T v="small" muted>
                        {done ? 'Hedefe ulaşıldı 🎉' : `${formatMoney(g.target - g.saved, { decimals: false })} kaldı`}
                      </T>
                    </View>
                    <T v="title" color={done ? t.income : t.primary}>
                      %{Math.min(100, Math.round(ratio * 100))}
                    </T>
                  </Row>
                </Touch>
                <ProgressBar value={ratio} color={done ? t.income : t.primary} height={8} />
                <T v="small" muted>
                  {formatMoney(g.saved, { decimals: false })} / {formatMoney(g.target, { decimals: false })}
                </T>
                {customFor === g.id ? (
                  <Animated.View entering={enter}>
                    <Row style={{ gap: Spacing.two }}>
                      <MoneyInput value={custom} onChange={setCustom} placeholder="Eklenecek tutar" autoFocus />
                      <PillButton
                        label="Ekle"
                        onPress={() => {
                          const n = parseMoney(custom);
                          if (n) contributeGoal(g.id, n);
                          setCustom('');
                          setCustomFor(null);
                        }}
                      />
                    </Row>
                  </Animated.View>
                ) : (
                  <Row style={{ gap: 6, flexWrap: 'wrap' }}>
                    {[500, 1000, 2500].map((v) => (
                      <Chip key={v} label={`+${formatMoney(v, { decimals: false })}`} onPress={() => contributeGoal(g.id, v)} />
                    ))}
                    <Chip label="Başka tutar" onPress={() => setCustomFor(g.id)} />
                  </Row>
                )}
              </Card>
            </Animated.View>
          );
        })}
      </View>
      {goals.length > 0 ? (
        <T v="small" muted style={{ textAlign: 'center', marginTop: 12 }}>
          Silmek için hedefe basılı tut
        </T>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emoji: {
    width: 46,
    height: 46,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  goalEmoji: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
