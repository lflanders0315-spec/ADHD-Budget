import { useMemo } from "react";
import { useAppStore } from "@/stores/appStore";

export interface AccessibilityValues {
  /** Font scale multiplier — 1.0 normal, 1.2 when largeText enabled */
  fontScale: number;
  /** Whether haptic feedback is enabled */
  hapticEnabled: boolean;
  /** Whether to skip animations */
  reducedMotion: boolean;
}

/**
 * Returns current accessibility preferences.
 * Use this hook alongside useTheme() to apply user preferences.
 */
export function useAccessibility(): AccessibilityValues {
  const largeText = useAppStore((s) => s.largeText);
  const hapticFeedback = useAppStore((s) => s.hapticFeedback);
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  return useMemo(
    () => ({
      fontScale: largeText ? 1.2 : 1.0,
      hapticEnabled: hapticFeedback,
      reducedMotion,
    }),
    [largeText, hapticFeedback, reducedMotion]
  );
}
