import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { colors, radius, spacing, fonts } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

const MONTOS_RAPIDOS = [5, 10, 20, 50];

export default function NuevaTransaccion() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const esEdicion = !!id;
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categorias } = useCategories();
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto');
  const [monto, setMonto] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cargado, setCargado] = useState(!esEdicion);

  useEffect(() => {
    if (!esEdicion || cargado) return;
    const existente = transactions.find((t) => t.id === id);
    if (existente) {
      setTipo(existente.tipo);
      setMonto(String(existente.monto));
      setCategoryId(existente.categoryId);
      setNota(existente.nota ?? '');
      setCargado(true);
    }
  }, [esEdicion, cargado, transactions, id]);

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);
  const acento = tipo === 'gasto' ? colors.coral : colors.mint;

  const handleGuardar = async () => {
    setError('');
    const montoNum = parseFloat(monto.replace(',', '.'));
    if (!montoNum || montoNum <= 0) {
      setError('Ingresa un monto válido');
      return;
    }
    if (!categoryId) {
      setError('Elige una categoría');
      return;
    }
    setSubmitting(true);
    try {
      const datos = { monto: montoNum, tipo, categoryId, nota: nota.trim() || undefined };
      if (esEdicion) {
        await updateTransaction(id!, datos);
      } else {
        await addTransaction(datos);
      }
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch (e) {
      setError('Algo falló al guardar, intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBorrar = () => {
    Alert.alert('¿Borrar esta transacción?', 'No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(id!);
          if (router.canGoBack()) router.back();
          else router.replace('/');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.toggleRow}>
        <Pressable style={[styles.toggleBtn, tipo === 'gasto' && { backgroundColor: colors.coral }]} onPress={() => { setTipo('gasto'); setCategoryId(''); }}>
          <Text style={[styles.toggleText, tipo === 'gasto' && styles.toggleTextActive]}>Gasto</Text>
        </Pressable>
        <Pressable style={[styles.toggleBtn, tipo === 'ingreso' && { backgroundColor: colors.mint }]} onPress={() => { setTipo('ingreso'); setCategoryId(''); }}>
          <Text style={[styles.toggleText, tipo === 'ingreso' && styles.toggleTextActive]}>Ingreso</Text>
        </Pressable>
      </View>

      <View style={styles.montoRow}>
        <Text style={[styles.montoSign, { color: acento }]}>$</Text>
        <TextInput
          style={[styles.montoInput, { color: acento }]}
          placeholder="0.00"
          placeholderTextColor={colors.textTertiary}
          keyboardType="decimal-pad"
          value={monto}
          onChangeText={setMonto}
        />
      </View>

      {!esEdicion && (
        <View style={styles.quickRow}>
          {MONTOS_RAPIDOS.map((val) => (
            <Pressable key={val} style={styles.quickChip} onPress={() => setMonto(String(val))}>
              <Text style={styles.quickChipText}>${val}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.categoriasGrid}>
        {categoriasFiltradas.map((cat) => {
          const active = categoryId === cat.id;
          return (
            <Pressable key={cat.id} onPress={() => setCategoryId(cat.id)} style={styles.categoriaItem}>
              <View style={[styles.categoriaCircle, { borderColor: active ? cat.color : colors.line }, active && { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icono} size={22} color={active ? colors.ink : cat.color} />
              </View>
              <Text style={[styles.categoriaLabel, active && { color: colors.textPrimary }]} numberOfLines={1}>
                {cat.nombre}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input placeholder="Nota (opcional)" value={nota} onChangeText={setNota} style={{ marginTop: spacing.lg }} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Button label={esEdicion ? 'Guardar cambios' : 'Guardar'} onPress={handleGuardar} loading={submitting} />
        {esEdicion && <Button label="Borrar transacción" variant="ghost" onPress={handleBorrar} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.ink },
  container: { padding: spacing.lg, paddingBottom: 48 },
  toggleRow: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface, padding: 4, borderRadius: radius.md },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.sm, alignItems: 'center' },
  toggleText: { fontFamily: fonts.bodySemi, color: colors.textSecondary, fontSize: 15 },
  toggleTextActive: { color: colors.ink },
  montoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.sm },
  montoSign: { fontFamily: fonts.display, fontSize: 32, marginRight: 4 },
  montoInput: { fontFamily: fonts.display, fontSize: 48, minWidth: 140, textAlign: 'center' },
  quickRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.xl },
  quickChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line },
  quickChipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  categoriasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  categoriaItem: { width: '21%', alignItems: 'center', gap: 6 },
  categoriaCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  categoriaLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, textAlign: 'center' },
  error: { fontFamily: fonts.body, color: colors.coral, textAlign: 'center', marginTop: spacing.sm },
});