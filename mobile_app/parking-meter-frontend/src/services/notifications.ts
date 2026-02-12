import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleSessionReminder(endsAt: Date, meterCode?: string): Promise<void> {
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
      trigger: { date: reminderAt },
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Parking session ended',
      body: meterCode
        ? `Session at ${meterCode} has expired.`
        : 'Your parking session has expired.',
    },
    trigger: { date: endsAt },
  });
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
