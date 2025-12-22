import { ThemedText } from '@/components/themed-text';
import { FeedbackColors } from '@/constants';
import { useAppTheme } from '@/hooks/use-app-theme';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface ThemedInputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
}

export function ThemedInput({ 
  label, 
  icon, 
  rightIcon,
  error, 
  containerStyle,
  style,
  ...props 
}: ThemedInputProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: theme.colors.surface,
          borderColor: error ? FeedbackColors.error : theme.colors.border,
        }
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input, 
            { color: theme.colors.text },
            style
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          {...props}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      

      
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      {!error && props.helperText && <ThemedText style={styles.helper}>{props.helperText}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
  },
  iconContainer: {
    marginRight: 10,
  },
  rightIconContainer: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  error: {
    color: FeedbackColors.error,
    fontSize: 12,
    marginTop: 4,
  },
  helper: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
});
