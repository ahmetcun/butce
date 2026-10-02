import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Row, T, Touch } from '@/components/ui';
import { Accents, MaxContentWidth, Radius, Spacing, type AccentKey } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBudget } from '@/store/budget';

export default function Welcome() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const accent = useBudget((s) => s.settings.accent);
  const updateSettings = useBudget((s) => s.updateSettings);
  const completeOnboarding = useBudget((s) => s.completeOnboarding);

  const [userName, setUserName] = useState('');
  const [familyName, setFamilyName] = useState('');

  const start = (demo: boolean) =>
    completeOnboarding({ userName: userName.trim(), familyName: familyName.trim(), accent, demo });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.primary }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.wrap, { paddingTop: insets.top + Spacing.five, paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Icon name="family" color={t.primary} size={36} />
        </View>
        <T v="display" color="#fff" style={{ marginTop: Spacing.four }}>
          Aile Bütçem
        </T>
        <T v="body" color="rgba(255,255,255,0.85)" style={{ marginTop: Spacing.two, lineHeight: 22 }}>
          Harcamalarınızı saniyeler içinde girin, ödemeleri unutmayın, ailece birikim hedeflerinize ulaşın.
        </T>

        <View style={{ gap: Spacing.two, marginTop: Spacing.five }}>
          <T v="caption" color="rgba(255,255,255,0.8)">
            ADIN
          </T>
          <TextInput
            value={userName}
            onChangeText={setUserName}
            placeholder="Örn: Ahmet"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.input}
            returnKeyType="next"
          />
          <T v="caption" color="rgba(255,255,255,0.8)" style={{ marginTop: Spacing.two }}>
            AİLE ADI (İSTEĞE BAĞLI)
          </T>
          <TextInput
            value={familyName}
            onChangeText={setFamilyName}
            placeholder="Örn: Yılmaz"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.input}
          />

          <T v="caption" color="rgba(255,255,255,0.8)" style={{ marginTop: Spacing.two }}>
            RENGİNİ SEÇ
          </T>
          <Row style={{ gap: Spacing.three }}>
            {(Object.keys(Accents) as AccentKey[]).map((k) => (
              <Touch
                key={k}
                onPress={() => updateSettings({ accent: k })}
                accessibilityLabel={Accents[k].name}
                style={[styles.swatch, { backgroundColor: Accents[k].primary, borderColor: accent === k ? '#fff' : 'rgba(255,255,255,0.3)' }]}>
                {accent === k ? <Icon name="check" color="#fff" size={18} /> : null}
              </Touch>
            ))}
          </Row>
        </View>

        <View style={{ gap: Spacing.two, marginTop: Spacing.five }}>
          <Touch onPress={() => start(false)} style={[styles.btn, { backgroundColor: '#fff' }]}>
            <T v="heading" color={t.primary}>
              Başlayalım
            </T>
          </Touch>
          <Touch onPress={() => start(true)} style={[styles.btn, { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)' }]}>
            <T v="bodyBold" color="#fff">
              Örnek verilerle göz at
            </T>
          </Touch>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
