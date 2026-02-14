import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleSessionReminder(endsAt: Date, meterCode?: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const reminderAt = new Date(endsAt);
  reminderAt.setMinutes(reminderAt.getMinutes() - 5);

  if (reminderAt > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Parking reminder',
        body: meterCode
          ? `Your session at ${meterCode} ends in 5 minutes.`
          : 'Your parking session ends in 5 minutes.',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderAt },
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Parking session ended',
      body: meterCode
        ? `Session at ${meterCode} has expired.`
        : 'Your parking session has expired.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: endsAt },
  });
}

export async function scheduleReservationReminder(
  expiresAt: Date,
  location?: string
): Promise<void> {
  if (Platform.OS === 'web') return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const reminderAt = new Date(expiresAt);
  reminderAt.setHours(reminderAt.getHours() - 1);

  if (reminderAt > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reservation reminder',
        body: location
          ? `Your reservation at ${location} expires in 1 hour.`
          : 'Your parking reservation expires in 1 hour.',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderAt },
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Reservation expired',
      body: location
        ? `Reservation at ${location} has expired. Overtime charges may apply until checkout.`
        : 'Your reservation has expired. Overtime charges may apply until checkout.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: expiresAt },
  });
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
