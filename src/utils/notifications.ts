export let Notifications: any = null;
export let Device: any = null;
try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  // No disponible en este entorno (p. ej. Expo Go en Android) — todo lo que dependa de esto se apaga solo
}