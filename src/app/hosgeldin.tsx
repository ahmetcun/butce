import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type GlyphName } from '@/components/icon';
import { Row, T, Touch } from '@/components/ui';
import { enter } from '@/constants/motion';
import { Accents, FontFamily, MaxContentWidth, Radius, Spacing, type AccentKey } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { greeting } from '@/lib/format';
import { useBudget } from '@/store/budget';

const FEATURES: { icon: GlyphName; label: string }[] = [
  { icon: 'bolt', label: '3 dokunuşta\nharcama' },
  { icon: 'bellOutline', label: 'Fatura\nhatırlatma' },
  { icon: 'chart', label: 'Bütçe\nlimitleri' },
  { icon: 'target', label: 'Birikim\nhedefleri' },
];

/** İlk açılış. Akbank giriş ekranı düzeni: beyaz üst, renkli alt panel. */
export default function Welcome() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const accent = useBudget((s) => s.settings.accent);
  const updateSettings = useBudget((s) => s.updateSettings);
  const completeOnboarding = useBudget((s) => s.completeOnboarding);

  const [userName, setUserName] = useState('');
  const [familyName, setFamilyName] = useState('');

  const initials =
    userName
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR'))
      .join('') || '👋';

  const start = (demo: boolean) => completeOnboarding({ userName: userName.trim(), familyName: familyName.trim(), accent, demo });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.wrap, { paddingTop: insets.top + Spacing.five }]}>
          <Animated.View entering={enter} style={[styles.avatar, { backgroundColor: t.surfaceAlt }]}>
            <T style={{ fontSize: 32, fontFamily: FontFamily.semibold }} color={t.primary}>
              {initials}
            </T>
            <View style={[styles.avatarBadge, { backgroundColor: t.primary, borderColor: t.surface }]}>
              <Icon name="family" size={14} color="#fff" />
            </View>
          </Animated.View>

          <Animated.View entering={enter}>
            <T style={styles.hello}>{greeting()}</T>
            <T style={styles.hello} numberOfLines={1} adjustsFontSizeToFit>
              {userName.trim() || 'Aile Bütçem'}
            </T>
          </Animated.View>

          <Animated.View entering={enter} style={{ width: '100%', gap: 10, marginTop: Spacing.four }}>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="Adın (Örn: Ahmet Can)"
              placeholderTextColor={t.textMuted}
              style={[styles.input, { color: t.text, backgroundColor: t.surfaceAlt }]}
              returnKeyType="next"
            />
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="Aile adı (isteğe bağlı)"
              placeholderTextColor={t.textMuted}
              style={[styles.input, { color: t.text, backgroundColor: t.surfaceAlt }]}
            />
            <Row style={{ justifyContent: 'center', gap: 14, marginTop: 6 }}>
              {(Object.keys(Accents) as AccentKey[]).map((k) => (
                <Touch
                  key={k}
                  pressScale={0.85}
                  onPress={() => updateSettings({ accent: k })}
                  accessibilityLabel={Accents[k].name}
                  style={[styles.swatch, { backgroundColor: Accents[k].primary, borderColor: accent === k ? t.text : 'transparent' }]}>
                  {accent === k ? <Icon name="check" color="#fff" size={16} /> : null}
                </Touch>
              ))}
            </Row>
          </Animated.View>

          <Animated.View entering={enter} style={{ width: '100%', alignItems: 'center', marginTop: Spacing.four }}>
            <Touch onPress={() => start(true)} hitSlop={8}>
              <T v="bodyBold" color={t.primary} style={{ fontSize: 16 }}>
                Örnek verilerle göz at
              </T>
            </Touch>
            <Touch onPress={() => start(false)} style={[styles.button, { backgroundColor: t.primary }]}>
              <T v="heading" color="#fff">
                Başlayalım
              </T>
            </Touch>
          </Animated.View>
        </View>

        {/* Renkli alt panel: Akbank'taki FAST / QR / Fiyat ve Oranlar düzeni */}
        <Animated.View
          entering={enter}
          style={[styles.panel, { backgroundColor: t.primary, paddingBottom: insets.bottom + Spacing.three }]}>
          <Row style={{ alignItems: 'flex-start', width: '100%', maxWidth: MaxContentWidth }}>
            {FEATURES.map((f) => (
              <View key={f.label} style={{ flex: 1, alignItems: 'center', gap: 10 }}>
                <View style={styles.featureCircle}>
                  <Icon name={f.icon} size={26} color={t.primary} />
                </View>
                <T v="small" color="#fff" style={{ textAlign: 'center' }}>
                  {f.label}
                </T>
              </View>
            ))}
          </Row>
          <T v="small" color="rgba(255,255,255,0.85)" style={{ marginTop: Spacing.four }}>
            Veriler yalnızca bu cihazda saklanır
          </T>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hello: {
    fontSize: 38,
    lineHeight: 46,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: FontFamily.regular,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  panel: {
    alignItems: 'center',
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  featureCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
