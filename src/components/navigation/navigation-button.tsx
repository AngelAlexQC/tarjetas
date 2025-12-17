import { useAppTheme } from '@/hooks/use-app-theme';
import { ArrowLeft, ChevronLeft, X } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet, ViewStyle } from 'react-native';

interface NavigationButtonProps {
  type?: 'back' | 'close';
  onPress: () => void;
  style?: ViewStyle;
}

export function NavigationButton({ type = 'back', onPress, style }: NavigationButtonProps) {
  const theme = useAppTheme();
  const isAndroid = Platform.OS === 'android';

  const Icon = type === 'close' 
    ? X 
    : (isAndroid ? ArrowLeft : ChevronLeft);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: theme.colors.surfaceHigher,
          borderColor: theme.colors.border,
        },
        pressed && { opacity: 0.7 },
        style,
      ]}
      hitSlop={8}
    >
      <Icon 
        size={24} 
        color={theme.colors.text} 
        strokeWidth={2}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
