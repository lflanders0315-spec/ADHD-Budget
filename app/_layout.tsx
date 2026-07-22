import "../src/styles/global.css";

import { useEffect, useRef } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";

import {
  setupNotifications,
  extractNotificationRouteData,
  notificationDataToRoute,
} from "@/services/notifications";
import {
  useNotificationSync,
  useSavingsNotifications,
} from "@/hooks/useNotifications";

// ---------------------------------------------------------------------------
// Query Client
// ---------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// ---------------------------------------------------------------------------
// Notification-aware inner layout
// ---------------------------------------------------------------------------

function NotificationAwareLayout() {
  const router = useRouter();

  // Sync notification schedules with store data
  useNotificationSync();
  useSavingsNotifications();

  // Track whether setup has been called (Strict Mode guard)
  const setupRan = useRef(false);
  // Track whether cold-start notification response has been handled
  const coldStartHandled = useRef(false);

  // Handle cold-start notification tap (app launched from notification)
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (lastResponse && !coldStartHandled.current) {
      coldStartHandled.current = true;
      const routeData = extractNotificationRouteData(lastResponse);
      const route = notificationDataToRoute(routeData);
      if (route) {
        setTimeout(() => {
          router.push(route as Parameters<typeof router.push>[0]);
        }, 500);
      }
    }
  }, [lastResponse, router]);

  useEffect(() => {
    if (setupRan.current) return;
    setupRan.current = true;

    // Request permissions and configure notification channel
    setupNotifications().then((granted) => {
      if (granted) {
        // After permissions are granted, do an initial reschedule
        import("@/services/notifications").then(({ rescheduleAllReminders }) => {
          rescheduleAllReminders();
        });
      }
    });

    // Listen for notification taps while the app is running
    const subscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const routeData = extractNotificationRouteData(response);
        const route = notificationDataToRoute(routeData);
        if (route) {
          // Small delay to let the navigation stack settle
          setTimeout(() => {
            router.push(route as Parameters<typeof router.push>[0]);
          }, 300);
        }
      });

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FAF9F7" },
        animation: "fade",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Root Layout
// ---------------------------------------------------------------------------

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <NotificationAwareLayout />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
