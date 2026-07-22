/**
 * Budget Buddy ADHD — Theme Constants
 *
 * Calm, ADHD-friendly design tokens.
 * Every screen answers: "What is the next thing I need to do?"
 */

export const colors = {
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
} as const;

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

export type AppTheme = {
  colors: typeof colors;
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
