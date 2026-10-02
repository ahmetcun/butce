import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeOutUp, LinearTransition, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Icon, type GlyphName } from '@/components/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { splitMoney } from '@/lib/format';

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync();
}

/* ------------------------------ Metin ------------------------------ */

type Variant = 'hero' | 'display' | 'title' | 'heading' | 'body' | 'bodyBold' | 'small' | 'label' | 'caption';

const variants = StyleSheet.create({
  hero: { fontSize: 46, fontFamily: FontFamily.semibold, letterSpacing: -1 },
  display: { fontSize: 32, fontFamily: FontFamily.semibold, letterSpacing: -0.5 },
  title: { fontSize: 22, fontFamily: FontFamily.semibold },
  heading: { fontSize: 17, fontFamily: FontFamily.medium },
  body: { fontSize: 15, fontFamily: FontFamily.regular },
  bodyBold: { fontSize: 15, fontFamily: FontFamily.medium },
  small: { fontSize: 13, fontFamily: FontFamily.regular },
  /** Akbank'taki "TOPLAM BAKİYE", "ÖNERİLEN HIZLI İŞLEMLER" gibi etiketler */
  label: { fontSize: 12, fontFamily: FontFamily.medium, letterSpacing: 1.6 },
  caption: { fontSize: 11, fontFamily: FontFamily.medium, letterSpacing: 0.3 },
});

/** fontWeight verilirse Lexend'in ilgili ağırlığına çevir (Android özel fontta fontWeight'i yok sayar). */
function weightToFamily(w: TextStyle['fontWeight']) {
  if (w === undefined) return undefined;
  const n = typeof w === 'number' ? w : w === 'bold' ? 700 : w === 'normal' ? 400 : Number(w);
  if (n >= 700) return FontFamily.bold;
  if (n >= 600) return FontFamily.semibold;
  if (n >= 500) return FontFamily.medium;
  return FontFamily.regular;
}

export function T({
  v = 'body',
  muted,
  color,
  style,
  ...props
}: TextProps & { v?: Variant; muted?: boolean; color?: string }) {
  const t = useTheme();
  const flat = StyleSheet.flatten(style) ?? {};
  const family = weightToFamily(flat.fontWeight);
  return (
    <Text
      {...props}
      style={[
        variants[v],
        { color: color ?? (muted ? t.textMuted : t.text) },
        flat,
        family ? { fontFamily: family, fontWeight: undefined } : null,
      ]}
    />
  );
}

/* ------------------------------ Kutular ------------------------------ */

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.surface, shadowOpacity: t.scheme === 'dark' ? 0 : 0.06 },
        style,
      ]}>
      {children}
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

/* ------------------------------ Dokunma ------------------------------ */

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_SPRING = { damping: 15, stiffness: 300 };

/** Basınca yaylanarak küçülen, titreşimli dokunma alanı. */
export function Touch({
  style,
  onPress,
  haptic = true,
  pressScale = 0.96,
  ...props
}: PressableProps & { haptic?: boolean; pressScale?: number; style?: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <AnimatedPressable
      {...props}
      onPressIn={(e) => {
        scale.set(withSpring(pressScale, PRESS_SPRING));
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, PRESS_SPRING));
        props.onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) tap();
        onPress?.(e);
      }}
      style={[style, animated]}
    />
  );
}

/* ------------------------------ Akbank parçaları ------------------------------ */

/** Gri, büyük harfli, harf aralıklı bölüm etiketi. */
export function SectionLabel({ children, action, onAction }: { children: string; action?: string; onAction?: () => void }) {
  const t = useTheme();
  return (
    <Row style={styles.sectionLabel}>
      <T v="label" muted style={{ flex: 1 }}>
        {children.toLocaleUpperCase('tr-TR')}
      </T>
      {action ? (
        <Touch onPress={onAction} hitSlop={10}>
          <T v="small" color={t.primary} style={{ fontWeight: '500' }}>
            {action}
          </T>
        </Touch>
      ) : null}
    </Row>
  );
}

/** "Vadesiz Hesap   1 hesap ›" başlıklı beyaz kart. */
export function ListCard({
  title,
  meta,
  onPress,
  children,
  style,
}: {
  title: string;
  meta?: string;
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Card style={[{ paddingVertical: 0 }, style]}>
      <Touch onPress={onPress} disabled={!onPress} pressScale={0.99} haptic={!!onPress}>
        <Row style={{ paddingVertical: 18, gap: Spacing.two }}>
          <T v="heading" style={{ flex: 1 }}>
            {title}
          </T>
          {meta ? (
            <T v="body" muted>
              {meta}
            </T>
          ) : null}
          {onPress ? (
            <View style={[styles.chevron, { backgroundColor: t.surfaceAlt }]}>
              <Icon name="chevronRight" size={14} color={t.text} />
            </View>
          ) : null}
        </Row>
      </Touch>
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border }} />
      <View style={{ paddingVertical: Spacing.two }}>{children}</View>
    </Card>
  );
}

/** Yuvarlak işlem butonu. Renkli alanda yarı saydam, gri zeminde beyaz. */
export function RoundAction({
  icon,
  label,
  onPress,
  onColor,
  badge,
}: {
  icon: GlyphName;
  label: string;
  onPress: () => void;
  onColor?: boolean;
  badge?: string;
}) {
  const t = useTheme();
  return (
    <Touch onPress={onPress} pressScale={0.9} style={styles.roundAction} accessibilityLabel={label}>
      <View
        style={[
          styles.roundCircle,
          onColor
            ? { backgroundColor: 'rgba(255,255,255,0.18)' }
            : { backgroundColor: t.surface, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
        ]}>
        <Icon name={icon} size={24} color={onColor ? '#fff' : t.primary} />
        {badge ? (
          <View style={[styles.badge, { backgroundColor: t.primary }]}>
            <T v="caption" color="#fff">
              {badge}
            </T>
          </View>
        ) : null}
      </View>
      <T v="small" color={onColor ? '#fff' : t.textMuted} style={{ textAlign: 'center', fontWeight: onColor ? '500' : '400' }} numberOfLines={2}>
        {label}
      </T>
    </Touch>
  );
}

/** Değer değişince eski değerden yenisine sayarak ilerler. */
function useCountUp(value: number, duration = 700) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    const t0 = Date.now();
    let raf = 0;
    const step = () => {
      const p = Math.min(1, (Date.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = start + (value - start) * eased;
      setShown(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return shown;
}

/** "65,80 TL": tam kısım kalın, küsurat ve TL soluk. */
export function Amount({
  value,
  size = 46,
  color,
  hidden,
  animate = true,
  sign,
}: {
  value: number;
  size?: number;
  color?: string;
  hidden?: boolean;
  animate?: boolean;
  sign?: boolean;
}) {
  const t = useTheme();
  const counted = useCountUp(value);
  const v = animate ? counted : value;
  const c = color ?? t.text;
  const { int, frac } = splitMoney(v);
  const prefix = sign && value > 0 ? '+' : '';
  return (
    <Text style={{ color: c, fontFamily: FontFamily.semibold, fontSize: size, letterSpacing: size > 30 ? -1 : 0 }} numberOfLines={1} adjustsFontSizeToFit>
      {hidden ? '•••••' : prefix + int}
      <Text style={{ fontSize: size * 0.7, opacity: 0.55 }}>
        {hidden ? '' : frac} TL
      </Text>
    </Text>
  );
}

/** Beyaz, gölgeli, hap şeklinde arama çubuğu. */
export function SearchPill({ placeholder = 'Ara', onPress }: { placeholder?: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Touch onPress={onPress} pressScale={0.98} style={[styles.search, { backgroundColor: t.surface }]}>
      <Icon name="search" size={22} color={t.text} />
      <T v="body" muted style={{ fontSize: 16 }}>
        {placeholder}
      </T>
    </Touch>
  );
}

/** Nane yeşili, kapatılabilir öneri bandı. */
export function PromoBanner({
  icon,
  text,
  action,
  onPress,
  onClose,
}: {
  icon: GlyphName;
  text: string;
  action?: string;
  onPress?: () => void;
  onClose: () => void;
}) {
  const t = useTheme();
  return (
    <Animated.View exiting={FadeOutUp.duration(250)} layout={LinearTransition}>
      <Touch onPress={onPress} pressScale={0.98} style={[styles.promo, { backgroundColor: t.promo }]}>
        <View style={[styles.promoIcon, { backgroundColor: t.surface, borderColor: t.promoText + '33' }]}>
          <Icon name={icon} size={22} color={t.promoText} />
        </View>
        <T v="body" color={t.promoText} style={{ flex: 1, lineHeight: 21 }}>
          {text}
          {action ? (
            <T v="body" color={t.promoText} style={{ fontWeight: '600', textDecorationLine: 'underline' }}>
              {' '}
              {action}
            </T>
          ) : null}
        </T>
        <Touch onPress={onClose} hitSlop={12} accessibilityLabel="Kapat">
          <Icon name="close" size={22} color={t.promoText} />
        </Touch>
      </Touch>
    </Animated.View>
  );
}

/** Açılışta ve değer değişince yumuşakça dolan çubuk. */
export function ProgressBar({ value, color, height = 6 }: { value: number; color?: string; height?: number }) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  const barColor = color ?? (value >= 1 ? t.expense : value >= 0.8 ? t.warning : t.primary);
  const w = useSharedValue(0);
  useEffect(() => {
    w.set(withTiming(pct, { duration: 700 }));
  }, [pct, w]);
  const animated = useAnimatedStyle(() => ({ width: `${w.get() * 100}%` }));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: t.surfaceAlt, overflow: 'hidden' }}>
      <Animated.View style={[{ height: '100%', borderRadius: height, backgroundColor: barColor }, animated]} />
    </View>
  );
}

/** Akbank'taki hesap logosu gibi yuvarlak ikon. */
export function IconBubble({ icon, color, size = 44 }: { icon: GlyphName; color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color + '1F',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon name={icon} color={color} size={size * 0.48} />
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
      pressScale={0.93}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? t.primary : t.surface,
          borderColor: selected ? t.primary : t.border,
        },
      ]}>
      {leading}
      <T v="small" color={selected ? t.onPrimary : t.text} style={{ fontWeight: '500' }}>
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

/** Satır sonundaki "…" butonu. */
export function DotsButton({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  return (
    <Touch onPress={onPress} hitSlop={8} style={[styles.dots, { borderColor: t.border }]} accessibilityLabel="Diğer işlemler">
      <Icon name="dots" size={18} color={t.text} />
    </Touch>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: Spacing.three,
    shadowColor: '#000',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionLabel: {
    marginTop: Spacing.four,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundAction: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  roundCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 50,
    borderRadius: Radius.pill,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: Radius.md,
  },
  promoIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-4deg' }],
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
  dots: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
