import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | undefined;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  testID?: string;
  prefix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  testID,
  prefix,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}

      <View style={styles.inputContainer}>
        {prefix && (
          <Text style={styles.prefix}>{prefix}</Text>
        )}
        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
            inputStyle,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#6B7280"
        />
      </View>

      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text style={[styles.helperText, helperStyle]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    width: '100%',
  },
  inputFocused: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  prefix: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
}); 