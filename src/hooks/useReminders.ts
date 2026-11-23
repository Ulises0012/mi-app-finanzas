import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Notifications, Device } from '@/utils/notifications';

const RECORDATORIOS = [
  { id: 'recordatorio-mediodia', hour: 13, minute: 0, body: '¿Ya registraste algún gasto hoy? Toma 10 segundos.' },
  { id: 'recordatorio-noche', hour: 20, minute: 30, body: 'Antes de dormir: ¿algo que registrar del día de hoy?' },
];

export function useReminders() {
  const { user } = useAuth();

  useEffect(() => {
    if (!Notifications) return;
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/nueva-transaccion');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!user || !Notifications || !Device?.isDevice) return;
    (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('recordatorios', {
            name: 'Recordatorios',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
        const { status: existente } = await Notifications.getPermissionsAsync();
        let status = existente;
        if (status !== 'granted') {
          const { status: nuevo } = await Notifications.requestPermissionsAsync();
          status = nuevo;
        }
        if (status !== 'granted') return;

        for (const r of RECORDATORIOS) {
          await Notifications.cancelScheduledNotificationAsync(r.id).catch(() => {});
          await Notifications.scheduleNotificationAsync({
            identifier: r.id,
            content: { title: 'Finanzas', body: r.body, sound: true },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: r.hour, minute: r.minute },
          });
        }
      } catch (e) {
        // silencioso
      }
    })();
  }, [user]);
}