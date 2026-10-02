import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { router } from 'expo-router';
import type { Tabs } from 'expo-router/js-tabs';
import { useEffect, useState, type ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon, type GlyphName } from '@/components/icon';
import { T, tap } from '@/components/ui';
import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, GlyphName> = {
  index: 'home',
  islemler: 'list',
  butce: 'chart',
  profil: 'person',
};

const BAR_HEIGHT = 68;
const SPRING = { damping: 18, stiffness: 220, mass: 0.8 };
const glass = Platform.OS === 'ios' && isLiquidGlassAvailable();

/** Ekranların altında bırakılması gereken boşluk (yüzen bar + kenar boşluğu). */
export const TAB_BAR_SPACE = BAR_HEIGHT + 48;

/**
 * Yüzen kapsül şeklinde alt bar. Aktif sekmenin arkasındaki vurgu
 * yaylı animasyonla kayar; ortadaki + butonu ekleme ekranını açar.
 */
export function TabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const slot = width / state.routes.length;
  const centerIndex = state.routes.findIndex((r) => r.name === 'yeni');

  const x = useSharedValue(0);
  useEffect(() => {
    if (slot) x.set(withSpring(state.index * slot, SPRING));
  }, [state.index, slot, x]);

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={[
          styles.bar,
          !glass && { backgroundColor: t.surface, borderColor: t.border },
          { shadowColor: t.scheme === 'dark' ? '#000' : t.primaryDeep },
        ]}>
        {glass ? <GlassView style={[StyleSheet.absoluteFill, { borderRadius: BAR_HEIGHT / 2 }]} glassEffectStyle="regular" /> : null}

        {slot > 0 && state.index !== centerIndex ? (
          <Animated.View
            style={[styles.indicator, { width: slot - 12, backgroundColor: t.primarySoft }, indicator]}
          />
        ) : null}

        {state.routes.map((route, i) => {
          const focused = state.index === i;

          if (route.name === 'yeni') {
            return <CenterButton key={route.key} />;
          }

          const { options } = descriptors[route.key];
          const label = typeof options.title === 'string' ? options.title : route.name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              tap();
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TabItem
              key={route.key}
              icon={ICONS[route.name] ?? 'more'}
              label={label}
              focused={focused}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({
  icon,
  label,
  focused,
  onPress,
  onLongPress,
}: {
  icon: GlyphName;
  label: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const t = useTheme();
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.set(withSpring(focused ? 1 : 0, SPRING));
  }, [focused, progress]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -4 * progress.get() }, { scale: 1 + 0.12 * progress.get() }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + 0.45 * progress.get(),
    transform: [{ translateY: 2 - 2 * progress.get() }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={styles.item}>
      <Animated.View style={iconStyle}>
        <Icon name={icon} size={24} color={focused ? t.primary : t.textMuted} />
      </Animated.View>
      <Animated.View style={labelStyle}>
        <T v="caption" color={focused ? t.primary : t.textMuted} style={{ fontWeight: focused ? '800' : '600' }} numberOfLines={1}>
          {label}
        </T>
      </Animated.View>
    </Pressable>
  );
}

function CenterButton() {
  const t = useTheme();
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }, { rotate: `${rotate.get()}deg` }],
  }));

  return (
    <View style={styles.item}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Yeni işlem ekle"
        onPressIn={() => {
          scale.set(withSpring(0.88, SPRING));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, SPRING));
        }}
        onPress={() => {
          tap();
          rotate.set(withSequence(withTiming(90, { duration: 180 }), withTiming(0, { duration: 0 })));
          router.push('/ekle');
        }}>
        <Animated.View
          style={[
            styles.fab,
            { backgroundColor: t.primary, shadowColor: t.primary },
            style,
          ]}>
          <Icon name="plus" color={t.onPrimary} size={28} />
        </Animated.View>
      </Pressable>
    </View>
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
    maxWidth: MaxContentWidth,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  indicator: {
    position: 'absolute',
    left: 6,
    top: 8,
    bottom: 8,
    borderRadius: 26,
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
