import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';

export function useBudgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBudgets({});
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'budgets'), (snapshot) => {
      const map: Record<string, number> = {};
      snapshot.docs.forEach((d) => {
        map[d.id] = d.data().limite;
      });
      setBudgets(map);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const setBudget = async (categoryId: string, limite: number) => {
    if (!user) throw new Error('No hay sesión activa');
    await setDoc(doc(db, 'users', user.uid, 'budgets', categoryId), { limite });
  };

  return { budgets, loading, setBudget };
}