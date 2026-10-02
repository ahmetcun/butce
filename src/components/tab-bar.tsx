import { router } from 'expo-router';
import type { Tabs } from 'expo-router/js-tabs';
import { useEffect, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Icon, type GlyphName } from '@/components/icon';
import { tap } from '@/components/ui';
import { FontFamily, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, GlyphName> = {
  index: 'home',
  islemler: 'swap',
  yeni: 'plusCircle',
  profil: 'person',
};

const BAR_HEIGHT = 68;
const PAD = 6;
const SPRING = { damping: 20, stiffness: 240, mass: 0.7 };

/** Sayfaların altında bırakılması gereken boşluk (yüzen bar + kenar boşluğu). */
export const TAB_BAR_SPACE = BAR_HEIGHT + 56;

/**
 * Ekranın altında yüzen kapsül bar. Aktif sekmenin arkasındaki renkli hap
 * yaylanarak kayar. Animasyonlar yalnızca transform ve renkle yapılır
 * (UI thread'de çalışır, JS'i meşgul etmez).
 */
export function TabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const slot = (width - PAD * 2) / state.routes.length;

  const x = useSharedValue(0);
  useEffect(() => {
    if (slot > 0) x.set(withSpring(state.index * slot, SPRING));
  }, [state.index, slot, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 14) }]}>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={[
          styles.bar,
          {
            backgroundColor: t.surface,
            borderColor: t.border,
            shadowColor: t.scheme === 'dark' ? '#000' : t.primaryDeep,
          },
        ]}>
        {slot > 0 ? <Animated.View style={[styles.pill, { width: slot, backgroundColor: t.primary }, pill]} /> : null}

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

          return <TabItem key={route.key} icon={ICONS[route.name] ?? 'more'} label={label} focused={focused} onPress={onPress} />;
        })}
      </View>
    </View>
  );
}

function TabItem({ icon, label, focused, onPress }: { icon: GlyphName; label: string; focused: boolean; onPress: () => void }) {
  const t = useTheme();
  const progress = useSharedValue(focused ? 1 : 0);
  const pressed = useSharedValue(1);

  useEffect(() => {
    progress.set(withTiming(focused ? 1 : 0, { duration: 200 }));
  }, [focused, progress]);

  const muted = t.textMuted;
  const content = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.get() * (1 + 0.06 * progress.get()) }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], [muted, '#FFFFFF']),
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => pressed.set(withSpring(0.88, SPRING))}
      onPressOut={() => pressed.set(withSpring(1, SPRING))}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={styles.item}>
      <Animated.View style={[styles.itemInner, content]}>
        <Icon name={icon} size={25} color={focused ? '#FFFFFF' : t.textMuted} weight={focused ? 'fill' : 'duotone'} />
        <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: MaxContentWidth - 32,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  pill: {
    position: 'absolute',
    left: PAD,
    top: PAD,
    bottom: PAD,
    borderRadius: (BAR_HEIGHT - PAD * 2) / 2,
  },
  item: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  itemInner: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
  },
});
