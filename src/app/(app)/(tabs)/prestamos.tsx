import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePrestamos, Prestamo } from '@/hooks/usePrestamos';
import { colors, radius, spacing, fonts } from '@/constants/theme';
import { Button } from '@/components/Button';

export default function Prestamos() {
  const { prestamos, registrarAbono, eliminarPrestamo } = usePrestamos();
  const [prestamoActivo, setPrestamoActivo] = useState<Prestamo | null>(null);
  const [abono, setAbono] = useState('');

  const pendientes = prestamos.filter((p) => p.montoPendiente > 0);
  const pagados = prestamos.filter((p) => p.montoPendiente <= 0);
  const totalPrestado = pendientes.reduce((s, p) => s + p.montoPendiente, 0);

  const handleAbonar = async () => {
    if (!prestamoActivo) return;
    const monto = parseFloat(abono.replace(',', '.'));
    if (!monto || monto <= 0) return;
    await registrarAbono(prestamoActivo, Math.min(monto, prestamoActivo.montoPendiente));
    setAbono('');
    setPrestamoActivo(null);
  };

  const handleEliminar = (p: Prestamo) => {
    Alert.alert(`¿Eliminar préstamo a ${p.persona}?`, 'No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminarPrestamo(p.id) },
    ]);
  };

  const fila = (p: Prestamo) => {
    const pagado = p.montoPendiente <= 0;
    const progreso = 1 - p.montoPendiente / p.monto;
    return (
      <View key={p.id} style={styles.card}>
        <View style={styles.cardHead}>
          <View style={[styles.badge, { backgroundColor: (pagado ? colors.mint : colors.gold) + '26' }]}>
            <Ionicons name="person" size={18} color={pagado ? colors.mint : colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.persona}>{p.persona}</Text>
            <Text style={styles.montos}>
              {pagado ? 'Pagado por completo' : `$${p.montoPendiente.toFixed(2)} pendiente de $${p.monto.toFixed(2)}`}
            </Text>
          </View>
          <Pressable onPress={() => router.push({ pathname: '/nuevo-prestamo', params: { id: p.id } })} hitSlop={8}>
            <Ionicons name="pencil-outline" size={16} color={colors.textTertiary} />
          </Pressable>
          <Pressable onPress={() => handleEliminar(p)} hitSlop={8} style={{ marginLeft: 14 }}>
            <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
          </Pressable>
        </View>
        {!pagado && (
          <>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${progreso * 100}%` }]} />
            </View>
            <Pressable onPress={() => setPrestamoActivo(p)} style={styles.abonarBtn}>
              <Ionicons name="add-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.abonarText}>Registrar abono</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Préstamos</Text>
        {totalPrestado > 0 && <Text style={styles.subtitle}>Te deben en total ${totalPrestado.toFixed(2)}</Text>}

        <Text style={styles.sectionLabel}>Pendientes ({pendientes.length})</Text>
        {pendientes.length === 0 ? <Text style={styles.emptyMini}>Nadie te debe nada ahora mismo</Text> : pendientes.map(fila)}

        {pagados.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Pagados</Text>
            {pagados.map(fila)}
          </>
        )}
      </ScrollView>

      <Pressable onPress={() => router.push('/nuevo-prestamo')} style={styles.fabWrap}>
        <View style={styles.fab}>
          <Ionicons name="add" size={30} color={colors.ink} />
        </View>
      </Pressable>

      <Modal visible={!!prestamoActivo} transparent animationType="fade" onRequestClose={() => setPrestamoActivo(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Abono de {prestamoActivo?.persona}</Text>
            <Text style={styles.modalSubtitle}>Pendiente: ${prestamoActivo?.montoPendiente.toFixed(2)}</Text>
            <TextInput style={styles.modalInput} placeholder="$0.00" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" value={abono} onChangeText={setAbono} autoFocus />
            <View style={styles.modalActions}>
              <Pressable onPress={() => { setPrestamoActivo(null); setAbono(''); }} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Button label="Registrar" onPress={handleAbonar} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  container: { padding: spacing.lg, paddingTop: 64, paddingBottom: 120 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.gold, marginBottom: spacing.md },
  sectionLabel: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  emptyMini: { fontFamily: fonts.body, fontSize: 13, color: colors.textTertiary, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  persona: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textPrimary },
  montos: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: colors.gold },
  abonarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  abonarText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  fabWrap: { position: 'absolute', right: spacing.lg, bottom: 20, shadowColor: colors.gold, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  fab: { width: 60, height: 60, borderRadius: radius.pill, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.lg },
  modalBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  modalTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.textPrimary },
  modalSubtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: -8 },
  modalInput: { fontFamily: fonts.display, fontSize: 32, color: colors.textPrimary, textAlign: 'center', backgroundColor: colors.surfaceHigh, borderRadius: radius.md, paddingVertical: spacing.md },
  modalActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  modalCancel: { paddingVertical: 14, paddingHorizontal: 16 },
  modalCancelText: { fontFamily: fonts.bodyMedium, color: colors.textSecondary, fontSize: 15 },
});