import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePedidos } from '@/hooks/usePedidos';
import { colors, radius, spacing, fonts } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function NuevoPedido() {
  const { addPedido } = usePedidos();
  const [producto, setProducto] = useState('');
  const [monto, setMonto] = useState('');
  const [notas, setNotas] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGuardar = async () => {
    setError('');
    if (!producto.trim()) {
      setError('Describe el producto o pedido');
      return;
    }
    const montoNum = parseFloat(monto.replace(',', '.'));
    if (!montoNum || montoNum <= 0) {
      setError('Ingresa un monto válido');
      return;
    }
    setSubmitting(true);
    try {
      await addPedido({ producto: producto.trim(), monto: montoNum, fechaEntrega: fecha, notas: notas.trim() || undefined });
      if (router.canGoBack()) router.back();
      else router.replace('/negocio/pedidos');
    } catch (e) {
      setError('Algo falló al guardar, intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Input placeholder="Producto o pedido" value={producto} onChangeText={setProducto} />
      <Input placeholder="Monto a cobrar" keyboardType="decimal-pad" value={monto} onChangeText={setMonto} />

      <Pressable onPress={() => setMostrarPicker(true)} style={styles.dateButton}>
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.dateButtonText}>
          {fecha.toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </Pressable>
      {mostrarPicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selectedDate) => {
            setMostrarPicker(Platform.OS === 'ios');
            if (selectedDate) setFecha(selectedDate);
          }}
        />
      )}

      <Input placeholder="Notas (opcional)" value={notas} onChangeText={setNotas} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ marginTop: spacing.lg }}>
        <Button label="Guardar pedido" onPress={handleGuardar} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.ink },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: 48 },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceHigh, borderRadius: radius.md, padding: 14 },
  dateButtonText: { fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary },
  error: { fontFamily: fonts.body, color: colors.coral, textAlign: 'center' },
});