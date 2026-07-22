import { create } from "zustand";
import { getBoolean, setBoolean, getString, setString, StorageKeys } from "@/services/storage";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeMode = "light" | "dark";

export interface AppState {
  /** Whether the user has completed onboarding */
  onboardingComplete: boolean;
  /** UI theme mode */
  themeMode: ThemeMode;
  /** Display name (set during onboarding) */
  displayName: string;

  // Notification preferences
  billReminders: boolean;
  paycheckReminders: boolean;
  subscriptionAlerts: boolean;
  savingsCelebrations: boolean;

  // Accessibility preferences
  largeText: boolean;
  hapticFeedback: boolean;
  reducedMotion: boolean;

  // Actions
  setOnboardingComplete: (value: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDisplayName: (name: string) => void;
  resetOnboarding: () => void;
  setBillReminders: (value: boolean) => void;
  setPaycheckReminders: (value: boolean) => void;
  setSubscriptionAlerts: (value: boolean) => void;
  setSavingsCelebrations: (value: boolean) => void;
  setLargeText: (value: boolean) => void;
  setHapticFeedback: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  /** Clears all user data from all stores (excludes theme/display name) */
  clearAllData: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAppStore = create<AppState>((set) => ({
  onboardingComplete: getBoolean(StorageKeys.onboardingComplete),
  themeMode: (getString(StorageKeys.themeMode) as ThemeMode) ?? "light",
  displayName: getString(StorageKeys.displayName) ?? "",

  // Notification preferences — default to true
  billReminders: getBoolean(StorageKeys.billReminders, true),
  paycheckReminders: getBoolean(StorageKeys.paycheckReminders, true),
  subscriptionAlerts: getBoolean(StorageKeys.subscriptionAlerts, true),
  savingsCelebrations: getBoolean(StorageKeys.savingsCelebrations, true),

  // Accessibility preferences — default to false
  largeText: getBoolean(StorageKeys.largeText),
  hapticFeedback: getBoolean(StorageKeys.hapticFeedback),
  reducedMotion: getBoolean(StorageKeys.reducedMotion),

  setOnboardingComplete: (value) => {
    setBoolean(StorageKeys.onboardingComplete, value);
    set({ onboardingComplete: value });
  },

  setThemeMode: (mode) => {
    setString(StorageKeys.themeMode, mode);
    set({ themeMode: mode });
  },

  setDisplayName: (name) => {
    setString(StorageKeys.displayName, name);
    set({ displayName: name });
  },

  resetOnboarding: () => {
    setBoolean(StorageKeys.onboardingComplete, false);
    set({ onboardingComplete: false, displayName: "" });
  },

  setBillReminders: (value) => {
    setBoolean(StorageKeys.billReminders, value);
    set({ billReminders: value });
  },

  setPaycheckReminders: (value) => {
    setBoolean(StorageKeys.paycheckReminders, value);
    set({ paycheckReminders: value });
  },

  setSubscriptionAlerts: (value) => {
    setBoolean(StorageKeys.subscriptionAlerts, value);
    set({ subscriptionAlerts: value });
  },

  setSavingsCelebrations: (value) => {
    setBoolean(StorageKeys.savingsCelebrations, value);
    set({ savingsCelebrations: value });
  },

  setLargeText: (value) => {
    setBoolean(StorageKeys.largeText, value);
    set({ largeText: value });
  },

  setHapticFeedback: (value) => {
    setBoolean(StorageKeys.hapticFeedback, value);
    set({ hapticFeedback: value });
  },

  setReducedMotion: (value) => {
    setBoolean(StorageKeys.reducedMotion, value);
    set({ reducedMotion: value });
  },

  clearAllData: () => {
    // Clear all bill/subscription/paycheck/savings/spending data
    // Note: we import these dynamically to avoid circular deps
    const { useBillStore } = require("./billStore");
    const { useSubscriptionStore } = require("./subscriptionStore");
    const { usePaycheckStore } = require("./paycheckStore");
    const { useSavingsStore } = require("./savingsStore");
    const { useSpendingStore } = require("./spendingStore");

    useBillStore.setState({ bills: [] });
    useSubscriptionStore.setState({ subscriptions: [] });
    usePaycheckStore.setState({ paychecks: [] });
    useSavingsStore.setState({ goals: [] });
    useSpendingStore.setState({ entries: [] });

    // Clear persisted data
    const { remove } = require("@/services/storage");
    remove(StorageKeys.bills);
    remove(StorageKeys.subscriptions);
    remove(StorageKeys.paychecks);
    remove(StorageKeys.savingsGoals);
    remove(StorageKeys.spendingEntries);
    remove(StorageKeys.seededData);
  },
}));
