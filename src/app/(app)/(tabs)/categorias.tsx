import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCategories, Categoria } from '@/hooks/useCategories';
import { useBudgets } from '@/hooks/useBudgets';
import { colors, radius, spacing, fonts } from '@/constants/theme';

export default function Categorias() {
  const { categorias } = useCategories();
  const { budgets, setBudget } = useBudgets();
  const categoriasGasto = categorias.filter((c) => c.tipo === 'gasto' && c.id !== 'prestamo');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Categorías</Text>
        <Text style={styles.subtitle}>Presupuesto mensual por categoría. Déjalo en 0 para no llevar control ahí.</Text>
        {categoriasGasto.map((cat) => (
          <FilaPresupuesto key={cat.id} categoria={cat} valorInicial={budgets[cat.id]} onGuardar={(v) => setBudget(cat.id, v)} />
        ))}
      </ScrollView>

      <Pressable onPress={() => router.push('/nueva-categoria')} style={styles.fabWrap}>
        <View style={styles.fab}>
          <Ionicons name="add" size={30} color={colors.ink} />
        </View>
      </Pressable>
    </View>
  );
}

function FilaPresupuesto({ categoria, valorInicial, onGuardar }: { categoria: Categoria; valorInicial?: number; onGuardar: (v: number) => void }) {
  const [texto, setTexto] = useState(valorInicial ? String(valorInicial) : '');

  useEffect(() => {
    setTexto(valorInicial ? String(valorInicial) : '');
  }, [valorInicial]);

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: categoria.color + '26' }]}>
        <Ionicons name={categoria.icono} size={18} color={categoria.color} />
      </View>
      <Text style={styles.rowLabel}>{categoria.nombre}</Text>
      <View style={styles.inputWrap}>
        <Text style={styles.sign}>$</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={texto}
          onChangeText={setTexto}
          onBlur={() => onGuardar(parseFloat(texto.replace(',', '.')) || 0)}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  container: { padding: spacing.lg, paddingTop: 64, paddingBottom: 120, gap: 4 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  badge: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textPrimary },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceHigh, borderRadius: radius.sm, paddingHorizontal: 10 },
  sign: { fontFamily: fonts.body, fontSize: 14, color: colors.textTertiary },
  input: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textPrimary, width: 64, paddingVertical: 8, textAlign: 'right' },
  fabWrap: { position: 'absolute', right: spacing.lg, bottom: 20, shadowColor: colors.coral, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  fab: { width: 60, height: 60, borderRadius: radius.pill, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
});