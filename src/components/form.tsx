import { StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native';

import { T, Touch } from '@/components/ui';
import { FontFamily, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function TextField({
  value,
  onChange,
  placeholder,
  autoFocus,
  keyboardType,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  style?: StyleProp<TextStyle>;
}) {
  const t = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={t.textMuted}
      autoFocus={autoFocus}
      keyboardType={keyboardType}
      style={[styles.input, { color: t.text, backgroundColor: t.surfaceAlt }, style]}
    />
  );
}

/** Yalnızca rakam ve virgül kabul eden tutar alanı. */
export function MoneyInput(props: { value: string; onChange: (v: string) => void; placeholder: string; autoFocus?: boolean }) {
  return (
    <TextField
      {...props}
      onChange={(v) => props.onChange(v.replace(/[^0-9,]/g, ''))}
      keyboardType="decimal-pad"
      style={{ flex: 1 }}
    />
  );
}

export function parseMoney(v: string) {
  return Number(v.replace(',', '.')) || 0;
}

/** Hap şeklinde buton: siyah dolu ya da çerçeveli. */
export function PillButton({ label, onPress, outline }: { label: string; onPress: () => void; outline?: boolean }) {
  const t = useTheme();
  return (
    <Touch
      onPress={onPress}
      style={[
        styles.btn,
        outline ? { borderWidth: 1.5, borderColor: t.ink, backgroundColor: 'transparent' } : { backgroundColor: t.ink },
      ]}>
      <T v="bodyBold" color={outline ? t.ink : t.onInk}>
        {label}
      </T>
    </Touch>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FontFamily.regular,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
