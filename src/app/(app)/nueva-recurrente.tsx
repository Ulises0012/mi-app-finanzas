import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecurring } from '@/hooks/useRecurring';
import { useCategories } from '@/hooks/useCategories';
import { colors, radius, spacing, fonts } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function NuevaRecurrente() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const esEdicion = !!id;
  const { recurring, addRecurring, updateRecurring } = useRecurring();
  const { categorias } = useCategories();
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto');
  const [monto, setMonto] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frecuencia, setFrecuencia] = useState<'semanal' | 'mensual'>('mensual');
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cargado, setCargado] = useState(!esEdicion);

  useEffect(() => {
    if (!esEdicion || cargado) return;
    const existente = recurring.find((r) => r.id === id);
    if (existente) {
      setTipo(existente.tipo);
      setMonto(String(existente.monto));
      setCategoryId(existente.categoryId);
      setFrecuencia(existente.frecuencia);
      setNota(existente.nota ?? '');
      setCargado(true);
    }
  }, [esEdicion, cargado, recurring, id]);

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
      const datos = { monto: montoNum, tipo, categoryId, frecuencia, nota: nota.trim() || undefined };
      if (esEdicion) {
        await updateRecurring(id!, datos);
      } else {
        await addRecurring({ ...datos, proximaFecha: new Date() });
      }
      if (router.canGoBack()) router.back();
      else router.replace('/recurrentes');
    } catch (e) {
      setError('Algo falló al guardar, intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
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
        <TextInput style={[styles.montoInput, { color: acento }]} placeholder="0.00" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" value={monto} onChangeText={setMonto} />
      </View>

      <Text style={styles.label}>Repetir</Text>
      <View style={styles.toggleRow}>
        <Pressable style={[styles.toggleBtn, frecuencia === 'semanal' && { backgroundColor: colors.surfaceHigh }]} onPress={() => setFrecuencia('semanal')}>
          <Text style={[styles.toggleText, frecuencia === 'semanal' && { color: colors.textPrimary }]}>Cada semana</Text>
        </Pressable>
        <Pressable style={[styles.toggleBtn, frecuencia === 'mensual' && { backgroundColor: colors.surfaceHigh }]} onPress={() => setFrecuencia('mensual')}>
          <Text style={[styles.toggleText, frecuencia === 'mensual' && { color: colors.textPrimary }]}>Cada mes</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.categoriasGrid}>
        {categoriasFiltradas.map((cat) => {
          const active = categoryId === cat.id;
          return (
            <Pressable key={cat.id} onPress={() => setCategoryId(cat.id)} style={styles.categoriaItem}>
              <View style={[styles.categoriaCircle, { borderColor: active ? cat.color : colors.line }, active && { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icono} size={22} color={active ? colors.ink : cat.color} />
              </View>
              <Text style={[styles.categoriaLabel, active && { color: colors.textPrimary }]} numberOfLines={1}>{cat.nombre}</Text>
            </Pressable>
          );
        })}
      </View>

      <Input placeholder="Nota (opcional, ej. Netflix)" value={nota} onChangeText={setNota} style={{ marginTop: spacing.lg }} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ marginTop: spacing.lg }}>
        <Button label={esEdicion ? 'Guardar cambios' : 'Guardar'} onPress={handleGuardar} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.ink },
  container: { padding: spacing.lg, paddingBottom: 48, gap: spacing.sm },
  toggleRow: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface, padding: 4, borderRadius: radius.md },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.sm, alignItems: 'center' },
  toggleText: { fontFamily: fonts.bodySemi, color: colors.textSecondary, fontSize: 14 },
  toggleTextActive: { color: colors.ink },
  montoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.lg },
  montoSign: { fontFamily: fonts.display, fontSize: 32, marginRight: 4 },
  montoInput: { fontFamily: fonts.display, fontSize: 48, minWidth: 140, textAlign: 'center' },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  categoriasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: spacing.xs },
  categoriaItem: { width: '21%', alignItems: 'center', gap: 6 },
  categoriaCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  categoriaLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, textAlign: 'center' },
  error: { fontFamily: fonts.body, color: colors.coral, textAlign: 'center' },
});