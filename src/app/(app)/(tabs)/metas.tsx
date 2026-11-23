import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGoals, Meta } from '@/hooks/useGoals';
import { colors, radius, spacing, fonts } from '@/constants/theme';
import { Button } from '@/components/Button';

export default function Metas() {
  const { goals, addContribution, eliminar } = useGoals();
  const [metaActiva, setMetaActiva] = useState<Meta | null>(null);
  const [aporte, setAporte] = useState('');

  const handleAportar = async () => {
    if (!metaActiva) return;
    const monto = parseFloat(aporte.replace(',', '.'));
    if (!monto || monto <= 0) return;
    await addContribution(metaActiva.id, monto);
    setAporte('');
    setMetaActiva(null);
  };

  const handleEliminar = (meta: Meta) => {
    Alert.alert(`¿Eliminar "${meta.nombre}"?`, 'Perderás el progreso guardado. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(meta.id) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Metas de ahorro</Text>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={40} color={colors.textTertiary} />
            <Text style={styles.empty}>Aún no tienes metas de ahorro</Text>
          </View>
        ) : (
          goals.map((meta) => {
            const progreso = Math.min(meta.montoActual / meta.montoObjetivo, 1);
            const completa = meta.montoActual >= meta.montoObjetivo;
            return (
              <View key={meta.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={[styles.badge, { backgroundColor: meta.color + '26' }]}>
                    <Ionicons name={meta.icono} size={20} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{meta.nombre}</Text>
                    <Text style={styles.cardAmount}>${meta.montoActual.toFixed(2)} de ${meta.montoObjetivo.toFixed(2)}</Text>
                  </View>
                  {completa && <Ionicons name="checkmark-circle" size={22} color={colors.mint} style={{ marginRight: 4 }} />}
                  <Pressable onPress={() => handleEliminar(meta)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
                  </Pressable>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${progreso * 100}%`, backgroundColor: completa ? colors.mint : meta.color }]} />
                </View>
                {!completa && (
                  <Pressable onPress={() => setMetaActiva(meta)} style={styles.aportarBtn}>
                    <Ionicons name="add-circle-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.aportarText}>Agregar aporte</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Pressable onPress={() => router.push('/nueva-meta')} style={styles.fabWrap}>
        <View style={styles.fab}>
          <Ionicons name="add" size={30} color={colors.ink} />
        </View>
      </Pressable>

      <Modal visible={!!metaActiva} transparent animationType="fade" onRequestClose={() => setMetaActiva(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Aportar a "{metaActiva?.nombre}"</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="$0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              value={aporte}
              onChangeText={setAporte}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => { setMetaActiva(null); setAporte(''); }} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Button label="Aportar" onPress={handleAportar} />
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
  container: { padding: spacing.lg, paddingTop: 64, paddingBottom: 120, gap: spacing.md },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary, marginBottom: spacing.sm },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  empty: { fontFamily: fonts.body, color: colors.textTertiary, fontSize: 14 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.textPrimary },
  cardAmount: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2, fontVariant: ['tabular-nums'] },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  aportarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  aportarText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  fabWrap: { position: 'absolute', right: spacing.lg, bottom: 20, shadowColor: colors.coral, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  fab: { width: 60, height: 60, borderRadius: radius.pill, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.lg },
  modalBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  modalTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.textPrimary },
  modalInput: { fontFamily: fonts.display, fontSize: 32, color: colors.textPrimary, textAlign: 'center', backgroundColor: colors.surfaceHigh, borderRadius: radius.md, paddingVertical: spacing.md },
  modalActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  modalCancel: { paddingVertical: 14, paddingHorizontal: 16 },
  modalCancelText: { fontFamily: fonts.bodyMedium, color: colors.textSecondary, fontSize: 15 },
});