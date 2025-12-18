import { ThemedText } from '@/components/themed-text';
import { FeedbackColors } from '@/constants';
import { useAppTheme } from '@/hooks/use-app-theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface ThemedButtonProps {
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ThemedButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  icon,
  style,
  textStyle
}: ThemedButtonProps) {
  const theme = useAppTheme();
  
  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return theme.colors.surfaceHigher;
    
    switch (variant) {
      case 'primary':
        return theme.tenant.mainColor;
      case 'secondary':
        return pressed ? theme.colors.surfaceHigher : theme.colors.surface;
      case 'danger':
        return FeedbackColors.error;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.tenant.mainColor;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return theme.tenant.mainColor;
      default:
        return theme.colors.text;
    }
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: getBackgroundColor(pressed),
          borderColor: variant === 'outline' ? theme.tenant.mainColor : 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: pressed || disabled ? 0.7 : 1,
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {title && (
            <ThemedText style={[styles.text, { color: getTextColor() }, textStyle]}>
              {title}
            </ThemedText>
          )}
          {icon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});
