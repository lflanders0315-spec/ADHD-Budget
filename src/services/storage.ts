import { MMKV } from "react-native-mmkv";

/**
 * Typed MMKV storage helpers.
 *
 * Usage:
 *   storage.set("onboardingComplete", true);
 *   const val = storage.getBoolean("onboardingComplete");
 */

export const storage = new MMKV({
  id: "budget-buddy-storage",
});

// ---------------------------------------------------------------------------
// Typed helpers
// ---------------------------------------------------------------------------

export const StorageKeys = {
  onboardingComplete: "onboardingComplete",
  themeMode: "themeMode",
  displayName: "displayName",
  bills: "bills",
  subscriptions: "subscriptions",
  paychecks: "paychecks",
  savingsGoals: "savingsGoals",
  spendingEntries: "spendingEntries",
  seededData: "seededData",
  // Notification preferences
  billReminders: "billReminders",
  paycheckReminders: "paycheckReminders",
  subscriptionAlerts: "subscriptionAlerts",
  savingsCelebrations: "savingsCelebrations",
  // Accessibility preferences
  largeText: "largeText",
  hapticFeedback: "hapticFeedback",
  reducedMotion: "reducedMotion",
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

export function getString(key: StorageKey): string | undefined {
  return storage.getString(key);
}

export function setString(key: StorageKey, value: string): void {
  storage.set(key, value);
}

export function getBoolean(key: StorageKey, fallback = false): boolean {
  const val = storage.getBoolean(key);
  return val !== undefined ? val : fallback;
}

export function setBoolean(key: StorageKey, value: boolean): void {
  storage.set(key, value);
}

export function getNumber(key: StorageKey): number | undefined {
  return storage.getNumber(key);
}

export function setNumber(key: StorageKey, value: number): void {
  storage.set(key, value);
}

export function getObject<T>(key: StorageKey): T | undefined {
  const raw = storage.getString(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function setObject<T>(key: StorageKey, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function remove(key: StorageKey): void {
  storage.delete(key);
}

export function clearAll(): void {
  storage.clearAll();
}
