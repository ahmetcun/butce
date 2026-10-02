import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon } from '@/components/icon';
import { tap } from '@/components/ui';
import { Base, Fast } from '@/constants/motion';
import { useTheme } from '@/hooks/use-theme';


type Positions = Record<string, number>;

function toPositions(keys: string[]): Positions {
  'worklet';
  const p: Positions = {};
  keys.forEach((k, i) => (p[k] = i));
  return p;
}

/**
 * Sabit yükseklikli satırları parmakla sürükleyerek sıralamaya yarayan liste.
 * Sürükleme yalnızca `renderItem`'e verilen tutamaçtan (handle) başlar,
 * böylece sayfa kaydırma ve satırdaki diğer düğmeler etkilenmez.
 */
export function SortableList<T extends { key: string }>({
  data,
  rowHeight,
  renderItem,
  onReorder,
}: {
  data: T[];
  rowHeight: number;
  renderItem: (item: T, handle: ReactNode, index: number) => ReactNode;
  onReorder: (keys: string[]) => void;
}) {
  const keys = data.map((d) => d.key);
  const orderKey = keys.join('|');
  const positions = useSharedValue<Positions>(toPositions(keys));

  // Sıra dışarıdan değişirse (ör. sıfırlama) konumları eşitle
  useEffect(() => {
    positions.set(toPositions(orderKey.split('|')));
  }, [orderKey, positions]);

  return (
    <View style={{ height: data.length * rowHeight }}>
      {data.map((item, i) => (
        <SortableItem
          key={item.key}
          id={item.key}
          count={data.length}
          rowHeight={rowHeight}
          positions={positions}
          onDrop={onReorder}
          render={(handle) => renderItem(item, handle, i)}
        />
      ))}
    </View>
  );
}

function SortableItem({
  id,
  count,
  rowHeight,
  positions,
  onDrop,
  render,
}: {
  id: string;
  count: number;
  rowHeight: number;
  positions: SharedValue<Positions>;
  onDrop: (keys: string[]) => void;
  render: (handle: ReactNode) => ReactNode;
}) {
  const t = useTheme();
  const top = useSharedValue(positions.get()[id] * rowHeight);
  const startTop = useSharedValue(0);
  const dragging = useSharedValue(false);

  // Başka bir satır sürüklenirken bu satır yeni yerine kayar
  useAnimatedReaction(
    () => positions.get()[id],
    (cur, prev) => {
      if (cur !== prev && !dragging.get()) top.set(withTiming(cur * rowHeight, Base));
    },
  );

  const pan = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      dragging.set(true);
      startTop.set(top.get());
      scheduleOnRN(tap);
    })
    .onUpdate((e) => {
      const max = (count - 1) * rowHeight;
      top.set(Math.min(Math.max(startTop.get() + e.translationY, 0), max));
      const next = Math.round(top.get() / rowHeight);
      const cur = positions.get()[id];
      if (next !== cur) {
        const swapped = { ...positions.get() };
        for (const k in swapped) {
          if (swapped[k] === next) swapped[k] = cur;
        }
        swapped[id] = next;
        positions.set(swapped);
        scheduleOnRN(tap);
      }
    })
    .onFinalize(() => {
      if (!dragging.get()) return;
      dragging.set(false);
      top.set(withTiming(positions.get()[id] * rowHeight, Base));
      const ordered = Object.keys(positions.get()).sort((a, b) => positions.get()[a] - positions.get()[b]);
      scheduleOnRN(onDrop, ordered);
    });

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    right: 0,
    height: rowHeight,
    top: top.get(),
    zIndex: dragging.get() ? 10 : 0,
    transform: [{ scale: withTiming(dragging.get() ? 1.02 : 1, Fast) }],
    shadowOpacity: withTiming(dragging.get() ? 0.18 : 0, Fast),
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: dragging.get() ? 8 : 0,
  }));

  const handle = (
    <GestureDetector gesture={pan}>
      <View hitSlop={12} style={{ padding: 6 }} accessibilityLabel="Sürükleyerek sırala">
        <Icon name="grip" color={t.textMuted} size={22} />
      </View>
    </GestureDetector>
  );

  return <Animated.View style={style}>{render(handle)}</Animated.View>;
}
