import { View, Text, Pressable, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecurring } from '@/hooks/useRecurring';
import { useCategories } from '@/hooks/useCategories';
import { colors, radius, spacing, fonts } from '@/constants/theme';

export default function Recurrentes() {
  const { recurring, toggleActivo, eliminar } = useRecurring();
  const { categorias } = useCategories();

  const handleEliminar = (id: string) => {
    Alert.alert('¿Eliminar este recurrente?', 'No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(id) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Recurrentes</Text>
        <Text style={styles.subtitle}>Se registran solos cuando llega su fecha. Toca uno para editarlo.</Text>

        {recurring.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="repeat-outline" size={40} color={colors.textTertiary} />
            <Text style={styles.empty}>No tienes nada recurrente todavía</Text>
          </View>
        ) : (
          recurring.map((r) => {
            const categoria = categorias.find((c) => c.id === r.categoryId);
            const esIngreso = r.tipo === 'ingreso';
            return (
              <View key={r.id} style={styles.row}>
                <Pressable style={styles.rowMain} onPress={() => router.push({ pathname: '/nueva-recurrente', params: { id: r.id } })}>
                  <View style={[styles.badge, { backgroundColor: (categoria?.color ?? colors.textTertiary) + '26' }]}>
                    <Ionicons name={categoria?.icono ?? 'ellipsis-horizontal'} size={18} color={categoria?.color ?? colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{categoria?.nombre ?? 'Otro'}{r.nota ? ` · ${r.nota}` : ''}</Text>
                    <Text style={[styles.rowSub, { color: esIngreso ? colors.mint : colors.coral }]}>
                      {esIngreso ? '+' : '−'}${r.monto.toFixed(2)} · {r.frecuencia === 'mensual' ? 'mensual' : 'semanal'}
                    </Text>
                  </View>
                </Pressable>
                <Switch value={r.activo} onValueChange={(v) => toggleActivo(r.id, v)} trackColor={{ false: colors.line, true: colors.coral }} thumbColor={colors.textPrimary} />
                <Pressable onPress={() => handleEliminar(r.id)} hitSlop={8} style={{ marginLeft: 12 }}>
                  <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      <Pressable onPress={() => router.push('/nueva-recurrente')} style={styles.fabWrap}>
        <View style={styles.fab}>
          <Ionicons name="add" size={30} color={colors.ink} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  container: { padding: spacing.lg, paddingTop: 64, paddingBottom: 120, gap: 4 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.md },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  empty: { fontFamily: fonts.body, color: colors.textTertiary, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textPrimary },
  rowSub: { fontFamily: fonts.bodySemi, fontSize: 12, marginTop: 2, fontVariant: ['tabular-nums'] },
  fabWrap: { position: 'absolute', right: spacing.lg, bottom: 20, shadowColor: colors.coral, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  fab: { width: 60, height: 60, borderRadius: radius.pill, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
});