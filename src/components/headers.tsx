import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type GlyphName } from '@/components/icon';
import { TAB_BAR_SPACE } from '@/components/tab-bar';
import { T, Touch } from '@/components/ui';
import { Base } from '@/constants/motion';
import { FontFamily, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBudget } from '@/store/budget';

/**
 * Ana sayfa başlığı: renkli bant yok. Avatar + selamlama + arama + zil,
 * altında ortalanmış bölüm sekmeleri.
 */
export function HomeHeader<K extends string>({
  sections,
  active,
  onChange,
  hasAlert,
  onBell,
}: {
  sections: { key: K; label: string }[];
  active: K;
  onChange: (k: K) => void;
  hasAlert?: boolean;
  onBell: () => void;
}) {
  const insets = useSafeAreaInsets();
  const userName = useBudget((s) => s.settings.userName);
  const familyName = useBudget((s) => s.settings.familyName);
  const firstName = userName.split(' ')[0];

  return (
    <View style={[styles.inner, { paddingTop: insets.top + 10, paddingHorizontal: Spacing.three }]}>
      <View style={styles.topRow}>
        <Avatar />
        <View style={{ flex: 1 }}>
          <T v="small" muted numberOfLines={1}>
            {familyName ? `${familyName} ailesi` : 'Hoş geldin'}
          </T>
          <T v="title" style={{ fontSize: 20 }} numberOfLines={1}>
            Merhaba{firstName ? `, ${firstName}` : ''}!
          </T>
        </View>
        <IconButton icon="bellOutline" label="Ödemeler" onPress={onBell} dot={hasAlert} />
        <IconButton icon="search" label="Ara" onPress={() => router.push('/islemler?ara=1')} />
      </View>
      <SectionTabs sections={sections} active={active} onChange={onChange} />
    </View>
  );
}

/** Çerçevesiz ikon butonu; isteğe bağlı kırmızı bildirim noktası. */
export function IconButton({ icon, label, onPress, dot }: { icon: GlyphName; label: string; onPress: () => void; dot?: boolean }) {
  const t = useTheme();
  return (
    <Touch onPress={onPress} hitSlop={8} style={styles.iconBtn} accessibilityLabel={label}>
      <Icon name={icon} size={24} color={t.text} weight="line" />
      {dot ? <View style={[styles.dot, { borderColor: t.background }]} /> : null}
    </Touch>
  );
}

function Avatar() {
  const t = useTheme();
  const userName = useBudget((s) => s.settings.userName);
  const initials =
    userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR'))
      .join('') || 'B';
  return (
    <Touch onPress={() => router.push('/profil')} style={[styles.avatar, { backgroundColor: t.pastel }]} accessibilityLabel="Profil">
      <T v="bodyBold" color={t.onPastel} style={{ fontSize: 15 }}>
        {initials}
      </T>
    </Touch>
  );
}

/**
 * Ortalanmış yazı sekmeleri. Seçili olan koyu, diğerleri soluk; alttaki
 * siyah çizgi seçilene kayar ve genişliğini yazıya uydurur (200 ms, sekme yok).
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
  const t = useTheme();
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
          color={t.text}
          onPress={() => onChange(s.key)}
          onLayout={(lx, width) =>
            setLayouts((prev) => (prev[s.key]?.x === lx && prev[s.key]?.width === width ? prev : { ...prev, [s.key]: { x: lx, width } }))
          }
        />
      ))}
      <Animated.View pointerEvents="none" style={[styles.tabLine, { backgroundColor: t.ink }, line]} />
    </ScrollView>
  );
}

function SectionTab({
  label,
  on,
  color,
  onPress,
  onLayout,
}: {
  label: string;
  on: boolean;
  color: string;
  onPress: () => void;
  onLayout: (x: number, width: number) => void;
}) {
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    p.set(withTiming(on ? 1 : 0, Base));
  }, [on, p]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.4 + 0.6 * p.get(),
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
      <Animated.Text style={[styles.tabText, { color }, style]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </Touch>
  );
}

/**
 * Diğer sayfaların başlığı: ortalanmış başlık, sağda/solda isteğe bağlı buton,
 * altında isteğe bağlı içerik (siyah hap seçici, arama...).
 */
export function PageHeader({ title, left, right, children }: { title: string; left?: ReactNode; right?: ReactNode; children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.inner, { paddingTop: insets.top + 8, paddingHorizontal: Spacing.three }]}>
      <View style={styles.titleRow}>
        <View style={styles.side}>{left}</View>
        <T v="heading" style={{ fontSize: 18 }}>
          {title}
        </T>
        <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
      </View>
      {children}
    </View>
  );
}

/** Sayfa: pastel degrade zemin üzerinde kaydırılabilir içerik. */
export function Page({ header, children }: { header: ReactNode; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bgGradient[0] }}>
      <LinearGradient colors={t.bgGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {header}
        <View style={[styles.inner, { paddingHorizontal: Spacing.three }]}>{children}</View>
      </ScrollView>
    </View>
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
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: '#F0524F',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  side: {
    flex: 1,
  },
  tabs: {
    marginTop: Spacing.three,
    marginHorizontal: -Spacing.three,
  },
  tabsContent: {
    // Sığıyorsa ortala, sığmıyorsa kaydırılabilir kalsın
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    gap: 26,
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 15,
    fontFamily: FontFamily.semibold,
  },
  tabLine: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 100,
    height: 2.5,
    borderRadius: 2,
    transformOrigin: 'left',
  },
});
