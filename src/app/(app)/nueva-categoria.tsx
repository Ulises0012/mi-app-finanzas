import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '@/hooks/useCategories';
import { colors, radius, spacing, fonts } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

const ICONOS: (keyof typeof Ionicons.glyphMap)[] = [
  'home', 'gift', 'paw', 'school', 'airplane', 'shirt',
  'barbell', 'book', 'musical-notes', 'construct', 'card', 'phone-portrait',
];
const COLORES = ['#FF9F5A', '#5EC9E8', '#C792F2', '#FFC15E', '#FA5E6B', '#8FA6FF', '#4ADE9A', '#F2A6D8'];

export default function NuevaCategoria() {
  const { addCategoria } = useCategories();
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto');
  const [icono, setIcono] = useState<(typeof ICONOS)[number]>(ICONOS[0]);
  const [color, setColor] = useState(COLORES[0]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGuardar = async () => {
    setError('');
    if (!nombre.trim()) {
      setError('Ponle un nombre a la categoría');
      return;
    }
    setSubmitting(true);
    try {
      await addCategoria({ nombre: nombre.trim(), tipo, icono, color });
      if (router.canGoBack()) router.back();
      else router.replace('/categorias');
    } catch (e) {
      setError('Algo falló al guardar, intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Input placeholder="Nombre de la categoría" value={nombre} onChangeText={setNombre} />

      <View style={styles.toggleRow}>
        <Pressable style={[styles.toggleBtn, tipo === 'gasto' && { backgroundColor: colors.coral }]} onPress={() => setTipo('gasto')}>
          <Text style={[styles.toggleText, tipo === 'gasto' && styles.toggleTextActive]}>Gasto</Text>
        </Pressable>
        <Pressable style={[styles.toggleBtn, tipo === 'ingreso' && { backgroundColor: colors.mint }]} onPress={() => setTipo('ingreso')}>
          <Text style={[styles.toggleText, tipo === 'ingreso' && styles.toggleTextActive]}>Ingreso</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Ícono</Text>
      <View style={styles.grid}>
        {ICONOS.map((ic) => (
          <Pressable key={ic} onPress={() => setIcono(ic)} style={[styles.circle, { borderColor: icono === ic ? color : colors.line }, icono === ic && { backgroundColor: color }]}>
            <Ionicons name={ic} size={20} color={icono === ic ? colors.ink : colors.textSecondary} />
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.grid}>
        {COLORES.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]} />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ marginTop: spacing.lg }}>
        <Button label="Crear categoría" onPress={handleGuardar} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.ink },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: 48 },
  toggleRow: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface, padding: 4, borderRadius: radius.md },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.sm, alignItems: 'center' },
  toggleText: { fontFamily: fonts.bodySemi, color: colors.textSecondary, fontSize: 15 },
  toggleTextActive: { color: colors.ink },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  circle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: colors.textPrimary },
  error: { fontFamily: fonts.body, color: colors.coral, textAlign: 'center' },
});