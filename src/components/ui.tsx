import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';

import { Icon, type GlyphName } from '@/components/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync();
}

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyBold' | 'small' | 'caption';

const variants = StyleSheet.create({
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' },
  heading: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15 },
  bodyBold: { fontSize: 15, fontWeight: '600' },
  small: { fontSize: 13 },
  caption: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
});

export function T({
  v = 'body',
  muted,
  color,
  style,
  ...props
}: TextProps & { v?: Variant; muted?: boolean; color?: string }) {
  const t = useTheme();
  return <Text {...props} style={[variants[v], { color: color ?? (muted ? t.textMuted : t.text) }, style]} />;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }, style]}>{children}</View>
  );
}

/** Basınca hafifçe küçülen, titreşimli dokunma alanı. */
export function Touch({ style, onPress, haptic = true, ...props }: PressableProps & { haptic?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      {...props}
      onPress={(e) => {
        if (haptic) tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [style, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
    />
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const t = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <T v="heading">{title}</T>
      {action ? (
        <Touch onPress={onAction} hitSlop={10}>
          <T v="small" color={t.primary} style={{ fontWeight: '600' }}>
            {action}
          </T>
        </Touch>
      ) : null}
    </View>
  );
}

export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  const barColor = color ?? (value >= 1 ? t.expense : value >= 0.8 ? t.warning : t.primary);
  return (
    <View style={{ height, borderRadius: height, backgroundColor: t.surfaceAlt, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: height, backgroundColor: barColor }} />
    </View>
  );
}

export function IconBubble({ icon, color, size = 40 }: { icon: GlyphName; color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2.6,
        backgroundColor: color + '22',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon name={icon} color={color} size={size * 0.5} />
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  leading,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leading?: ReactNode;
}) {
  const t = useTheme();
  return (
    <Touch
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? t.primary : t.surface,
          borderColor: selected ? t.primary : t.border,
        },
      ]}>
      {leading}
      <T v="small" color={selected ? t.onPrimary : t.text} style={{ fontWeight: '600' }}>
        {label}
      </T>
    </Touch>
  );
}

export function EmptyState({ icon, text }: { icon: GlyphName; text: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: Spacing.four, gap: Spacing.two }}>
      <Icon name={icon} size={32} color={t.textMuted} />
      <T v="small" muted style={{ textAlign: 'center' }}>
        {text}
      </T>
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
    marginTop: Spacing.four,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
