import { router } from 'expo-router';
import type { Tabs } from 'expo-router/js-tabs';
import { useEffect, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon, type GlyphName } from '@/components/icon';
import { tap } from '@/components/ui';
import { Base, Fast } from '@/constants/motion';
import { useTheme } from '@/hooks/use-theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, GlyphName> = {
  index: 'home',
  islemler: 'swap',
  yeni: 'plus',
  profil: 'person',
};

const SIZE = 58;

/** Sayfaların altında bırakılması gereken boşluk (yüzen butonlar + kenar boşluğu). */
export const TAB_BAR_SPACE = SIZE + 64;

/**
 * Ayrı ayrı yüzen yuvarlak butonlar. Aktif olan siyah dolar, ikon beyaza döner.
 * Yalnızca opaklık ve ölçek; 200 ms, sekme yok.
 */
export function TabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 14) }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const { options } = descriptors[route.key];
        const label = typeof options.title === 'string' ? options.title : route.name;

        const onPress = () => {
          tap();
          // "Ekle" bir sayfa değil, ekleme ekranını açar
          if (route.name === 'yeni') {
            router.push('/ekle');
            return;
          }
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return <TabCircle key={route.key} icon={ICONS[route.name] ?? 'more'} label={label} focused={focused} onPress={onPress} />;
      })}
    </View>
  );
}

function TabCircle({ icon, label, focused, onPress }: { icon: GlyphName; label: string; focused: boolean; onPress: () => void }) {
  const t = useTheme();
  const on = useSharedValue(focused ? 1 : 0);
  const press = useSharedValue(1);

  useEffect(() => {
    on.set(withTiming(focused ? 1 : 0, Base));
  }, [focused, on]);

  const circle = useAnimatedStyle(() => ({ transform: [{ scale: press.get() }] }));
  const fill = useAnimatedStyle(() => ({ opacity: on.get(), transform: [{ scale: 0.6 + 0.4 * on.get() }] }));
  const onIcon = useAnimatedStyle(() => ({ opacity: on.get() }));
  const offIcon = useAnimatedStyle(() => ({ opacity: 1 - on.get() }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => press.set(withTiming(0.9, Fast))}
      onPressOut={() => press.set(withTiming(1, Fast))}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}>
      <Animated.View
        style={[
          styles.circle,
          { backgroundColor: t.glass, borderColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' },
          circle,
        ]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.fill, { backgroundColor: t.ink }, fill]} />
        <Animated.View style={[styles.icon, offIcon]}>
          <Icon name={icon} size={24} color={t.text} weight="line" />
        </Animated.View>
        <Animated.View style={[styles.icon, onIcon]}>
          <Icon name={icon} size={24} color={t.onInk} weight="bold" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B2A1F',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fill: {
    borderRadius: SIZE / 2,
  },
  icon: {
    position: 'absolute',
  },
});
