import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';

import { Icon } from '@/components/icon';
import { tap, Touch } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const t = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Ana Sayfa', tabBarIcon: ({ color }) => <Icon name="home" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="islemler"
        options={{ title: 'İşlemler', tabBarIcon: ({ color }) => <Icon name="list" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="yeni"
        options={{
          title: '',
          tabBarButton: () => (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Touch
                haptic={false}
                accessibilityRole="button"
                accessibilityLabel="Yeni işlem ekle"
                onPress={() => {
                  tap();
                  router.push('/ekle');
                }}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  marginTop: -18,
                  backgroundColor: t.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: t.surface,
                  shadowColor: t.primary,
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}>
                <Icon name="plus" color={t.onPrimary} size={28} />
              </Touch>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="butce"
        options={{ title: 'Bütçe', tabBarIcon: ({ color }) => <Icon name="chart" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: 'Profil', tabBarIcon: ({ color }) => <Icon name="person" color={color} size={24} /> }}
      />
    </Tabs>
  );
}
