import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { IconBubble, Row, T, Touch } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dayLabel, formatMoney } from '@/lib/format';
import { useBudget, type Transaction } from '@/store/budget';

/**
 * İşlem satırı. `card` verilirse kendi başına yuvarlak beyaz kart olur
 * (kategori renginde dolu daire + beyaz ikon).
 */
export function TransactionRow({ tx, onLongPress, card }: { tx: Transaction; onLongPress?: () => void; card?: boolean }) {
  const t = useTheme();
  const category = useBudget((s) => s.categories.find((c) => c.id === tx.categoryId));
  const member = useBudget((s) => s.members.find((m) => m.id === tx.memberId));
  const income = tx.type === 'income';
  const color = category?.color ?? t.textMuted;

  return (
    <Touch onLongPress={onLongPress} haptic={false} delayLongPress={400} pressScale={card ? 0.98 : 1}>
      <Row
        style={[
          { gap: Spacing.three, paddingVertical: 10 },
          card && [styles.card, { backgroundColor: t.surface, shadowOpacity: t.scheme === 'dark' ? 0 : 0.06 }],
        ]}>
        {card ? (
          <View style={[styles.avatar, { backgroundColor: color + '1F' }]}>
            <Icon name={category?.icon ?? 'more'} size={22} color={color} />
          </View>
        ) : (
          <IconBubble icon={category?.icon ?? 'more'} color={color} />
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <T v="bodyBold" numberOfLines={1}>
            {tx.note || category?.name || 'İşlem'}
          </T>
          <T v="small" muted numberOfLines={1}>
            {[tx.note ? category?.name : null, member ? `${member.emoji} ${member.name}` : null, dayLabel(tx.date)]
              .filter(Boolean)
              .join(' · ')}
          </T>
        </View>
        {/* Giderler nötr, yalnızca gelir renkli: listede kırmızı kalabalığı olmasın */}
        <T v="bodyBold" color={income ? t.income : t.text}>
          {formatMoney(income ? tx.amount : -tx.amount, { sign: true })}
        </T>
      </Row>
    </Touch>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 22,
    shadowColor: '#1B2A1F',
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
