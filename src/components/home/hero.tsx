import { StyleSheet, View } from 'react-native';

import { useHeroColor } from '@/components/headers';
import { Icon, type GlyphName } from '@/components/icon';
import { Amount, Row, T, Touch } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useBudget } from '@/store/budget';

export type HeroAction = { icon: GlyphName; label: string; onPress: () => void };

/**
 * Renkli alanın içi: küçük etiket, büyük tutar, bilgi hapı ve
 * 4 işlem butonu (ilki beyaz ve öne çıkan, diğerleri buzlu cam).
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
    <View>
      <View style={{ alignItems: 'center', marginTop: Spacing.four }}>
        <T v="body" color="rgba(255,255,255,0.85)">
          {label}
        </T>
        <Touch
          onPress={() => updateSettings({ hideBalance: !hidden })}
          pressScale={0.98}
          style={{ marginTop: 2 }}
          accessibilityLabel={hidden ? 'Tutarı göster' : 'Tutarı gizle'}>
          <Amount value={value} color="#fff" hidden={hidden} />
        </Touch>
        {pill ? (
          <Touch onPress={onPill} disabled={!onPill} style={styles.pill}>
            <Icon name={pill.icon} size={15} color="#fff" weight="line" />
            <T v="small" color="#fff" style={{ fontSize: 13.5 }}>
              {pill.text}
            </T>
            {onPill ? <Icon name="chevronDown" size={13} color="#fff" /> : null}
          </Touch>
        ) : null}
      </View>

      <Row style={{ marginTop: Spacing.four, alignItems: 'flex-start' }}>
        {actions.map((a, i) => (
          <ActionTile key={a.label} {...a} primary={i === 0} />
        ))}
      </Row>
    </View>
  );
}

/** Dış kutu yok: yalnızca ikon kutucuğu ve altında etiket. İlki beyaz kutucukla öne çıkar. */
function ActionTile({ icon, label, onPress, primary }: HeroAction & { primary?: boolean }) {
  const color = useHeroColor();
  return (
    <Touch onPress={onPress} pressScale={0.92} style={styles.action} accessibilityLabel={label}>
      <View style={[styles.actionIcon, primary ? styles.actionIconPrimary : styles.actionIconGlass]}>
        <Icon name={icon} size={24} color={primary ? color : '#fff'} weight={primary ? 'bold' : 'duotone'} />
      </View>
      <T v="caption" color="#fff" style={{ fontSize: 12.5, textAlign: 'center' }} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </T>
    </Touch>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconPrimary: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  actionIconGlass: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
