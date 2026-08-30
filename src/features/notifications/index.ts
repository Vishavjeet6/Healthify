import * as Notifications from 'expo-notifications';

import { APP_NAME } from '../../constants/brand';

const REMINDER_IDENTIFIER = 'daily-session-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Local, scheduled only — remote push needs a dev build. Copy is
 * deliberately discreet: readable over a stranger's shoulder without
 * embarrassment. See IMPLEMENTATION_PLAN.md feature 11.
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;

  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDENTIFIER,
    content: {
      title: APP_NAME,
      body: "Time for today's session.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return true;
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});
}

export async function isReminderScheduled(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === REMINDER_IDENTIFIER);
}
