import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, deleteField, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';

export type Transaction = {
  id: string;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  categoryId: string;
  nota?: string;
  fecha: Timestamp;
};

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'transactions'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Transaction[]);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addTransaction = async (input: { monto: number; tipo: 'ingreso' | 'gasto'; categoryId: string; nota?: string }) => {
    if (!user) throw new Error('No hay sesión activa');
    const { nota, ...resto } = input;
    await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      ...resto,
      ...(nota ? { nota } : {}),
      fecha: serverTimestamp(),
    });
  };

  const updateTransaction = async (id: string, input: { monto: number; tipo: 'ingreso' | 'gasto'; categoryId: string; nota?: string }) => {
    if (!user) throw new Error('No hay sesión activa');
    await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
      monto: input.monto,
      tipo: input.tipo,
      categoryId: input.categoryId,
      nota: input.nota ? input.nota : deleteField(),
    });
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('No hay sesión activa');
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  };

  const balance = transactions.reduce((acc, t) => acc + (t.tipo === 'ingreso' ? t.monto : -t.monto), 0);

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction, balance };
}