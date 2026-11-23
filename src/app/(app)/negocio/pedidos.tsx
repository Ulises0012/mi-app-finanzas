import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePedidos, Pedido } from '@/hooks/usePedidos';
import { colors, radius, spacing, fonts } from '@/constants/theme';

export default function Pedidos() {
  const { pedidos, marcarEntregado, eliminarPedido } = usePedidos();
  const pendientes = pedidos.filter((p) => p.estado === 'pendiente');
  const entregados = pedidos.filter((p) => p.estado === 'entregado');

  const handleEntregar = (p: Pedido) => {
    Alert.alert('¿Marcar como entregado?', `Se agregará $${p.monto.toFixed(2)} a tu balance de negocio.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => marcarEntregado(p) },
    ]);
  };

  const handleEliminar = (id: string) => {
    Alert.alert('¿Eliminar este pedido?', 'No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminarPedido(id) },
    ]);
  };

  const fila = (p: Pedido) => (
    <View key={p.id} style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.producto}>{p.producto}</Text>
        <Text style={styles.fecha}>
          {p.fechaEntrega.toDate().toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
        {p.notas ? <Text style={styles.notas}>{p.notas}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        <Text style={styles.monto}>${p.monto.toFixed(2)}</Text>
        {p.estado === 'pendiente' ? (
          <Pressable onPress={() => handleEntregar(p)} style={styles.entregarBtn}>
            <Text style={styles.entregarText}>Marcar entregado</Text>
          </Pressable>
        ) : (
          <View style={styles.entregadoTag}>
            <Ionicons name="checkmark-circle" size={14} color={colors.mint} />
            <Text style={styles.entregadoText}>Entregado</Text>
          </View>
        )}
      </View>
      <Pressable onPress={() => handleEliminar(p.id)} hitSlop={8} style={{ marginLeft: 8 }}>
        <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pedidos</Text>

        <Text style={styles.sectionLabel}>Por entregar ({pendientes.length})</Text>
        {pendientes.length === 0 ? (
          <Text style={styles.emptyMini}>Nada pendiente ahora mismo</Text>
        ) : (
          pendientes.map(fila)
        )}

        {entregados.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Entregados</Text>
            {entregados.map(fila)}
          </>
        )}
      </ScrollView>

      <Pressable onPress={() => router.push('/nuevo-pedido')} style={styles.fabWrap}>
        <View style={styles.fab}>
          <Ionicons name="add" size={30} color={colors.ink} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  container: { padding: spacing.lg, paddingTop: 64, paddingBottom: 120 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary, marginBottom: spacing.md },
  sectionLabel: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  emptyMini: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary, marginBottom: spacing.md },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  producto: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textPrimary },
  fecha: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  notas: { fontFamily: fonts.body, fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  monto: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  entregarBtn: { backgroundColor: colors.mint + '26', paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill },
  entregarText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.mint },
  entregadoTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entregadoText: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.mint },
  fabWrap: { position: 'absolute', right: spacing.lg, bottom: 20, shadowColor: colors.mint, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  fab: { width: 60, height: 60, borderRadius: radius.pill, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
});