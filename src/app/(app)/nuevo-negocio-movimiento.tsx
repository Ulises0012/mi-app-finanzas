import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useNegocioTransactions } from '@/hooks/useNegocioTransactions';
import { colors, radius, spacing, fonts } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function NuevoNegocioMovimiento() {
  const { addTransaction } = useNegocioTransactions();
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto');
  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const acento = tipo === 'gasto' ? colors.coral : colors.mint;

  const handleGuardar = async () => {
    setError('');
    const montoNum = parseFloat(monto.replace(',', '.'));
    if (!montoNum || montoNum <= 0) {
      setError('Ingresa un monto válido');
      return;
    }
    if (!nota.trim()) {
      setError('Describe el movimiento');
      return;
    }
    setSubmitting(true);
    try {
      await addTransaction({ monto: montoNum, tipo, nota: nota.trim() });
      if (router.canGoBack()) router.back();
      else router.replace('/negocio');
    } catch (e) {
      setError('Algo falló al guardar, intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.toggleRow}>
        <Pressable style={[styles.toggleBtn, tipo === 'gasto' && { backgroundColor: colors.coral }]} onPress={() => setTipo('gasto')}>
          <Text style={[styles.toggleText, tipo === 'gasto' && styles.toggleTextActive]}>Gasto</Text>
        </Pressable>
        <Pressable style={[styles.toggleBtn, tipo === 'ingreso' && { backgroundColor: colors.mint }]} onPress={() => setTipo('ingreso')}>
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

      <Input placeholder="¿De qué es? (ej. Material, envío)" value={nota} onChangeText={setNota} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ marginTop: spacing.lg }}>
        <Button label="Guardar" onPress={handleGuardar} loading={submitting} />
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
  montoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.lg },
  montoSign: { fontFamily: fonts.display, fontSize: 32, marginRight: 4 },
  montoInput: { fontFamily: fonts.display, fontSize: 48, minWidth: 140, textAlign: 'center' },
  error: { fontFamily: fonts.body, color: colors.coral, textAlign: 'center' },
});