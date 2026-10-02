import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

import { HomeHeader, Page } from '@/components/headers';
import { ButceBody, ButceHero } from '@/components/home/butce';
import { GenelBody, GenelHero, type Bolum } from '@/components/home/genel';
import { HedeflerBody, HedeflerHero } from '@/components/home/hedefler';
import { OdemelerBody, OdemelerHero } from '@/components/home/odemeler';
import { SectionColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { upcomingBills } from '@/lib/selectors';
import { useBudget } from '@/store/budget';

const SECTIONS: { key: Bolum; label: string }[] = [
  { key: 'genel', label: 'Genel bakış' },
  { key: 'butce', label: 'Bütçe' },
  { key: 'odemeler', label: 'Ödemeler' },
  { key: 'hedefler', label: 'Hedefler' },
];

export default function Home() {
  const t = useTheme();
  const params = useLocalSearchParams<{ bolum?: Bolum }>();
  const bills = useBudget((s) => s.bills);

  const [bolum, setBolum] = useState<Bolum>(params.bolum ?? 'genel');
  // Bildirimden ya da başka sayfadan belirli bir bölümle gelindiğinde
  const [lastParam, setLastParam] = useState(params.bolum);
  if (params.bolum !== lastParam) {
    setLastParam(params.bolum);
    if (params.bolum) setBolum(params.bolum);
  }

  // Bölümler arası paylaşılan form durumları (renkli alandaki butonlar alttaki formu açar)
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [addingBill, setAddingBill] = useState(false);
  const [addingGoal, setAddingGoal] = useState(false);
  const [goalCustomFor, setGoalCustomFor] = useState<string | null>(null);

  const go = (b: Bolum) => setBolum(b);

  const color = useMemo(() => {
    const c = SectionColors[bolum];
    if (c === 'primary') return t.primary;
    if (bolum === 'hedefler' && t.scheme === 'dark') return '#3A3D46';
    return c;
  }, [bolum, t.primary, t.scheme]);

  // 3 gün içinde son günü gelen ödeme varsa zilde nokta
  const today = new Date().getDate();
  const hasAlert = upcomingBills(bills).some((b) => b.day - today <= 3);

  return (
    <Page
      header={
        <HomeHeader color={color} sections={SECTIONS} active={bolum} onChange={setBolum} hasAlert={hasAlert} onBell={() => setBolum('odemeler')}>
          {bolum === 'genel' ? <GenelHero go={go} /> : null}
          {bolum === 'butce' ? <ButceHero go={go} setEditing={setEditingLimit} /> : null}
          {bolum === 'odemeler' ? <OdemelerHero setAdding={setAddingBill} /> : null}
          {bolum === 'hedefler' ? <HedeflerHero setAdding={setAddingGoal} setCustomFor={setGoalCustomFor} /> : null}
        </HomeHeader>
      }>
      <Animated.View key={bolum} entering={FadeIn.duration(250)}>
        {bolum === 'genel' ? <GenelBody go={go} /> : null}
        {bolum === 'butce' ? <ButceBody editing={editingLimit} setEditing={setEditingLimit} /> : null}
        {bolum === 'odemeler' ? <OdemelerBody adding={addingBill} setAdding={setAddingBill} /> : null}
        {bolum === 'hedefler' ? (
          <HedeflerBody adding={addingGoal} setAdding={setAddingGoal} customFor={goalCustomFor} setCustomFor={setGoalCustomFor} />
        ) : null}
      </Animated.View>
    </Page>
  );
}
