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

  // Actions
  setOnboardingComplete: (value: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDisplayName: (name: string) => void;
  resetOnboarding: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAppStore = create<AppState>((set) => ({
  onboardingComplete: getBoolean(StorageKeys.onboardingComplete),
  themeMode: (getString(StorageKeys.themeMode) as ThemeMode) ?? "light",
  displayName: getString(StorageKeys.displayName) ?? "",

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
}));
