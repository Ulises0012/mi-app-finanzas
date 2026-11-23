import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, deleteField, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from './useTransactions';

export type Prestamo = {
  id: string;
  persona: string;
  monto: number;
  montoPendiente: number;
  fecha: Timestamp;
  notas?: string;
};

export function usePrestamos() {
  const { user } = useAuth();
  const { addTransaction } = useTransactions();
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPrestamos([]);
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'prestamos'), (snapshot) => {
      setPrestamos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Prestamo[]);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addPrestamo = async (input: { persona: string; monto: number; notas?: string }) => {
    if (!user) throw new Error('No hay sesión activa');
    const { notas, ...resto } = input;
    await addDoc(collection(db, 'users', user.uid, 'prestamos'), {
      ...resto,
      montoPendiente: input.monto,
      ...(notas ? { notas } : {}),
      fecha: serverTimestamp(),
    });
    await addTransaction({ monto: input.monto, tipo: 'gasto', categoryId: 'prestamo', nota: `Préstamo a ${input.persona}` });
  };

  const updatePrestamo = async (id: string, input: { persona: string; notas?: string }) => {
    if (!user) throw new Error('No hay sesión activa');
    const { notas, ...resto } = input;
    await updateDoc(doc(db, 'users', user.uid, 'prestamos', id), { ...resto, notas: notas ? notas : deleteField() });
  };

  const registrarAbono = async (prestamo: Prestamo, montoAbono: number) => {
    if (!user) throw new Error('No hay sesión activa');
    const nuevoPendiente = Math.max(prestamo.montoPendiente - montoAbono, 0);
    await updateDoc(doc(db, 'users', user.uid, 'prestamos', prestamo.id), { montoPendiente: nuevoPendiente });
    await addTransaction({ monto: montoAbono, tipo: 'ingreso', categoryId: 'prestamo', nota: `Abono de ${prestamo.persona}` });
  };

  const eliminarPrestamo = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'prestamos', id));
  };

  return { prestamos, loading, addPrestamo, updatePrestamo, registrarAbono, eliminarPrestamo };
}