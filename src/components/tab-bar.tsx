import { router } from 'expo-router';
import type { Tabs } from 'expo-router/js-tabs';
import { useEffect, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon, type GlyphName } from '@/components/icon';
import { tap } from '@/components/ui';
import { FontFamily } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, GlyphName> = {
  index: 'homeOutline',
  islemler: 'swap',
  yeni: 'plusCircle',
  profil: 'personOutline',
};

/**
 * Akbank tarzı sade alt bar: beyaz zemin, çizgisel ikonlar, aktif sekme renkli.
 * Seçilen ikon yaylanarak zıplar, renkler yumuşakça geçer.
 */
export function TabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  const t = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: t.surface, borderTopColor: t.border, paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const { options } = descriptors[route.key];
        const label = typeof options.title === 'string' ? options.title : route.name;

        const onPress = () => {
          tap();
          // "Ekle" sekmesi bir sayfa değil, ekleme ekranını açar
          if (route.name === 'yeni') {
            router.push('/ekle');
            return;
          }
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return <TabItem key={route.key} icon={ICONS[route.name] ?? 'more'} label={label} focused={focused} onPress={onPress} />;
      })}
    </View>
  );
}

function TabItem({ icon, label, focused, onPress }: { icon: GlyphName; label: string; focused: boolean; onPress: () => void }) {
  const t = useTheme();
  const progress = useSharedValue(focused ? 1 : 0);
  const bounce = useSharedValue(1);

  useEffect(() => {
    progress.set(withTiming(focused ? 1 : 0, { duration: 220 }));
    if (focused) bounce.set(withSequence(withSpring(1.22, { damping: 6, stiffness: 400 }), withSpring(1, { damping: 10, stiffness: 300 })));
  }, [focused, progress, bounce]);

  const muted = t.textMuted;
  const primary = t.primary;
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: bounce.get() }] }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], [muted, primary]),
  }));

  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label} style={styles.item}>
      <Animated.View style={iconStyle}>
        <Icon name={icon} size={27} color={focused ? t.primary : t.textMuted} />
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
});
