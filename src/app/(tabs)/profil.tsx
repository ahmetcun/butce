import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';

import { PillButton } from '@/components/form';
import { Page, PageHeader } from '@/components/headers';
import { Icon } from '@/components/icon';
import { SortableList } from '@/components/sortable-list';
import { Card, Chip, Row, SectionLabel, T, Touch } from '@/components/ui';
import { Accents, FontFamily, Radius, Spacing, type AccentKey } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/lib/confirm';
import { remindersSupported, requestReminderPermission } from '@/lib/reminders';
import { HomeSectionNames, useBudget, type HomeSectionKey } from '@/store/budget';

const SECTION_ROW = 56;
const MEMBER_EMOJIS = ['🙂', '💐', '🧔', '👩', '🧒', '👧', '👦', '👵', '👴', '🐶'];

export default function Profile() {
  const t = useTheme();
  const settings = useBudget((s) => s.settings);
  const updateSettings = useBudget((s) => s.updateSettings);
  const reorderHomeSections = useBudget((s) => s.reorderHomeSections);
  const toggleHomeSection = useBudget((s) => s.toggleHomeSection);
  const resetAll = useBudget((s) => s.resetAll);
  const [permissionDenied, setPermissionDenied] = useState(false);

  return (
    <Page header={<PageHeader title="Profil" />}>
      <FamilyStories />

      {/* Akbank "Aracım / Evim" kartları gibi kesik çizgili kart */}
      <Animated.View entering={FadeInDown.delay(100).springify().damping(18)} style={[styles.dashed, { borderColor: t.border, backgroundColor: t.surface }]}>
        <T v="title" style={{ fontSize: 20 }}>
          Bilgilerin
        </T>
        <T v="body" muted style={{ marginBottom: Spacing.two }}>
          Ana sayfadaki selamlamada görünür.
        </T>
        <TextInput
          value={settings.userName}
          onChangeText={(v) => updateSettings({ userName: v })}
          placeholder="Adın"
          placeholderTextColor={t.textMuted}
          style={[styles.input, { color: t.text, backgroundColor: t.surfaceAlt }]}
        />
        <TextInput
          value={settings.familyName}
          onChangeText={(v) => updateSettings({ familyName: v })}
          placeholder="Aile adı (Örn: Yılmaz)"
          placeholderTextColor={t.textMuted}
          style={[styles.input, { color: t.text, backgroundColor: t.surfaceAlt }]}
        />
      </Animated.View>

      <SectionLabel>Görünüm</SectionLabel>
      <Card style={{ gap: Spacing.three }}>
        <T v="small" muted>
          Uygulama rengi
        </T>
        <Row style={{ justifyContent: 'space-between' }}>
          {(Object.keys(Accents) as AccentKey[]).map((k) => {
            const sel = settings.accent === k;
            return (
              <Touch key={k} pressScale={0.88} onPress={() => updateSettings({ accent: k })} style={{ alignItems: 'center', gap: 6 }}>
                <View style={[styles.swatch, { backgroundColor: Accents[k].primary, borderColor: sel ? t.text : 'transparent' }]}>
                  {sel ? (
                    <Animated.View entering={ZoomIn.springify()}>
                      <Icon name="check" color="#fff" size={18} />
                    </Animated.View>
                  ) : null}
                </View>
                <T v="caption" muted={!sel}>
                  {Accents[k].name}
                </T>
              </Touch>
            );
          })}
        </Row>
        <T v="small" muted>
          Tema
        </T>
        <Row style={{ gap: 6 }}>
          {(
            [
              ['system', 'Sistem'],
              ['light', 'Açık'],
              ['dark', 'Koyu'],
            ] as const
          ).map(([k, label]) => (
            <Chip key={k} label={label} selected={settings.themeMode === k} onPress={() => updateSettings({ themeMode: k })} />
          ))}
        </Row>
        <Row style={{ justifyContent: 'space-between', gap: Spacing.three }}>
          <View style={{ flex: 1 }}>
            <T v="bodyBold">Tutarları gizle</T>
            <T v="small" muted>
              Bakiyeler ••••• görünür. Tutara dokunarak da açıp kapatabilirsin.
            </T>
          </View>
          <Switch value={settings.hideBalance} onValueChange={(v) => updateSettings({ hideBalance: v })} trackColor={{ true: t.primary }} />
        </Row>
      </Card>

      <SectionLabel>Bildirimler</SectionLabel>
      <Card style={{ gap: Spacing.three }}>
        <Row style={{ justifyContent: 'space-between', gap: Spacing.three }}>
          <View style={{ flex: 1 }}>
            <T v="bodyBold">Ödeme hatırlatmaları</T>
            <T v="small" muted>
              {!remindersSupported
                ? 'Bildirimler yalnızca telefonda çalışır.'
                : permissionDenied
                  ? 'İzin kapalı. Telefonun Ayarlar > Bildirimler kısmından aç.'
                  : 'Faturaların son gününden önce ve son gün haber verir.'}
            </T>
          </View>
          <Switch
            disabled={!remindersSupported}
            value={settings.billReminders}
            trackColor={{ true: t.primary }}
            onValueChange={async (on) => {
              if (!on) return updateSettings({ billReminders: false });
              const ok = await requestReminderPermission();
              setPermissionDenied(!ok);
              if (ok) updateSettings({ billReminders: true });
            }}
          />
        </Row>
        {settings.billReminders ? (
          <Animated.View entering={FadeInDown.duration(250)} style={{ gap: Spacing.two }}>
            <T v="small" muted>
              Ne zaman haber verelim?
            </T>
            <Row style={{ gap: 6, flexWrap: 'wrap' }}>
              {[1, 2, 3, 5].map((d) => (
                <Chip key={d} label={`${d} gün önce`} selected={settings.reminderDaysBefore === d} onPress={() => updateSettings({ reminderDaysBefore: d })} />
              ))}
            </Row>
            <T v="small" muted>
              Saat
            </T>
            <Row style={{ gap: 6, flexWrap: 'wrap' }}>
              {[9, 12, 19].map((h) => (
                <Chip
                  key={h}
                  label={`${String(h).padStart(2, '0')}:00`}
                  selected={settings.reminderHour === h}
                  onPress={() => updateSettings({ reminderHour: h })}
                />
              ))}
            </Row>
          </Animated.View>
        ) : null}
      </Card>

      <SectionLabel>Ana sayfa düzeni</SectionLabel>
      <T v="small" muted style={{ marginTop: -6, marginBottom: 10 }}>
        Genel bakıştaki bölümleri ≡ tutamacından tutup sürükleyerek sırala, anahtarla gizle.
      </T>
      <Card style={{ paddingVertical: Spacing.one }}>
        <SortableList
          data={settings.homeSections}
          rowHeight={SECTION_ROW}
          onReorder={(keys) => reorderHomeSections(keys as HomeSectionKey[])}
          renderItem={(s, handle) => (
            <Row style={[styles.sortRow, { backgroundColor: t.surface }]}>
              {handle}
              <T v="bodyBold" style={{ flex: 1, opacity: s.visible ? 1 : 0.5 }}>
                {HomeSectionNames[s.key]}
              </T>
              <Switch value={s.visible} onValueChange={() => toggleHomeSection(s.key)} trackColor={{ true: t.primary }} />
            </Row>
          )}
        />
      </Card>

      <SectionLabel>Veriler</SectionLabel>
      <Card style={{ paddingVertical: 0 }}>
        <Touch
          pressScale={0.98}
          onPress={() =>
            confirm('Tüm veriler silinsin mi?', 'İşlemler, ödemeler, hedefler ve ayarlar silinir. Bu işlem geri alınamaz.', resetAll, 'Hepsini sil')
          }>
          <Row style={{ paddingVertical: 18, gap: Spacing.three }}>
            <Icon name="trash" color={t.expense} size={20} />
            <T v="bodyBold" color={t.expense} style={{ flex: 1 }}>
              Tüm verileri sıfırla
            </T>
            <Icon name="chevronRight" color={t.text} size={18} />
          </Row>
        </Touch>
      </Card>
      <T v="small" muted style={{ textAlign: 'center', marginTop: Spacing.four }}>
        Veriler yalnızca bu cihazda saklanır.
      </T>
    </Page>
  );
}

/** Akbank "Senin için" hikâye halkaları gibi aile üyeleri. */
function FamilyStories() {
  const t = useTheme();
  const members = useBudget((s) => s.members);
  const userName = useBudget((s) => s.settings.userName);
  const defaultMemberId = useBudget((s) => s.settings.defaultMemberId);
  const updateSettings = useBudget((s) => s.updateSettings);
  const addMember = useBudget((s) => s.addMember);
  const removeMember = useBudget((s) => s.removeMember);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(MEMBER_EMOJIS[1]);

  return (
    <View>
      <SectionLabel>Ailen</SectionLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.three }} contentContainerStyle={{ gap: 14, paddingHorizontal: Spacing.three }}>
        {members.map((m, i) => {
          const isDefault = defaultMemberId === m.id;
          return (
            <Animated.View key={m.id} entering={FadeInRight.delay(i * 60).springify().damping(18)}>
              <Touch
                pressScale={0.92}
                onPress={() => updateSettings({ defaultMemberId: m.id })}
                onLongPress={() =>
                  m.id !== 'me' && confirm('Üye silinsin mi?', `${m.name} aile listesinden çıkarılacak. Geçmiş işlemleri silinmez.`, () => removeMember(m.id))
                }
                style={{ alignItems: 'center', width: 84, gap: 8 }}>
                <View style={[styles.ring, { borderColor: isDefault ? t.primary : t.border }]}>
                  <View style={[styles.story, { backgroundColor: isDefault ? t.primarySoft : t.surface }]}>
                    <T style={{ fontSize: 32 }}>{m.emoji}</T>
                  </View>
                  {isDefault ? (
                    <View style={[styles.star, { backgroundColor: t.primary, borderColor: t.background }]}>
                      <Icon name="check" size={11} color="#fff" />
                    </View>
                  ) : null}
                </View>
                <T v="small" numberOfLines={1} style={{ fontFamily: isDefault ? FontFamily.medium : FontFamily.regular }}>
                  {m.id === 'me' && userName ? userName.split(' ')[0] : m.name}
                </T>
              </Touch>
            </Animated.View>
          );
        })}
        <Touch pressScale={0.92} onPress={() => setAdding((a) => !a)} style={{ alignItems: 'center', width: 84, gap: 8 }}>
          <View style={[styles.ring, styles.addRing, { borderColor: t.primary }]}>
            <Icon name={adding ? 'close' : 'plus'} size={28} color={t.primary} />
          </View>
          <T v="small" color={t.primary}>
            {adding ? 'Vazgeç' : 'Ekle'}
          </T>
        </Touch>
      </ScrollView>
      <T v="small" muted style={{ marginTop: 10 }}>
        Halkası renkli olan yeni işlemlerde varsayılan seçilir. Dokun: seç · Basılı tut: sil
      </T>

      {adding ? (
        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <Card style={{ gap: Spacing.two, marginTop: Spacing.three }}>
            <Row style={{ gap: 6, flexWrap: 'wrap' }}>
              {MEMBER_EMOJIS.map((e) => (
                <Touch
                  key={e}
                  pressScale={0.88}
                  onPress={() => setEmoji(e)}
                  style={[styles.emoji, { backgroundColor: emoji === e ? t.primarySoft : t.surfaceAlt, borderColor: emoji === e ? t.primary : 'transparent' }]}>
                  <T style={{ fontSize: 20 }}>{e}</T>
                </Touch>
              ))}
            </Row>
            <Row style={{ gap: Spacing.two }}>
              <TextInput
                autoFocus
                value={name}
                onChangeText={setName}
                placeholder="İsim (Örn: Ayşe)"
                placeholderTextColor={t.textMuted}
                style={[styles.input, { flex: 1, color: t.text, backgroundColor: t.surfaceAlt }]}
              />
              <PillButton
                label="Ekle"
                onPress={() => {
                  if (!name.trim()) return;
                  addMember(name.trim(), emoji);
                  setName('');
                  setAdding(false);
                }}
              />
            </Row>
          </Card>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRing: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  story: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashed: {
    marginTop: Spacing.four,
    padding: 20,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 10,
  },
  input: {
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FontFamily.regular,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortRow: {
    height: SECTION_ROW,
    gap: Spacing.two,
    borderRadius: Radius.sm,
  },
  emoji: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
