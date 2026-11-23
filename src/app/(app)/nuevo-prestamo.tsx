import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { usePrestamos } from '@/hooks/usePrestamos';
import { colors, spacing, fonts, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function NuevoPrestamo() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const esEdicion = !!id;
  const { prestamos, addPrestamo, updatePrestamo } = usePrestamos();
  const [persona, setPersona] = useState('');
  const [monto, setMonto] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cargado, setCargado] = useState(!esEdicion);

  useEffect(() => {
    if (!esEdicion || cargado) return;
    const existente = prestamos.find((p) => p.id === id);
    if (existente) {
      setPersona(existente.persona);
      setMonto(String(existente.monto));
      setNotas(existente.notas ?? '');
      setCargado(true);
    }
  }, [esEdicion, cargado, prestamos, id]);

  const handleGuardar = async () => {
    setError('');
    if (!persona.trim()) {
      setError('¿A quién le prestaste?');
      return;
    }
    setSubmitting(true);
    try {
      if (esEdicion) {
        await updatePrestamo(id!, { persona: persona.trim(), notas: notas.trim() || undefined });
      } else {
        const montoNum = parseFloat(monto.replace(',', '.'));
        if (!montoNum || montoNum <= 0) {
          setError('Ingresa un monto válido');
          setSubmitting(false);
          return;
        }
        await addPrestamo({ persona: persona.trim(), monto: montoNum, notas: notas.trim() || undefined });
      }
      if (router.canGoBack()) router.back();
      else router.replace('/prestamos');
    } catch (e) {
      setError('Algo falló al guardar, intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Input placeholder="¿A quién le prestaste?" value={persona} onChangeText={setPersona} />

      {esEdicion ? (
        <View style={styles.montoFijo}>
          <Text style={styles.montoFijoLabel}>Monto original</Text>
          <Text style={styles.montoFijoValor}>${monto}</Text>
          <Text style={styles.montoFijoNota}>No se puede cambiar una vez creado, para no descuadrar tu balance. Si te equivocaste en el monto, bórralo y créalo de nuevo.</Text>
        </View>
      ) : (
        <Input placeholder="Monto" keyboardType="decimal-pad" value={monto} onChangeText={setMonto} />
      )}

      <Input placeholder="Notas (opcional)" value={notas} onChangeText={setNotas} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ marginTop: spacing.lg }}>
        <Button label={esEdicion ? 'Guardar cambios' : 'Guardar préstamo'} onPress={handleGuardar} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.ink },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: 48 },
  montoFijo: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: 4 },
  montoFijoLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase' },
  montoFijoValor: { fontFamily: fonts.display, fontSize: 24, color: colors.textPrimary },
  montoFijoNota: { fontFamily: fonts.body, fontSize: 11, color: colors.textTertiary, marginTop: 4, lineHeight: 15 },
  error: { fontFamily: fonts.body, color: colors.coral, textAlign: 'center' },
});