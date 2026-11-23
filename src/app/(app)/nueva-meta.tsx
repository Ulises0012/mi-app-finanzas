import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '@/hooks/useGoals';
import { colors, radius, spacing, fonts } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

const ICONOS: (keyof typeof Ionicons.glyphMap)[] = ['flag', 'airplane', 'home', 'car', 'laptop', 'gift', 'school', 'heart'];
const COLORES = ['#FF9F5A', '#5EC9E8', '#C792F2', '#FFC15E', '#FA5E6B', '#8FA6FF', '#4ADE9A', '#F2A6D8'];

export default function NuevaMeta() {
  const { addGoal } = useGoals();
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [icono, setIcono] = useState<(typeof ICONOS)[number]>(ICONOS[0]);
  const [color, setColor] = useState(COLORES[0]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGuardar = async () => {
    setError('');
    if (!nombre.trim()) {
      setError('Ponle un nombre a tu meta');
      return;
    }
    const montoNum = parseFloat(monto.replace(',', '.'));
    if (!montoNum || montoNum <= 0) {
      setError('Ingresa un monto objetivo válido');
      return;
    }
    setSubmitting(true);
    try {
      await addGoal({ nombre: nombre.trim(), montoObjetivo: montoNum, icono, color });
      if (router.canGoBack()) router.back();
      else router.replace('/metas');
    } catch (e) {
      setError('Algo falló al guardar, intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Input placeholder="¿Para qué estás ahorrando?" value={nombre} onChangeText={setNombre} />
      <Input placeholder="Monto objetivo" keyboardType="decimal-pad" value={monto} onChangeText={setMonto} />

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
        <Button label="Crear meta" onPress={handleGuardar} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.ink },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: 48 },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  circle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: colors.textPrimary },
  error: { fontFamily: fonts.body, color: colors.coral, textAlign: 'center' },
});