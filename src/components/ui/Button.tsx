import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import { Theme } from '../../types';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

interface ButtonStyles {
  button: ViewStyle;
  text: TextStyle;
}

const createButtonStyles = (theme: Theme, variant: string, size: string, disabled: boolean): ButtonStyles => {
  const baseButton: ViewStyle = {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  };

  const baseText: TextStyle = {
    fontWeight: '600',
  };

  // Size styles
  const sizeStyles = {
    small: {
      button: { paddingVertical: 8, paddingHorizontal: 16 },
      text: { fontSize: 14 },
    },
    medium: {
      button: { paddingVertical: 12, paddingHorizontal: 24 },
      text: { fontSize: 16 },
    },
    large: {
      button: { paddingVertical: 16, paddingHorizontal: 32 },
      text: { fontSize: 18 },
    },
  };

  // Variant styles
  const variantStyles = {
    primary: {
      button: {
        backgroundColor: disabled ? theme.colors.border : theme.colors.primary,
      },
      text: {
        color: '#FFFFFF',
      },
    },
    secondary: {
      button: {
        backgroundColor: disabled ? theme.colors.border : theme.colors.secondary,
      },
      text: {
        color: '#FFFFFF',
      },
    },
    outline: {
      button: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? theme.colors.border : theme.colors.primary,
      },
      text: {
        color: disabled ? theme.colors.textSecondary : theme.colors.primary,
      },
    },
    ghost: {
      button: {
        backgroundColor: 'transparent',
      },
      text: {
        color: disabled ? theme.colors.textSecondary : theme.colors.primary,
      },
    },
  };

  return {
    button: {
      ...baseButton,
      ...sizeStyles[size as keyof typeof sizeStyles].button,
      ...variantStyles[variant as keyof typeof variantStyles].button,
    },
    text: {
      ...baseText,
      ...sizeStyles[size as keyof typeof sizeStyles].text,
      ...variantStyles[variant as keyof typeof variantStyles].text,
    },
  };
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}) => {
  // For now, using a basic theme. In a real app, you'd get this from a theme context
  const theme: Theme = {
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      background: '#0F0F0F',
      surface: 'rgba(255, 255, 255, 0.05)',
      text: '#FFFFFF',
      textSecondary: '#9CA3AF',
      border: 'rgba(255, 255, 255, 0.1)',
      error: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    typography: {
      h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
      h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
      h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
      body: { fontSize: 16, fontWeight: 'normal', lineHeight: 24 },
      caption: { fontSize: 14, fontWeight: 'normal', lineHeight: 20 },
    },
  };

  const styles = createButtonStyles(theme, variant, size, disabled || loading);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}; 