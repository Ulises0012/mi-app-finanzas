import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, deleteField } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';

export type Recurrente = {
  id: string;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  categoryId: string;
  nota?: string;
  frecuencia: 'semanal' | 'mensual';
  proximaFecha: Timestamp;
  activo: boolean;
};

function siguienteFecha(fecha: Date, frecuencia: 'semanal' | 'mensual') {
  const next = new Date(fecha);
  if (frecuencia === 'semanal') next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

let yaProcesadoEstaSesion = false;

export function useRecurring() {
  const { user } = useAuth();
  const [recurring, setRecurring] = useState<Recurrente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecurring([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'recurring'), orderBy('proximaFecha', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecurring(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Recurrente[]);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user || loading || yaProcesadoEstaSesion) return;
    yaProcesadoEstaSesion = true;
    (async () => {
      const ahora = new Date();
      for (const r of recurring) {
        if (!r.activo) continue;
        let proxima = r.proximaFecha.toDate();
        let cambio = false;
        while (proxima <= ahora) {
          await addDoc(collection(db, 'users', user.uid, 'transactions'), {
            monto: r.monto,
            tipo: r.tipo,
            categoryId: r.categoryId,
            ...(r.nota ? { nota: r.nota } : {}),
            fecha: Timestamp.fromDate(proxima),
            recurringId: r.id,
          });
          proxima = siguienteFecha(proxima, r.frecuencia);
          cambio = true;
        }
        if (cambio) {
          await updateDoc(doc(db, 'users', user.uid, 'recurring', r.id), { proximaFecha: Timestamp.fromDate(proxima) });
        }
      }
    })();
  }, [user, loading]);

  const addRecurring = async (input: {
    monto: number; tipo: 'ingreso' | 'gasto'; categoryId: string; nota?: string; frecuencia: 'semanal' | 'mensual'; proximaFecha: Date;
  }) => {
    if (!user) throw new Error('No hay sesión activa');
    const { nota, proximaFecha, ...resto } = input;
    await addDoc(collection(db, 'users', user.uid, 'recurring'), {
      ...resto,
      ...(nota ? { nota } : {}),
      proximaFecha: Timestamp.fromDate(proximaFecha),
      activo: true,
    });
  };

  const updateRecurring = async (id: string, input: {
    monto: number; tipo: 'ingreso' | 'gasto'; categoryId: string; nota?: string; frecuencia: 'semanal' | 'mensual';
  }) => {
    if (!user) throw new Error('No hay sesión activa');
    const { nota, ...resto } = input;
    await updateDoc(doc(db, 'users', user.uid, 'recurring', id), { ...resto, nota: nota ? nota : deleteField() });
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'recurring', id), { activo });
  };

  const eliminar = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'recurring', id));
  };

  return { recurring, loading, addRecurring, updateRecurring, toggleActivo, eliminar };
}