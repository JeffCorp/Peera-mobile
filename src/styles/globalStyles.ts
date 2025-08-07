import { StyleSheet } from "react-native";
import { Theme } from "../types";

export const createGlobalStyles = (theme: Theme) =>
  StyleSheet.create({
    // Container styles
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },

    // Card styles
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      shadowColor: theme.colors.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    // Text styles
    text: {
      color: theme.colors.text,
      fontSize: theme.typography.body.fontSize,
      lineHeight: theme.typography.body.lineHeight,
    },
    textSecondary: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.body.fontSize,
      lineHeight: theme.typography.body.lineHeight,
    },
    heading1: {
      color: theme.colors.text,
      fontSize: theme.typography.h1.fontSize,
      fontWeight: theme.typography.h1.fontWeight,
      lineHeight: theme.typography.h1.lineHeight,
    },
    heading2: {
      color: theme.colors.text,
      fontSize: theme.typography.h2.fontSize,
      fontWeight: theme.typography.h2.fontWeight,
      lineHeight: theme.typography.h2.lineHeight,
    },
    heading3: {
      color: theme.colors.text,
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      lineHeight: theme.typography.h3.lineHeight,
    },
    caption: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.caption.fontSize,
      lineHeight: theme.typography.caption.lineHeight,
    },

    // Button styles
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
    },
    buttonSecondary: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonSecondaryText: {
      color: theme.colors.primary,
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
    },

    // Input styles
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
    },
    inputError: {
      borderColor: theme.colors.error,
    },

    // Row and column layouts
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    rowSpaceBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    column: {
      flexDirection: "column",
    },

    // Spacing utilities
    marginTop: {
      marginTop: theme.spacing.md,
    },
    marginBottom: {
      marginBottom: theme.spacing.md,
    },
    padding: {
      padding: theme.spacing.md,
    },
    paddingHorizontal: {
      paddingHorizontal: theme.spacing.md,
    },
    paddingVertical: {
      paddingVertical: theme.spacing.md,
    },

    // Status colors
    successText: {
      color: theme.colors.success,
    },
    errorText: {
      color: theme.colors.error,
    },
    warningText: {
      color: theme.colors.warning,
    },
  });
