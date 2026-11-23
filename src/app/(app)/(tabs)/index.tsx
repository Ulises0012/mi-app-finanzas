import { useMemo } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useRecurring } from '@/hooks/useRecurring';
import { useReminders } from '@/hooks/useReminders';
import { colors, radius, spacing, fonts } from '@/constants/theme';

function formatearFecha(fecha: Date) {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (fecha.toDateString() === hoy.toDateString()) return 'Hoy';
  if (fecha.toDateString() === ayer.toDateString()) return 'Ayer';
  return fecha.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

export default function Home() {
  const { signOut } = useAuth();
  const { perfil, activarNegocio } = useProfile();
  const { transactions, loading, balance } = useTransactions();
  const { categorias } = useCategories();
  useRecurring();
  useReminders();

  const tieneNegocio = perfil?.tieneNegocio !== false;

  const handleNegocioPress = () => {
    if (tieneNegocio) {
      router.push('/negocio');
      return;
    }
    Alert.alert(
      'Activar modo negocio',
      '¿Quieres activar la sección de negocio para llevar tus pedidos y su propio balance?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Activar',
          onPress: async () => {
            await activarNegocio();
            router.push('/negocio');
          },
        },
      ]
    );
  };

  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const delMes = transactions.filter((t) => t.fecha?.toDate && t.fecha.toDate() >= monthStart);
  const totalIngresos = delMes.filter((t) => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
  const totalGastos = delMes.filter((t) => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0);

  const sections = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    transactions.forEach((t) => {
      if (!t.fecha?.toDate) return;
      const key = formatearFecha(t.fecha.toDate());
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [transactions]);

  const renderItem = ({ item, index, section }: { item: Transaction; index: number; section: { data: Transaction[] } }) => {
    const categoria = categorias.find((c) => c.id === item.categoryId);
    const esIngreso = item.tipo === 'ingreso';
    return (
      <View>
        <Pressable style={styles.row} onPress={() => router.push({ pathname: '/nueva-transaccion', params: { id: item.id } })}>
          <View style={[styles.badge, { backgroundColor: (categoria?.color ?? colors.textTertiary) + '26' }]}>
            <Ionicons name={categoria?.icono ?? 'ellipsis-horizontal'} size={20} color={categoria?.color ?? colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{categoria?.nombre ?? 'Otro'}</Text>
            {item.nota ? <Text style={styles.rowNota}>{item.nota}</Text> : null}
          </View>
          <Text style={[styles.rowMonto, { color: esIngreso ? colors.mint : colors.coral }]}>
            {esIngreso ? '+' : '−'}${item.monto.toFixed(2)}
          </Text>
        </Pressable>
        {index < section.data.length - 1 && <View style={styles.divider} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color={colors.textTertiary} />
              <Text style={styles.empty}>Aún no tienes transacciones</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View>
            <LinearGradient colors={[colors.coral, '#B23A56']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
              <View style={styles.headerTop}>
                <Text style={styles.greeting}>Tu balance</Text>
                <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                  <Pressable onPress={handleNegocioPress} hitSlop={8}>
                    <Ionicons name={tieneNegocio ? 'briefcase-outline' : 'add-circle-outline'} size={22} color="rgba(255,255,255,0.9)" />
                  </Pressable>
                  <Pressable onPress={() => signOut()} hitSlop={8}>
                    <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.9)" />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.balance}>{balance < 0 ? '−' : ''}${Math.abs(balance).toFixed(2)}</Text>
            </LinearGradient>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderColor: colors.mint + '40' }]}>
                <Text style={[styles.statLabel, { color: colors.mint }]}>Ingresos · mes</Text>
                <Text style={styles.statValue}>${totalIngresos.toFixed(2)}</Text>
              </View>
              <View style={[styles.statCard, { borderColor: colors.coral + '40' }]}>
                <Text style={[styles.statLabel, { color: colors.coral }]}>Gastos · mes</Text>
                <Text style={styles.statValue}>${totalGastos.toFixed(2)}</Text>
              </View>
            </View>

            {sections.length > 0 && <Text style={styles.listTitle}>Movimientos</Text>}
          </View>
        }
      />

      <Pressable onPress={() => router.push('/nueva-transaccion')} style={styles.fabWrap}>
        <LinearGradient colors={[colors.coral, '#B23A56']} style={styles.fab}>
          <Ionicons name="add" size={30} color={colors.ink} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink },
  header: { paddingTop: 64, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontFamily: fonts.bodyMedium, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  balance: { fontFamily: fonts.display, fontSize: 44, color: '#fff', marginTop: spacing.xs, fontVariant: ['tabular-nums'] },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: spacing.lg, marginTop: -24 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, padding: 14 },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 },
  statValue: { fontFamily: fonts.displaySemi, fontSize: 20, color: colors.textPrimary, marginTop: 4, fontVariant: ['tabular-nums'] },
  listTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary, marginHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionHeader: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: spacing.lg },
  badge: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textPrimary },
  rowNota: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  rowMonto: { fontFamily: fonts.displaySemi, fontSize: 16, fontVariant: ['tabular-nums'] },
  divider: { borderBottomWidth: 1, borderStyle: 'dashed', borderColor: colors.line, marginLeft: 56 + spacing.lg },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
  empty: { fontFamily: fonts.body, color: colors.textTertiary, fontSize: 14 },
  fabWrap: { position: 'absolute', right: spacing.lg, bottom: 20, borderRadius: radius.pill, shadowColor: colors.coral, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  fab: { width: 60, height: 60, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});