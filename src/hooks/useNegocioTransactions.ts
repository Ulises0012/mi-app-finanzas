import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';

export type NegocioTransaction = {
  id: string;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  nota: string;
  fecha: Timestamp;
};

export function useNegocioTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<NegocioTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'negocioTransactions'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as NegocioTransaction[]);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addTransaction = async (input: { monto: number; tipo: 'ingreso' | 'gasto'; nota: string }) => {
    if (!user) throw new Error('No hay sesión activa');
    await addDoc(collection(db, 'users', user.uid, 'negocioTransactions'), { ...input, fecha: serverTimestamp() });
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'negocioTransactions', id));
  };

  const balance = transactions.reduce((acc, t) => acc + (t.tipo === 'ingreso' ? t.monto : -t.monto), 0);

  return { transactions, loading, addTransaction, deleteTransaction, balance };
}