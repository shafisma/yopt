import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

export async function scheduleDailyQuizReminder(): Promise<void> {
  try {
    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Schedule daily reminder at 7 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🧠 Daily Quiz Time!",
        body: "Your daily quiz is ready! Don't lose your streak!",
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour: 19,
        minute: 0,
        repeats: true,
      },
    });
    
    console.log('Daily quiz reminder scheduled');
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

export async function scheduleStreakReminder(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔥 Don't Break Your Streak!",
        body: "You haven't taken a quiz today. Keep your learning streak alive!",
        data: { type: 'streak_reminder' },
      },
      trigger: {
        seconds: 60 * 60 * 20, // 20 hours from now
      },
    });
  } catch (error) {
    console.error('Error scheduling streak reminder:', error);
  }
}

export async function showBadgeNotification(badgeName: string, badgeIcon: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎉 New Badge Unlocked!`,
        body: `${badgeIcon} You earned the "${badgeName}" badge!`,
        data: { type: 'badge_unlock', badgeName },
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error showing badge notification:', error);
  }
}