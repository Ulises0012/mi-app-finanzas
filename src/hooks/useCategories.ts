import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/constants/categories';
import type { Categoria } from '@/constants/categories';

export type { Categoria };

export function useCategories() {
  const { user } = useAuth();
  const [personalizadas, setPersonalizadas] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPersonalizadas([]);
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'categories'), (snapshot) => {
      setPersonalizadas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Categoria[]);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addCategoria = async (input: Omit<Categoria, 'id'>) => {
    if (!user) throw new Error('No hay sesión activa');
    await addDoc(collection(db, 'users', user.uid, 'categories'), input);
  };

  return { categorias: [...DEFAULT_CATEGORIES, ...personalizadas], loading, addCategoria };
}