import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { registerForPushNotificationsAsync, scheduleDailyQuizReminder } from '@/services/notifications';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Initialize notifications
    registerForPushNotificationsAsync();
    scheduleDailyQuizReminder();
  }, []);

  return (
    <ThemeProvider>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </>
    </ThemeProvider>
  );
}
