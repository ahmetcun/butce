import { StyleSheet, View } from 'react-native';

import { Icon, type GlyphName } from '@/components/icon';
import { Amount, RoundAction, Row, T, Touch } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useBudget } from '@/store/budget';

export type HeroAction = { icon: GlyphName; label: string; onPress: () => void };

/**
 * Renkli alanın içi (Akbank "TOPLAM BAKİYE" düzeni): ortalanmış etiket,
 * büyük tutar, açılır hap ve 4 yuvarlak işlem butonu.
 */
export function HeroSummary({
  label,
  value,
  pill,
  onPill,
  actions,
}: {
  label: string;
  value: number;
  pill?: { icon: GlyphName; text: string };
  onPill?: () => void;
  actions: HeroAction[];
}) {
  const hidden = useBudget((s) => s.settings.hideBalance);
  const updateSettings = useBudget((s) => s.updateSettings);

  return (
    <View style={{ alignItems: 'center' }}>
      <T v="label" color="rgba(255,255,255,0.92)" style={{ marginTop: Spacing.two }}>
        {label.toLocaleUpperCase('tr-TR')}
      </T>
      <Touch
        onPress={() => updateSettings({ hideBalance: !hidden })}
        pressScale={0.97}
        style={{ marginTop: 6 }}
        accessibilityLabel={hidden ? 'Tutarı göster' : 'Tutarı gizle'}>
        <Amount value={value} color="#fff" hidden={hidden} />
      </Touch>
      {pill ? (
        <Touch onPress={onPill} disabled={!onPill} style={styles.pill}>
          <View style={styles.pillIcon}>
            <Icon name={pill.icon} size={14} color="#fff" />
          </View>
          <T v="bodyBold" color="#fff" style={{ fontSize: 16 }}>
            {pill.text}
          </T>
          {onPill ? <Icon name="chevronDown" size={16} color="#fff" /> : null}
        </Touch>
      ) : null}
      <Row style={{ marginTop: Spacing.four, alignItems: 'flex-start', alignSelf: 'stretch' }}>
        {actions.map((a) => (
          <RoundAction key={a.label} icon={a.icon} label={a.label} onPress={a.onPress} onColor />
        ))}
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.three,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  pillIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
