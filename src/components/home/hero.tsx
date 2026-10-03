import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon, type GlyphName } from '@/components/icon';
import { Amount, Row, T, Touch } from '@/components/ui';
import { Base, enter } from '@/constants/motion';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBudget } from '@/store/budget';

export type HeroAction = { icon: GlyphName; label: string; onPress: () => void };

/** Bir bölümün bakiye kartında gösterilecek veriler. */
export type HeroData = {
  label: string;
  value: number;
  pill?: { icon: GlyphName; text: string };
  onPill?: () => void;
  actions: HeroAction[];
};

/**
 * Bakiye kartı: beyaz kartın içinde pastel renkli bir kart (büyük siyah tutar),
 * altında ince ayraçlı işlem satırı. Kart bölüm değişince yeniden kurulmaz;
 * yalnızca pastel renk 200 ms'de geçer, içerik soluklaşıp yenisi belirir.
 */
export function BalanceCard({ data, pastel }: { data: HeroData; pastel: string }) {
  const t = useTheme();
  const hidden = useBudget((s) => s.settings.hideBalance);
  const updateSettings = useBudget((s) => s.updateSettings);

  const bg = useSharedValue(pastel);
  useEffect(() => {
    bg.set(withTiming(pastel, Base));
  }, [pastel, bg]);
  const bgStyle = useAnimatedStyle(() => ({ backgroundColor: bg.get() }));

  return (
    <View style={[styles.outer, { backgroundColor: t.surface, shadowOpacity: t.scheme === 'dark' ? 0 : 0.08 }]}>
      <Animated.View style={[styles.pastel, bgStyle]}>
        <Touch
          onPress={() => updateSettings({ hideBalance: !hidden })}
          hitSlop={10}
          style={styles.eye}
          accessibilityLabel={hidden ? 'Tutarı göster' : 'Tutarı gizle'}>
          <Icon name={hidden ? 'eyeOff' : 'eye'} size={22} color={t.onPastel} weight="line" />
        </Touch>

        <Animated.View key={data.label} entering={enter} style={{ alignItems: 'center' }}>
          {/* Etiket küçük ve soluk: kartta öne çıkan tek şey tutar */}
          <T v="bodyBold" color={t.onPastel} style={{ opacity: 0.65 }}>
            {data.label}
          </T>
          <View style={{ marginTop: 4 }}>
            <Amount value={data.value} color={t.onPastel} hidden={hidden} size={44} />
          </View>
          {data.pill ? (
            <Touch onPress={data.onPill} disabled={!data.onPill} style={[styles.sub, { backgroundColor: 'rgba(255,255,255,0.55)' }]}>
              <Icon name={data.pill.icon} size={14} color={t.onPastel} weight="line" />
              <T v="small" color={t.onPastel} style={{ fontWeight: '500' }}>
                {data.pill.text}
              </T>
              {data.onPill ? <Icon name="chevronRight" size={12} color={t.onPastel} weight="bold" /> : null}
            </Touch>
          ) : null}
        </Animated.View>
      </Animated.View>

      <Row style={styles.actions}>
        {data.actions.map((a, i) => (
          <Touch key={a.label} onPress={a.onPress} pressScale={0.92} style={styles.action} accessibilityLabel={a.label}>
            {/* İlk eylem birincil: siyah daire; diğerleri gri */}
            <View style={[styles.actionCircle, { backgroundColor: i === 0 ? t.ink : t.surfaceAlt }]}>
              <Icon name={a.icon} size={22} color={i === 0 ? t.onInk : t.text} weight="bold" />
            </View>
            <T v="small" numberOfLines={1} adjustsFontSizeToFit style={{ fontWeight: '500' }}>
              {a.label}
            </T>
          </Touch>
        ))}
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginTop: Spacing.four,
    borderRadius: Radius.xl + 4,
    padding: 6,
    shadowColor: '#1B2A1F',
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  pastel: {
    borderRadius: Radius.xl,
    paddingTop: 22,
    paddingBottom: 26,
    paddingHorizontal: Spacing.three,
  },
  eye: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 1,
  },
  sub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  actions: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
});
