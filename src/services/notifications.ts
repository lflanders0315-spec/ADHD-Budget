import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useAppStore } from "@/stores/appStore";
import type { Bill, Paycheck, Subscription, SavingsGoal } from "@/models";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NOTIFICATION_PREFIX = "budgetbuddy";

/** Channel ID for Android — calm, low-importance notifications */
const ANDROID_CHANNEL_ID = "budgetbuddy-reminders";

/** Types of notifications we support */
type NotificationItemType = "bill" | "paycheck" | "subscription" | "savings";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a deterministic notification identifier */
function notifId(type: NotificationItemType, id: string): string {
  return `${NOTIFICATION_PREFIX}-${type}-${id}`;
}

/**
 * Compute the next calendar occurrence of a day-of-month.
 * E.g. if today is July 22 and dueDay is 5, returns August 5 at 9am.
 */
function nextDueDate(dayOfMonth: number, hour = 9): Date {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, hour, 0, 0);

  // If the candidate is today or in the past, push to next month
  if (candidate <= now) {
    candidate.setMonth(candidate.getMonth() + 1);
  }

  return candidate;
}

/** Get trigger date for bill reminder: day before the due date at 9am */
function billTriggerDate(dueDay: number): Date {
  let dayBefore = dueDay - 1;
  if (dayBefore < 1) dayBefore = 28; // wrap last-day-of-month edge case

  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), dayBefore, 9, 0, 0);

  if (candidate <= now) {
    candidate.setMonth(candidate.getMonth() + 1);
  }

  return candidate;
}

/** Get trigger date for paycheck reminder: day before pay date at 9am */
function paycheckTriggerDate(payDateStr: string): Date {
  const payDate = new Date(payDateStr);
  const trigger = new Date(payDate);
  trigger.setDate(trigger.getDate() - 1);
  trigger.setHours(9, 0, 0, 0);

  // If the trigger is already past, don't schedule (it'll be rescheduled on next update)
  // We still return the date — the scheduling function will skip past dates.
  return trigger;
}

/** Get trigger date for subscription reminder: 3 days before renewal at 10am */
function subTriggerDate(nextBillingStr: string): Date {
  const billingDate = new Date(nextBillingStr);
  const trigger = new Date(billingDate);
  trigger.setDate(trigger.getDate() - 3);
  trigger.setHours(10, 0, 0, 0);
  return trigger;
}

/** Check if a date is in the future (with 1-minute buffer) */
function isFutureDate(d: Date): boolean {
  return d.getTime() > Date.now() - 60_000;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

/**
 * Configure how notifications behave when the app is in the foreground.
 * Gentle: show a banner but don't play a sound or badge.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions and set up the Android notification channel.
 * Call once on app mount. Safe to call multiple times — idempotent.
 */
export async function setupNotifications(): Promise<boolean> {
  try {
    // Request permissions (iOS provisional auth where available)
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: false,
        provideAppNotificationSettings: false,
        allowProvisional: true,
      },
    });

    if (status !== "granted") {
      console.log("[Notifications] Permission not granted:", status);
      return false;
    }

    // Android: create a low-importance notification channel (gentle)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: "Reminders",
        description: "Friendly bill, pay, and subscription reminders",
        importance: Notifications.AndroidImportance.LOW,
        sound: null, // no sound for gentle reminders
        vibrationPattern: null,
        enableVibrate: false,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      });
    }

    console.log("[Notifications] Setup complete, permissions granted");
    return true;
  } catch (error) {
    console.error("[Notifications] Setup error:", error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Scheduling helpers
// ---------------------------------------------------------------------------

/**
 * Schedule a local notification with the given content and trigger date.
 * Returns the notification identifier, or null if scheduling failed or
 * the trigger date is in the past.
 */
async function schedule(
  identifier: string,
  title: string,
  body: string,
  triggerDate: Date,
  data: { type: NotificationItemType; id: string },
): Promise<string | null> {
  if (!isFutureDate(triggerDate)) return null;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        data: data as unknown as Record<string, unknown>,
        sound: null,
        ...(Platform.OS === "android"
          ? { channelId: ANDROID_CHANNEL_ID }
          : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return identifier;
  } catch (error) {
    console.error(`[Notifications] Failed to schedule ${identifier}:`, error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Individual schedulers
// ---------------------------------------------------------------------------

/**
 * Schedule a bill reminder for the day before the bill is due.
 */
export async function scheduleBillReminder(bill: Bill): Promise<void> {
  const prefs = useAppStore.getState();
  if (!prefs.billReminders) return;

  // Cancel any existing notification for this bill
  await cancelAllFor("bill", bill.id);

  const trigger = billTriggerDate(bill.dueDate);
  await schedule(
    notifId("bill", bill.id),
    "Bill due tomorrow 💳",
    `${bill.name} — $${bill.amount.toFixed(2)} is due tomorrow`,
    trigger,
    { type: "bill", id: bill.id },
  );
}

/**
 * Schedule a paycheck reminder for the day before pay day.
 */
export async function schedulePaycheckReminder(
  paycheck: Paycheck,
): Promise<void> {
  const prefs = useAppStore.getState();
  if (!prefs.paycheckReminders) return;

  await cancelAllFor("paycheck", paycheck.id);

  const trigger = paycheckTriggerDate(paycheck.nextPayDate);
  await schedule(
    notifId("paycheck", paycheck.id),
    "Payday tomorrow! 💰",
    `$${paycheck.netPay.toFixed(2)} from ${paycheck.employer} arrives tomorrow`,
    trigger,
    { type: "paycheck", id: paycheck.id },
  );
}

/**
 * Schedule a subscription renewal reminder 3 days before.
 */
export async function scheduleSubscriptionReminder(
  subscription: Subscription,
): Promise<void> {
  const prefs = useAppStore.getState();
  if (!prefs.subscriptionAlerts) return;

  // Only schedule for active subscriptions with cancellation reminders enabled
  if (!subscription.active) return;

  await cancelAllFor("subscription", subscription.id);

  const trigger = subTriggerDate(subscription.nextBillingDate);
  await schedule(
    notifId("subscription", subscription.id),
    "Subscription renewing soon 🔄",
    `${subscription.name} renews in 3 days — $${subscription.amount.toFixed(2)}`,
    trigger,
    { type: "subscription", id: subscription.id },
  );
}

/**
 * Immediately show a celebration notification when a savings milestone is reached.
 */
export async function scheduleSavingsMilestone(
  goal: SavingsGoal,
  milestonePercent: number,
): Promise<void> {
  const prefs = useAppStore.getState();
  if (!prefs.savingsCelebrations) return;

  const identifier = notifId("savings", `${goal.id}-milestone-${milestonePercent}`);

  await schedule(
    identifier,
    "Milestone reached! 🎉",
    `You've hit ${milestonePercent}% of your ${goal.name} goal!`,
    new Date(Date.now() + 1000), // 1 second from now — effectively immediate
    { type: "savings", id: goal.id },
  );
}

// ---------------------------------------------------------------------------
// Cancel helpers
// ---------------------------------------------------------------------------

/**
 * Cancel all scheduled notifications matching a type and ID prefix.
 * Because we use deterministic identifiers, we can cancel directly.
 */
export async function cancelAllFor(
  type: NotificationItemType,
  id: string,
): Promise<void> {
  try {
    // Cancel the primary notification
    await Notifications.cancelScheduledNotificationAsync(notifId(type, id));

    // For savings, also cancel any milestone notifications
    if (type === "savings") {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const n of allScheduled) {
        if (
          n.identifier.startsWith(`${NOTIFICATION_PREFIX}-savings-${id}`)
        ) {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
      }
    }
  } catch (error) {
    console.error(`[Notifications] Failed to cancel for ${type}/${id}:`, error);
  }
}

/**
 * Cancel all Budget Buddy notifications (used before full reschedule).
 */
async function cancelAllBudgetBuddyNotifications(): Promise<void> {
  try {
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of allScheduled) {
      if (n.identifier.startsWith(NOTIFICATION_PREFIX)) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch (error) {
    console.error("[Notifications] Failed to cancel all:", error);
  }
}

// ---------------------------------------------------------------------------
// Bulk reschedule
// ---------------------------------------------------------------------------

/**
 * Reschedule all reminders based on current store data and preferences.
 * Call after seed data loads or when user modifies bills/paychecks/subscriptions.
 */
export async function rescheduleAllReminders(): Promise<void> {
  // Check permissions first — skip if not granted
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  // Cancel everything first, then schedule fresh
  await cancelAllBudgetBuddyNotifications();

  // Import stores lazily to avoid circular deps at module level
  const { useBillStore } = await import("@/stores/billStore");
  const { usePaycheckStore } = await import("@/stores/paycheckStore");
  const { useSubscriptionStore } = await import("@/stores/subscriptionStore");

  const bills = useBillStore.getState().bills;
  const paychecks = usePaycheckStore.getState().paychecks;
  const subscriptions = useSubscriptionStore.getState().subscriptions;

  // Schedule bill reminders (only for unpaid bills)
  for (const bill of bills) {
    if (bill.status !== "paid") {
      await scheduleBillReminder(bill);
    }
  }

  // Schedule paycheck reminders
  for (const paycheck of paychecks) {
    await schedulePaycheckReminder(paycheck);
  }

  // Schedule subscription reminders
  for (const sub of subscriptions) {
    await scheduleSubscriptionReminder(sub);
  }

  console.log(
    `[Notifications] Rescheduled: ${bills.length} bills, ${paychecks.length} paychecks, ${subscriptions.length} subscriptions`,
  );
}

// ---------------------------------------------------------------------------
// Navigation data extraction
// ---------------------------------------------------------------------------

export type NotificationRouteData = {
  type: NotificationItemType;
  id: string;
} | null;

/** Extract routing data from a notification response */
export function extractNotificationRouteData(
  response: Notifications.NotificationResponse | null,
): NotificationRouteData {
  if (!response) return null;

  const data = response.notification.request.content.data;
  if (!data || typeof data !== "object") return null;

  const typed = data as { type?: string; id?: string };
  if (
    typed.type &&
    ["bill", "paycheck", "subscription", "savings"].includes(typed.type) &&
    typed.id
  ) {
    return { type: typed.type as NotificationItemType, id: typed.id };
  }

  return null;
}

/**
 * Build a route path from notification data for expo-router navigation.
 */
export function notificationDataToRoute(data: NotificationRouteData): string | null {
  if (!data) return null;

  switch (data.type) {
    case "bill":
      return `/bills/${data.id}`;
    case "paycheck":
      return `/paychecks/${data.id}`;
    case "subscription":
      return `/subscriptions/${data.id}`;
    case "savings":
      return `/savings/${data.id}`;
    default:
      return null;
  }
}
