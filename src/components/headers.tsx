import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { TAB_BAR_SPACE } from '@/components/tab-bar';
import { SearchPill, T, Touch } from '@/components/ui';
import { FontFamily, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mix } from '@/lib/color';
import { greeting } from '@/lib/format';
import { useBudget } from '@/store/budget';

const SEARCH_H = 50;
const SPRING = { damping: 20, stiffness: 220 };

/**
 * Ana sayfa başlığı (Akbank "Genel bakış" düzeni):
 * açık tonlu üst şerit → renkli alan + hap sekmeler → sınıra binen arama çubuğu.
 * Bölüm değişince renk yumuşakça geçer.
 */
export function HomeHeader<K extends string>({
  color,
  sections,
  active,
  onChange,
  children,
  hasAlert,
  onBell,
}: {
  color: string;
  sections: { key: K; label: string }[];
  active: K;
  onChange: (k: K) => void;
  children: ReactNode;
  hasAlert?: boolean;
  onBell: () => void;
}) {
  const insets = useSafeAreaInsets();
  const userName = useBudget((s) => s.settings.userName);
  const familyName = useBudget((s) => s.settings.familyName);
  const firstName = userName.split(' ')[0];

  const bg = useSharedValue(color);
  const strip = useSharedValue(mix(color, '#ffffff', 0.14));
  useEffect(() => {
    bg.set(withTiming(color, { duration: 450 }));
    strip.set(withTiming(mix(color, '#ffffff', 0.14), { duration: 450 }));
  }, [color, bg, strip]);

  const bgStyle = useAnimatedStyle(() => ({ backgroundColor: bg.get() }));
  const stripStyle = useAnimatedStyle(() => ({ backgroundColor: strip.get() }));

  return (
    <View>
      {/* Üst şerit: selamlama, zil, avatar */}
      <Animated.View style={[{ paddingTop: insets.top + 10, paddingBottom: 14, paddingHorizontal: Spacing.three }, stripStyle]}>
        <View style={[styles.inner, styles.topRow]}>
          <View style={styles.logo}>
            <Icon name="family" size={20} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <T v="small" color="rgba(255,255,255,0.85)" numberOfLines={1}>
              {greeting()}
              {firstName ? ` ${firstName},` : ','}
            </T>
            <T v="bodyBold" color="#fff" numberOfLines={1}>
              {familyName ? `${familyName} ailesinin bütçesi` : 'Aile bütçen burada!'}
            </T>
          </View>
          <Touch onPress={onBell} hitSlop={8} accessibilityLabel="Ödemeler ve hatırlatmalar">
            <Icon name="bellOutline" size={26} color="#fff" />
            {hasAlert ? <View style={styles.alertDot} /> : null}
          </Touch>
          <Avatar color={color} />
        </View>
      </Animated.View>

      {/* Renkli alan */}
      <Animated.View style={[{ paddingBottom: SEARCH_H / 2 + Spacing.four }, bgStyle]}>
        <View style={styles.inner}>
          <SegmentChips sections={sections} active={active} onChange={onChange} />
          <Animated.View key={active} entering={FadeIn.duration(300)} style={{ paddingHorizontal: Spacing.three }}>
            {children}
          </Animated.View>
        </View>
      </Animated.View>

      <View style={[styles.inner, { marginTop: -SEARCH_H / 2, paddingHorizontal: Spacing.three }]}>
        <SearchPill onPress={() => router.push('/islemler?ara=1')} />
      </View>
    </View>
  );
}

function Avatar({ color }: { color: string }) {
  const userName = useBudget((s) => s.settings.userName);
  const initials =
    userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR'))
      .join('') || 'B';
  return (
    <Touch onPress={() => router.push('/profil')} style={styles.avatar} accessibilityLabel="Profil">
      <T v="bodyBold" color={color} style={{ fontSize: 16 }}>
        {initials}
      </T>
    </Touch>
  );
}

/** Yatay hap sekmeler; seçili olanın arkasındaki vurgu yaylanarak kayar. */
function SegmentChips<K extends string>({
  sections,
  active,
  onChange,
}: {
  sections: { key: K; label: string }[];
  active: K;
  onChange: (k: K) => void;
}) {
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);

  useEffect(() => {
    const l = layouts[active];
    if (!l) return;
    x.set(withSpring(l.x, SPRING));
    w.set(withSpring(l.width, SPRING));
  }, [active, layouts, x, w]);

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }], width: w.get() }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: Spacing.three, paddingVertical: Spacing.four }}>
      <Animated.View style={[styles.chipIndicator, indicator]} />
      {sections.map((s) => (
        <Touch
          key={s.key}
          pressScale={0.94}
          onPress={() => onChange(s.key)}
          onLayout={(e) => {
            const { x: lx, width } = e.nativeEvent.layout;
            setLayouts((prev) => (prev[s.key]?.x === lx && prev[s.key]?.width === width ? prev : { ...prev, [s.key]: { x: lx, width } }));
          }}
          style={styles.chip}>
          <T v="body" color="#fff" style={{ fontSize: 16, fontFamily: active === s.key ? FontFamily.semibold : FontFamily.regular }}>
            {s.label}
          </T>
        </Touch>
      ))}
    </ScrollView>
  );
}

/**
 * Diğer sekmelerin başlığı (Akbank "Transfer ve ödemeler" düzeni):
 * düz renkli alan, ortalanmış başlık, istenirse sınıra binen arama.
 */
export function PageHeader({ title, search }: { title: string; search?: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View>
      <View
        style={{
          backgroundColor: t.primary,
          paddingTop: insets.top + 14,
          paddingBottom: search ? SEARCH_H / 2 + 22 : 22,
          alignItems: 'center',
        }}>
        <T v="title" color="#fff" style={{ fontSize: 20 }}>
          {title}
        </T>
      </View>
      {search ? (
        <View style={[styles.inner, { marginTop: -SEARCH_H / 2, paddingHorizontal: Spacing.three }]}>{search}</View>
      ) : null}
    </View>
  );
}

/** Kaydırılabilir sayfa: başlık + içerik. */
export function Page({ header, children }: { header: ReactNode; children: ReactNode }) {
  const t = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.background }}
      contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {header}
      <View style={[styles.inner, { paddingHorizontal: Spacing.three }]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  alertDot: {
    position: 'absolute',
    top: -1,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  chipIndicator: {
    position: 'absolute',
    left: 0,
    top: Spacing.four,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  chip: {
    height: 42,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
});
