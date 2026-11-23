import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, borderTopWidth: 1, height: 84, paddingTop: 8, paddingBottom: 24 },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 9 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} /> }} />
      <Tabs.Screen name="graficos" options={{ title: 'Gráficos', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'pie-chart' : 'pie-chart-outline'} size={size} color={color} /> }} />
      <Tabs.Screen name="recurrentes" options={{ title: 'Recurrentes', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'repeat' : 'repeat-outline'} size={size} color={color} /> }} />
      <Tabs.Screen name="metas" options={{ title: 'Metas', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'flag' : 'flag-outline'} size={size} color={color} /> }} />
      <Tabs.Screen name="prestamos" options={{ title: 'Préstamos', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} /> }} />
      <Tabs.Screen name="categorias" options={{ title: 'Categorías', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} /> }} />
    </Tabs>
  );
}