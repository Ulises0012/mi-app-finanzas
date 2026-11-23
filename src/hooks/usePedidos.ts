import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useNegocioTransactions } from './useNegocioTransactions';
import { Notifications, Device } from '@/utils/notifications';

export type Pedido = {
  id: string;
  producto: string;
  monto: number;
  fechaEntrega: Timestamp;
  estado: 'pendiente' | 'entregado';
  notas?: string;
};

export function usePedidos() {
  const { user } = useAuth();
  const { addTransaction } = useNegocioTransactions();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPedidos([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'pedidos'), orderBy('fechaEntrega', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPedidos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Pedido[]);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!Notifications || !Device?.isDevice) return;
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') return;
        for (const p of pedidos) {
          const idNotif = `pedido-${p.id}`;
          await Notifications.cancelScheduledNotificationAsync(idNotif).catch(() => {});
          if (p.estado !== 'pendiente') continue;
          const recordatorio = p.fechaEntrega.toDate();
          recordatorio.setDate(recordatorio.getDate() - 1);
          recordatorio.setHours(9, 0, 0, 0);
          if (recordatorio <= new Date()) continue;
          await Notifications.scheduleNotificationAsync({
            identifier: idNotif,
            content: { title: 'Pedido próximo a entregar', body: `"${p.producto}" se entrega mañana`, sound: true },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: recordatorio },
          });
        }
      } catch (e) {
        // silencioso
      }
    })();
  }, [pedidos]);

  const addPedido = async (input: { producto: string; monto: number; fechaEntrega: Date; notas?: string }) => {
    if (!user) throw new Error('No hay sesión activa');
    const { notas, fechaEntrega, ...resto } = input;
    await addDoc(collection(db, 'users', user.uid, 'pedidos'), {
      ...resto,
      ...(notas ? { notas } : {}),
      fechaEntrega: Timestamp.fromDate(fechaEntrega),
      estado: 'pendiente',
    });
  };

  const marcarEntregado = async (pedido: Pedido) => {
    if (!user) throw new Error('No hay sesión activa');
    await updateDoc(doc(db, 'users', user.uid, 'pedidos', pedido.id), { estado: 'entregado' });
    await addTransaction({ monto: pedido.monto, tipo: 'ingreso', nota: `Pedido: ${pedido.producto}` });
  };

  const eliminarPedido = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'pedidos', id));
  };

  return { pedidos, loading, addPedido, marcarEntregado, eliminarPedido };
}