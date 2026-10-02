import { View } from 'react-native';

import { IconBubble, Row, T, Touch } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dayLabel, formatMoney } from '@/lib/format';
import { useBudget, type Transaction } from '@/store/budget';

export function TransactionRow({ tx, onLongPress }: { tx: Transaction; onLongPress?: () => void }) {
  const t = useTheme();
  const category = useBudget((s) => s.categories.find((c) => c.id === tx.categoryId));
  const member = useBudget((s) => s.members.find((m) => m.id === tx.memberId));
  const income = tx.type === 'income';

  return (
    <Touch onLongPress={onLongPress} haptic={false} delayLongPress={400}>
      <Row style={{ gap: Spacing.three, paddingVertical: 10 }}>
        <IconBubble icon={category?.icon ?? 'more'} color={category?.color ?? t.textMuted} />
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
        <T v="bodyBold" color={income ? t.income : t.text}>
          {formatMoney(income ? tx.amount : -tx.amount, { sign: true })}
        </T>
      </Row>
    </Touch>
  );
}
