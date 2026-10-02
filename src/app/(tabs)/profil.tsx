import { useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { SortableList } from '@/components/sortable-list';
import { Card, Chip, Row, SectionHeader, T, Touch } from '@/components/ui';
import { Accents, Radius, Spacing, type AccentKey } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirm } from '@/lib/confirm';
import { remindersSupported, requestReminderPermission } from '@/lib/reminders';
import { HomeSectionNames, useBudget, type HomeSectionKey } from '@/store/budget';

const SECTION_ROW = 56;
const MEMBER_EMOJIS = ['🙂', '💐', '🧔', '👩', '🧒', '👧', '👦', '👵', '👴', '🐶'];

export default function Profile() {
  const t = useTheme();
  const settings = useBudget((s) => s.settings);
  const members = useBudget((s) => s.members);
  const updateSettings = useBudget((s) => s.updateSettings);
  const reorderHomeSections = useBudget((s) => s.reorderHomeSections);
  const toggleHomeSection = useBudget((s) => s.toggleHomeSection);
  const addMember = useBudget((s) => s.addMember);
  const removeMember = useBudget((s) => s.removeMember);
  const resetAll = useBudget((s) => s.resetAll);

  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState(MEMBER_EMOJIS[1]);
  const [adding, setAdding] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const initial = (settings.userName || 'B').charAt(0).toLocaleUpperCase('tr');

  return (
    <Screen
      hero={
        <Row style={{ gap: Spacing.three }}>
          <View style={styles.avatar}>
            <T v="title" color="#fff">
              {initial}
            </T>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <TextInput
              value={settings.userName}
              onChangeText={(v) => updateSettings({ userName: v })}
              placeholder="Adın"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.heroInput}
            />
            <TextInput
              value={settings.familyName}
              onChangeText={(v) => updateSettings({ familyName: v })}
              placeholder="Aile adı (Örn: Yılmaz)"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={[styles.heroInput, { fontSize: 14, fontWeight: '500' }]}
            />
          </View>
          <Icon name="gear" color="rgba(255,255,255,0.7)" size={20} />
        </Row>
      }>
      {/* Görünüm */}
      <SectionHeader title="Görünüm" />
      <Card style={{ gap: Spacing.three }}>
        <T v="small" muted>
          Uygulama rengi
        </T>
        <Row style={{ justifyContent: 'space-between' }}>
          {(Object.keys(Accents) as AccentKey[]).map((k) => {
            const sel = settings.accent === k;
            return (
              <Touch key={k} onPress={() => updateSettings({ accent: k })} style={{ alignItems: 'center', gap: 4 }}>
                <View style={[styles.swatch, { backgroundColor: Accents[k].primary, borderColor: sel ? t.text : 'transparent' }]}>
                  {sel ? <Icon name="check" color="#fff" size={18} /> : null}
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
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <T v="bodyBold">Tutarları gizle</T>
            <T v="small" muted>
              Ana sayfada bakiye ••••• görünür
            </T>
          </View>
          <Switch
            value={settings.hideBalance}
            onValueChange={(v) => updateSettings({ hideBalance: v })}
            trackColor={{ true: t.primary }}
          />
        </Row>
      </Card>

      {/* Bildirimler */}
      <SectionHeader title="Bildirimler" />
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
          <>
            <T v="small" muted>
              Ne zaman haber verelim?
            </T>
            <Row style={{ gap: 6, flexWrap: 'wrap' }}>
              {[1, 2, 3, 5].map((d) => (
                <Chip
                  key={d}
                  label={`${d} gün önce`}
                  selected={settings.reminderDaysBefore === d}
                  onPress={() => updateSettings({ reminderDaysBefore: d })}
                />
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
          </>
        ) : null}
      </Card>

      {/* Ana sayfa düzeni */}
      <SectionHeader title="Ana Sayfa Düzeni" />
      <T v="small" muted style={{ marginTop: -4, marginBottom: Spacing.two }}>
        Bölümleri ≡ tutamacından tutup sürükleyerek sırala, anahtarla gizle.
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

      {/* Aile */}
      <SectionHeader title="Aile Üyeleri" action={adding ? 'Vazgeç' : '+ Ekle'} onAction={() => setAdding((a) => !a)} />
      <T v="small" muted style={{ marginTop: -4, marginBottom: Spacing.two }}>
        Yıldızlı kişi yeni işlemlerde varsayılan seçilir. Dokun: varsayılan yap · Basılı tut: sil
      </T>
      {adding ? (
        <Card style={{ gap: Spacing.two, marginBottom: Spacing.three }}>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {MEMBER_EMOJIS.map((e) => (
              <Touch
                key={e}
                onPress={() => setNewEmoji(e)}
                style={[styles.emoji, { backgroundColor: newEmoji === e ? t.primarySoft : t.surfaceAlt, borderColor: newEmoji === e ? t.primary : 'transparent' }]}>
                <T v="heading">{e}</T>
              </Touch>
            ))}
          </Row>
          <Row style={{ gap: Spacing.two }}>
            <TextInput
              autoFocus
              value={newName}
              onChangeText={setNewName}
              placeholder="İsim (Örn: Ayşe)"
              placeholderTextColor={t.textMuted}
              style={[styles.input, { color: t.text, backgroundColor: t.surfaceAlt }]}
            />
            <Touch
              onPress={() => {
                if (!newName.trim()) return;
                addMember(newName.trim(), newEmoji);
                setNewName('');
                setAdding(false);
              }}
              style={[styles.btn, { backgroundColor: t.primary }]}>
              <T v="bodyBold" color={t.onPrimary}>
                Ekle
              </T>
            </Touch>
          </Row>
        </Card>
      ) : null}
      <Card style={{ paddingVertical: Spacing.one }}>
        {members.map((m, i) => {
          const isDefault = settings.defaultMemberId === m.id;
          return (
            <Touch
              key={m.id}
              onPress={() => updateSettings({ defaultMemberId: m.id })}
              onLongPress={() =>
                m.id !== 'me' && confirm('Üye silinsin mi?', `${m.name} aile listesinden çıkarılacak. Geçmiş işlemleri silinmez.`, () => removeMember(m.id))
              }>
              <Row style={[styles.listRow, { borderBottomColor: t.border }, i === members.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.memberAvatar, { backgroundColor: t.surfaceAlt }]}>
                  <T v="heading">{m.emoji}</T>
                </View>
                <T v="bodyBold" style={{ flex: 1 }}>
                  {m.id === 'me' && settings.userName ? settings.userName : m.name}
                  {m.id === 'me' ? '  (sen)' : ''}
                </T>
                {isDefault ? <T color={t.warning}>★</T> : null}
              </Row>
            </Touch>
          );
        })}
      </Card>

      <SectionHeader title="Veriler" />
      <Card>
        <Touch
          onPress={() =>
            confirm('Tüm veriler silinsin mi?', 'İşlemler, ödemeler, hedefler ve ayarlar silinir. Bu işlem geri alınamaz.', resetAll, 'Hepsini sil')
          }>
          <Row style={{ gap: Spacing.three }}>
            <Icon name="trash" color={t.expense} size={20} />
            <T v="bodyBold" color={t.expense}>
              Tüm verileri sıfırla
            </T>
          </Row>
        </Touch>
      </Card>
      <T v="small" muted style={{ textAlign: 'center', marginTop: Spacing.four }}>
        Veriler yalnızca bu cihazda saklanır.
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInput: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    padding: 0,
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
  listRow: {
    gap: Spacing.three,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  btn: {
    paddingHorizontal: 18,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
