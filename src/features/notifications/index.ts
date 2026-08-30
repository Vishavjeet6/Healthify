import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import { APP_NAME } from '../../constants/brand';

const REMINDER_IDENTIFIER = 'daily-session-reminder';

/**
 * expo-notifications throws on import on Android inside Expo Go (SDK 53+
 * removed push support there, and the module registers a push listener as
 * a side effect just by being imported). We only use local notifications,
 * so skip the module entirely in that environment rather than crash.
 *
 * On web, local scheduling (schedule/cancel/getAllScheduled/requestPermissions)
 * has no implementation at all — every call throws "not available on web" —
 * so it's unavailable there too.
 */
const NOTIFICATIONS_UNAVAILABLE =
  Platform.OS === 'web' || (Platform.OS === 'android' && isRunningInExpoGo());

let notificationsModule: Promise<typeof import('expo-notifications')> | null = null;
function loadNotifications() {
  if (!notificationsModule) {
    notificationsModule = import('expo-notifications').then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      return Notifications;
    });
  }
  return notificationsModule;
}

/**
 * Local, scheduled only — remote push needs a dev build. Copy is
 * deliberately discreet: readable over a stranger's shoulder without
 * embarrassment. See IMPLEMENTATION_PLAN.md feature 11.
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (NOTIFICATIONS_UNAVAILABLE) return false;
  const Notifications = await loadNotifications();

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
  if (NOTIFICATIONS_UNAVAILABLE) return;
  const Notifications = await loadNotifications();
  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});
}

export async function isReminderScheduled(): Promise<boolean> {
  if (NOTIFICATIONS_UNAVAILABLE) return false;
  const Notifications = await loadNotifications();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === REMINDER_IDENTIFIER);
}
