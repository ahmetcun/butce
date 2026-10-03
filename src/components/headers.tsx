import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type GlyphName } from '@/components/icon';
import { TAB_BAR_SPACE } from '@/components/tab-bar';
import { T, Touch } from '@/components/ui';
import { Base, enter } from '@/constants/motion';
import { FontFamily, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { greeting } from '@/lib/format';
import { useBudget } from '@/store/budget';

/** Renkli alanın o anki rengi; içindeki butonlar ikonlarını bu renge boyar. */
const HeroColor = createContext('#000000');
export const useHeroColor = () => useContext(HeroColor);

/**
 * Ana sayfa başlığı: tek parça, köşeleri yuvarlak, hafif degradeli renkli alan.
 * Üstte selamlama + arama + zil, altında segment kontrol ve bölüm özeti.
 * Bölüm değişince renk 200 ms'de yumuşakça geçer.
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

  useFocusEffect(useCallback(() => setStatusBarStyle('light'), []));

  const bg = useSharedValue(color);
  useEffect(() => {
    bg.set(withTiming(color, Base));
  }, [color, bg]);
  const bgStyle = useAnimatedStyle(() => ({ backgroundColor: bg.get() }));

  return (
    <HeroColor.Provider value={color}>
      <Animated.View style={[styles.hero, { paddingTop: insets.top + 10 }, bgStyle]}>
        {/* Derinlik için degrade ve dekoratif halkalar */}
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.22)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View pointerEvents="none" style={[styles.ring, { width: 280, height: 280, top: -110, right: -100 }]} />
        <View pointerEvents="none" style={[styles.ring, { width: 180, height: 180, bottom: -70, left: -60 }]} />

        <View style={styles.inner}>
          {/* Üst satır */}
          <View style={styles.topRow}>
            <Avatar />
            <View style={{ flex: 1 }}>
              <T v="small" color="rgba(255,255,255,0.8)" numberOfLines={1}>
                {greeting()}
                {firstName ? `, ${firstName}` : ''} 👋
              </T>
              <T v="bodyBold" color="#fff" numberOfLines={1} style={{ fontSize: 16 }}>
                {familyName ? `${familyName} ailesi` : 'Aile bütçen'}
              </T>
            </View>
            <HeaderButton icon="search" label="Ara" onPress={() => router.push('/islemler?ara=1')} />
            <HeaderButton icon="bellOutline" label="Ödemeler" onPress={onBell} dot={hasAlert} />
          </View>

          <SectionTabs sections={sections} active={active} onChange={onChange} />

          <Animated.View key={active} entering={enter}>
            {children}
          </Animated.View>
        </View>
      </Animated.View>
    </HeroColor.Provider>
  );
}

function HeaderButton({ icon, label, onPress, dot }: { icon: GlyphName; label: string; onPress: () => void; dot?: boolean }) {
  return (
    <Touch onPress={onPress} hitSlop={6} style={styles.headerBtn} accessibilityLabel={label}>
      <Icon name={icon} size={21} color="#fff" />
      {dot ? <View style={styles.dot} /> : null}
    </Touch>
  );
}

function Avatar() {
  const userName = useBudget((s) => s.settings.userName);
  const color = useHeroColor();
  const initials =
    userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR'))
      .join('') || 'B';
  return (
    <Touch onPress={() => router.push('/profil')} style={styles.avatar} accessibilityLabel="Profil">
      <T v="bodyBold" color={color} style={{ fontSize: 15 }}>
        {initials}
      </T>
    </Touch>
  );
}

/**
 * Yazı tabanlı bölüm sekmeleri. Seçili olan tam opak ve yerinde, diğerleri
 * soluk ve hafif aşağıda. Alttaki çizgi seçilen yazıya kayar ve genişliğini
 * ona uydurur. Yalnızca transform/opaklık; 200 ms, sekme yok.
 */
function SectionTabs<K extends string>({
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
    // İlk ölçümde animasyonsuz yerleş, sonrakilerde kay
    const first = w.get() === 0;
    x.set(first ? l.x : withTiming(l.x, Base));
    w.set(first ? l.width : withTiming(l.width, Base));
  }, [active, layouts, x, w]);

  // Genişlik yerine scaleX: 100 birimlik çizgi ölçeklenir (yerleşim hesabı yok)
  const line = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }, { scaleX: w.get() / 100 }] }));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
      {sections.map((s) => (
        <SectionTab
          key={s.key}
          label={s.label}
          on={s.key === active}
          onPress={() => onChange(s.key)}
          onLayout={(lx, width) =>
            setLayouts((prev) => (prev[s.key]?.x === lx && prev[s.key]?.width === width ? prev : { ...prev, [s.key]: { x: lx, width } }))
          }
        />
      ))}
      <Animated.View pointerEvents="none" style={[styles.tabLine, line]} />
    </ScrollView>
  );
}

function SectionTab({ label, on, onPress, onLayout }: { label: string; on: boolean; onPress: () => void; onLayout: (x: number, width: number) => void }) {
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    p.set(withTiming(on ? 1 : 0, Base));
  }, [on, p]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.55 + 0.45 * p.get(),
    transform: [{ translateY: 2 * (1 - p.get()) }],
  }));

  return (
    <Touch
      pressScale={0.95}
      onPress={onPress}
      onLayout={(e) => onLayout(e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      hitSlop={{ top: 8, bottom: 8 }}>
      <Animated.Text style={[styles.tabText, style]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </Touch>
  );
}

/**
 * Diğer sekmelerin başlığı: renkli bant yok, büyük sola yaslı başlık.
 * Altına istenirse arama alanı gelir.
 */
export function PageHeader({ title, subtitle, search }: { title: string; subtitle?: string; search?: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => setStatusBarStyle(t.scheme === 'dark' ? 'light' : 'dark'), [t.scheme]));

  return (
    <View style={[styles.inner, { paddingTop: insets.top + Spacing.three, paddingHorizontal: Spacing.three }]}>
      <T style={{ fontSize: 32, fontFamily: FontFamily.semibold, letterSpacing: -0.5 }}>{title}</T>
      {subtitle ? (
        <T v="body" muted style={{ marginTop: 2 }}>
          {subtitle}
        </T>
      ) : null}
      {search ? <View style={{ marginTop: Spacing.three }}>{search}</View> : null}
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
  hero: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 28,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD166',
  },
  tabs: {
    marginTop: Spacing.four,
    marginHorizontal: -Spacing.three,
  },
  tabsContent: {
    // Sığıyorsa ortala, sığmıyorsa kaydırılabilir kalsın
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    gap: 22,
    paddingBottom: 10,
  },
  tabText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FontFamily.semibold,
  },
  tabLine: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 100,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#fff',
    transformOrigin: 'left',
  },
});
