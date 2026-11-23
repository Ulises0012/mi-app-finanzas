import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNegocioTransactions, NegocioTransaction } from '@/hooks/useNegocioTransactions';
import { colors, radius, spacing, fonts } from '@/constants/theme';

export default function NegocioResumen() {
  const { transactions, loading, balance, deleteTransaction } = useNegocioTransactions();

  const handleEliminar = (id: string) => {
    Alert.alert('¿Eliminar este movimiento?', 'No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  };

  const renderItem = ({ item }: { item: NegocioTransaction }) => {
    const esIngreso = item.tipo === 'ingreso';
    return (
      <Pressable style={styles.row} onLongPress={() => handleEliminar(item.id)}>
        <View style={[styles.badge, { backgroundColor: (esIngreso ? colors.mint : colors.coral) + '26' }]}>
          <Ionicons name={esIngreso ? 'arrow-down' : 'arrow-up'} size={18} color={esIngreso ? colors.mint : colors.coral} />
        </View>
        <Text style={styles.rowLabel}>{item.nota}</Text>
        <Text style={[styles.rowMonto, { color: esIngreso ? colors.mint : colors.coral }]}>
          {esIngreso ? '+' : '−'}${item.monto.toFixed(2)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.mint, '#1F8F63']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>Balance del negocio</Text>
          <Pressable onPress={() => router.push('/')} hitSlop={8}>
            <Ionicons name="person-outline" size={22} color="rgba(0,0,0,0.7)" />
          </Pressable>
        </View>
        <Text style={styles.balance}>{balance < 0 ? '−' : ''}${Math.abs(balance).toFixed(2)}</Text>
      </LinearGradient>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100, gap: 4 }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={40} color={colors.textTertiary} />
              <Text style={styles.empty}>Aún no hay movimientos del negocio</Text>
            </View>
          ) : null
        }
      />

      <Pressable onPress={() => router.push('/nuevo-negocio-movimiento')} style={styles.fabWrap}>
        <View style={styles.fab}>
          <Ionicons name="add" size={30} color={colors.ink} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink },
  header: { paddingTop: 64, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontFamily: fonts.bodyMedium, fontSize: 14, color: 'rgba(0,0,0,0.65)' },
  balance: { fontFamily: fonts.display, fontSize: 44, color: colors.ink, marginTop: spacing.xs, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  badge: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textPrimary },
  rowMonto: { fontFamily: fonts.displaySemi, fontSize: 15, fontVariant: ['tabular-nums'] },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
  empty: { fontFamily: fonts.body, color: colors.textTertiary, fontSize: 14 },
  fabWrap: { position: 'absolute', right: spacing.lg, bottom: 20 },
  fab: { width: 60, height: 60, borderRadius: radius.pill, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', shadowColor: colors.mint, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
});