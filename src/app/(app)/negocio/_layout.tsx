import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/constants/theme';

export default function NegocioTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.mint,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, borderTopWidth: 1, height: 84, paddingTop: 8, paddingBottom: 24 },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Resumen', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={size} color={color} /> }} />
      <Tabs.Screen name="pedidos" options={{ title: 'Pedidos', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size} color={color} /> }} />
    </Tabs>
  );
}