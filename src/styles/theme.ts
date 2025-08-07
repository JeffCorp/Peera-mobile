import { COLORS, SPACING, TYPOGRAPHY } from "../constants";
import { Theme } from "../types";

export const lightTheme: Theme = {
  colors: {
    primary: COLORS.light.primary,
    secondary: COLORS.light.secondary,
    background: COLORS.light.background,
    surface: COLORS.light.surface,
    text: COLORS.light.text,
    textSecondary: COLORS.light.textSecondary,
    border: COLORS.light.border,
    error: COLORS.light.error,
    success: COLORS.light.success,
    warning: COLORS.light.warning,
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
};

export const darkTheme: Theme = {
  colors: {
    primary: COLORS.dark.primary,
    secondary: COLORS.dark.secondary,
    background: COLORS.dark.background,
    surface: COLORS.dark.surface,
    text: COLORS.dark.text,
    textSecondary: COLORS.dark.textSecondary,
    border: COLORS.dark.border,
    error: COLORS.dark.error,
    success: COLORS.dark.success,
    warning: COLORS.dark.warning,
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
};

export const getTheme = (isDark: boolean): Theme => {
  return isDark ? darkTheme : lightTheme;
};
