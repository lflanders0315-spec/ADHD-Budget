/**
 * Budget Buddy ADHD — Theme Constants
 *
 * Calm, ADHD-friendly design tokens.
 * Every screen answers: "What is the next thing I need to do?"
 */

export const lightColors = {
  // Backgrounds
  background: "#FAF9F7",
  surface: "#FFFFFF",
  surfaceMuted: "#F5F3F0",

  // Primary greens — calm, reassuring
  primary: "#5B8C5A",
  primaryLight: "#E8F5E8",
  primaryDark: "#3D6B3C",

  // Warm accent — gentle yellow/amber
  accent: "#F0A04B",
  accentLight: "#FFF3E5",

  // Bill status
  statusPaid: "#7CB77C",
  statusDue: "#F0A04B",
  statusOverdue: "#E07A6E",
  statusUpcoming: "#8CB8D8",

  // Text
  textPrimary: "#2C2C2C",
  textSecondary: "#6B6B6B",
  textMuted: "#A0A0A0",
  textInverse: "#FFFFFF",

  // Borders
  border: "#E8E5E0",
  borderLight: "#F0EDE8",

  // Semantic
  success: "#7CB77C",
  warning: "#F0A04B",
  danger: "#E07A6E",
  info: "#8CB8D8",

  // Shadows (light mode uses black with low opacity)
  shadowColor: "#000000",
  shadowOpacitySm: 0.05,
  shadowOpacityMd: 0.08,
  shadowOpacityLg: 0.1,
} as const;

export const darkColors = {
  // Backgrounds — deep gray, not pure black
  background: "#1A1A1E",
  surface: "#2C2C2E",
  surfaceMuted: "#3A3A3C",

  // Primary greens — slightly brighter for dark bg
  primary: "#6FA86D",
  primaryLight: "#2D4A2C",
  primaryDark: "#8FC88D",

  // Warm accent — gentle yellow/amber
  accent: "#F0A04B",
  accentLight: "#3D3020",

  // Bill status — slightly softened for dark
  statusPaid: "#7CB77C",
  statusDue: "#F0A04B",
  statusOverdue: "#E07A6E",
  statusUpcoming: "#8CB8D8",

  // Text
  textPrimary: "#E5E5E5",
  textSecondary: "#A0A0A0",
  textMuted: "#6B6B6B",
  textInverse: "#1A1A1E",

  // Borders
  border: "#3A3A3C",
  borderLight: "#48484A",

  // Semantic
  success: "#7CB77C",
  warning: "#F0A04B",
  danger: "#E07A6E",
  info: "#8CB8D8",

  // Shadows (dark mode — less shadow, more subtle)
  shadowColor: "#000000",
  shadowOpacitySm: 0.15,
  shadowOpacityMd: 0.2,
  shadowOpacityLg: 0.25,
} as const;

// Default export (light colors) for backward compatibility
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  touch: 48,
} as const;

export const borderRadius = {
  sm: 12,
  DEFAULT: 16,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
} as const;

// Static shadow objects — light mode defaults (for backward compatibility)
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

/**
 * Creates shadow style objects using the provided shadow color and opacity.
 * Use with useTheme() colors for theme-aware shadows.
 */
export function createShadows(colors: typeof lightColors) {
  return {
    sm: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 } as const,
      shadowOpacity: colors.shadowOpacitySm,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 } as const,
      shadowOpacity: colors.shadowOpacityMd,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 } as const,
      shadowOpacity: colors.shadowOpacityLg,
      shadowRadius: 8,
      elevation: 4,
    },
  };
}

export type ThemeColors = typeof lightColors;

export type AppTheme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  fontSize: typeof fontSize;
  shadows: typeof shadows;
};

export const theme: AppTheme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  shadows,
};
