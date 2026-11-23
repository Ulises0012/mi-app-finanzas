import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export type Meta = {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
};

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'goals'), (snapshot) => {
      setGoals(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Meta[]);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addGoal = async (input: { nombre: string; montoObjetivo: number; icono: keyof typeof Ionicons.glyphMap; color: string }) => {
    if (!user) throw new Error('No hay sesión activa');
    await addDoc(collection(db, 'users', user.uid, 'goals'), { ...input, montoActual: 0 });
  };

  const addContribution = async (goalId: string, monto: number) => {
    if (!user) throw new Error('No hay sesión activa');
    await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), { montoActual: increment(monto) });
  };

  const eliminar = async (goalId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'goals', goalId));
  };

  return { goals, loading, addGoal, addContribution, eliminar };
}