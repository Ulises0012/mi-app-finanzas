import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';

export type Perfil = {
  nombre: string;
  email: string;
  moneda: string;
  tieneNegocio?: boolean;
};

export function useProfile() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPerfil(null);
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setPerfil(snap.data() as Perfil);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const activarNegocio = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { tieneNegocio: true });
  };

  return { perfil, loading, activarNegocio };
}