import { useMemo } from "react";
import { useAppStore } from "@/stores/appStore";
import {
  lightColors,
  darkColors,
  spacing,
  borderRadius,
  fontSize,
  createShadows,
} from "@/constants/theme";
import type { ThemeColors } from "@/constants/theme";

export interface ThemeValues {
  /** Current color palette */
  colors: ThemeColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  fontSize: typeof fontSize;
  /** Shadows factory — returns RN shadow style for the current theme */
  shadow: ReturnType<typeof createShadows>;
  /** Whether dark mode is active */
  isDark: boolean;
}

/**
 * Returns the current theme values based on the persisted themeMode setting.
 * Use this hook anywhere you need themed colors.
 */
export function useTheme(): ThemeValues {
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === "dark";

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);
  const shadow = useMemo(() => createShadows(colors), [colors]);

  return useMemo(
    () => ({
      colors,
      spacing,
      borderRadius,
      fontSize,
      shadow,
      isDark,
    }),
    [colors, shadow, isDark]
  );
}
