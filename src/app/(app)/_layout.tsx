import { Stack } from 'expo-router';
import { colors, fonts } from '@/constants/theme';

const modalOptions = {
  presentation: 'modal' as const,
  headerShown: true,
  headerStyle: { backgroundColor: colors.ink },
  headerTitleStyle: { fontFamily: fonts.bodySemi, color: colors.textPrimary },
  headerTintColor: colors.textPrimary,
};

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="negocio" />
      <Stack.Screen name="nueva-transaccion" options={{ ...modalOptions, title: 'Transacción' }} />
      <Stack.Screen name="nueva-categoria" options={{ ...modalOptions, title: 'Nueva categoría' }} />
      <Stack.Screen name="nueva-recurrente" options={{ ...modalOptions, title: 'Nuevo recurrente' }} />
      <Stack.Screen name="nueva-meta" options={{ ...modalOptions, title: 'Nueva meta' }} />
      <Stack.Screen name="nuevo-pedido" options={{ ...modalOptions, title: 'Nuevo pedido' }} />
      <Stack.Screen name="nuevo-negocio-movimiento" options={{ ...modalOptions, title: 'Movimiento' }} />
      <Stack.Screen name="nuevo-prestamo" options={{ ...modalOptions, title: 'Nuevo préstamo' }} />
    </Stack>
  );
}