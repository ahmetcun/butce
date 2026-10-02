import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Akbank tarzı sayfa iskeleti: üstte ana renkte bir başlık bandı,
 * altında içerik. `overlap` verilirse içerik bandın üzerine biner.
 */
export function Screen({
  title,
  subtitle,
  right,
  hero,
  overlap = 0,
  children,
  refreshControl,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  hero?: ReactNode;
  overlap?: number;
  children: ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <ScrollView
        refreshControl={refreshControl}
        contentContainerStyle={{ paddingBottom: Spacing.six }}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.header,
            { backgroundColor: t.primary, paddingTop: insets.top + Spacing.three, paddingBottom: Spacing.four + overlap },
          ]}>
          <View style={styles.inner}>
            {title ? (
              <View style={styles.titleRow}>
                <View style={{ flex: 1 }}>
                  {subtitle ? (
                    <T v="small" color="rgba(255,255,255,0.8)">
                      {subtitle}
                    </T>
                  ) : null}
                  <T v="title" color="#fff">
                    {title}
                  </T>
                </View>
                {right}
              </View>
            ) : null}
            {hero}
          </View>
        </View>
        <View style={[styles.inner, { marginTop: -overlap, paddingHorizontal: Spacing.three }]}>{children}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.three,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
