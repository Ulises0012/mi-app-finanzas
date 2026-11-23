import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useBudgets } from '@/hooks/useBudgets';
import { colors, radius, spacing, fonts } from '@/constants/theme';
import { Button } from '@/components/Button';
import { exportarTransaccionesCSV } from '@/utils/exportCSV';

const SIZE = 200;
const STROKE = 26;
const RADIO = (SIZE - STROKE) / 2;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

export default function Graficos() {
  const { transactions } = useTransactions();
  const { categorias } = useCategories();
  const { budgets } = useBudgets();
  const [exportando, setExportando] = useState(false);

  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const gastosDelMes = transactions.filter((t) => t.tipo === 'gasto' && t.categoryId !== 'prestamo' && t.fecha?.toDate && t.fecha.toDate() >= monthStart);
  const totalGastos = gastosDelMes.reduce((s, t) => s + t.monto, 0);

  const segmentos = useMemo(() => {
    const totals: Record<string, number> = {};
    gastosDelMes.forEach((t) => {
      totals[t.categoryId] = (totals[t.categoryId] || 0) + t.monto;
    });
    let acumulado = 0;
    return Object.entries(totals)
      .map(([categoryId, total]) => ({ categoria: categorias.find((c) => c.id === categoryId)!, total }))
      .filter((s) => !!s.categoria)
      .sort((a, b) => b.total - a.total)
      .map(({ categoria, total }) => {
        const largo = totalGastos > 0 ? (total / totalGastos) * CIRCUNFERENCIA : 0;
        const offset = acumulado;
        acumulado += largo;
        return { categoria, total, largo, offset, porcentaje: totalGastos > 0 ? (total / totalGastos) * 100 : 0 };
      });
  }, [transactions, categorias]);

  const presupuestados = segmentos.filter(({ categoria }) => !!budgets[categoria.id]);

  const handleExportar = async () => {
    setExportando(true);
    try {
      await exportarTransaccionesCSV(transactions, categorias);
    } catch (e) {
      Alert.alert('No se pudo exportar', 'Intenta de nuevo en un momento.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gastos por categoría</Text>
      <Text style={styles.subtitle}>Este mes</Text>

      <View style={styles.chartWrap}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <G rotation={-90} originX={SIZE / 2} originY={SIZE / 2}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIO} stroke={colors.surfaceHigh} strokeWidth={STROKE} fill="none" />
            {segmentos.map(({ categoria, largo, offset }) => (
              <Circle key={categoria.id} cx={SIZE / 2} cy={SIZE / 2} r={RADIO} stroke={categoria.color} strokeWidth={STROKE} strokeDasharray={`${largo} ${CIRCUNFERENCIA - largo}`} strokeDashoffset={-offset} strokeLinecap="butt" fill="none" />
            ))}
          </G>
        </Svg>
        <View style={styles.chartCenter}>
          <Text style={styles.chartCenterLabel}>Total</Text>
          <Text style={styles.chartCenterValue}>${totalGastos.toFixed(0)}</Text>
        </View>
      </View>

      {segmentos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="pie-chart-outline" size={40} color={colors.textTertiary} />
          <Text style={styles.empty}>Aún no hay gastos este mes para graficar</Text>
        </View>
      ) : (
        <View style={styles.legend}>
          {segmentos.map(({ categoria, total, porcentaje }) => (
            <View key={categoria.id} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: categoria.color }]} />
              <Ionicons name={categoria.icono} size={16} color={categoria.color} style={{ marginRight: 4 }} />
              <Text style={styles.legendLabel}>{categoria.nombre}</Text>
              <Text style={styles.legendPercent}>{porcentaje.toFixed(0)}%</Text>
              <Text style={styles.legendAmount}>${total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      {presupuestados.length > 0 && (
        <View style={styles.budgetSection}>
          <Text style={styles.sectionTitle}>Presupuestos</Text>
          {presupuestados.map(({ categoria, total }) => {
            const limite = budgets[categoria.id];
            const progreso = Math.min(total / limite, 1);
            const sobrepasado = total > limite;
            return (
              <View key={categoria.id} style={styles.budgetRow}>
                <View style={styles.legendRow}>
                  <Ionicons name={categoria.icono} size={14} color={categoria.color} />
                  <Text style={[styles.legendLabel, { marginLeft: 6 }]}>{categoria.nombre}</Text>
                  <Text style={[styles.legendAmount, sobrepasado && { color: colors.coral }]}>
                    ${total.toFixed(2)} / ${limite.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${progreso * 100}%`, backgroundColor: sobrepasado ? colors.coral : categoria.color }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={{ width: '100%', marginTop: spacing.xl }}>
        <Button label="Exportar todo a CSV" variant="ghost" onPress={handleExportar} loading={exportando} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.ink },
  container: { padding: spacing.lg, paddingTop: 64, alignItems: 'center', paddingBottom: 48 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary, alignSelf: 'flex-start' },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, alignSelf: 'flex-start', marginTop: 2, marginBottom: spacing.lg },
  chartWrap: { alignItems: 'center', justifyContent: 'center', marginVertical: spacing.md },
  chartCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  chartCenterLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  chartCenterValue: { fontFamily: fonts.display, fontSize: 26, color: colors.textPrimary, marginTop: 2 },
  legend: { width: '100%', marginTop: spacing.lg, gap: 14 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textPrimary },
  legendPercent: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, width: 40, textAlign: 'right' },
  legendAmount: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary, textAlign: 'right', fontVariant: ['tabular-nums'] },
  emptyState: { alignItems: 'center', marginTop: 40, gap: 12 },
  empty: { fontFamily: fonts.body, color: colors.textTertiary, fontSize: 14, textAlign: 'center' },
  budgetSection: { width: '100%', marginTop: spacing.xl },
  sectionTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary, marginBottom: spacing.md },
  budgetRow: { marginBottom: spacing.md, gap: 6 },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});