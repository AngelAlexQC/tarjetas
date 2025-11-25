import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DragonflyLoading } from './dragonfly-loading';
import { useAppTheme } from '@/hooks/use-app-theme';

interface LoadingScreenProps {
  message?: string;
  showMessage?: boolean;
}

export const LoadingScreen = ({ 
  message = 'Cargando...', 
  showMessage = true 
}: LoadingScreenProps) => {
  const theme = useAppTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <DragonflyLoading 
          width={100} 
          height={100}
          color={theme.tenant.mainColor}
        />
        
        {showMessage && (
          <ThemedText style={styles.message}>
            {message}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay = ({ 
  visible, 
  message = 'Cargando...', 
  transparent = true 
}: LoadingOverlayProps) => {
  const theme = useAppTheme();

  if (!visible) return null;

  return (
    <View 
      style={[
        styles.overlay,
        { 
          backgroundColor: transparent 
            ? 'rgba(0, 0, 0, 0.5)' 
            : theme.colors.background 
        }
      ]}
    >
      <View style={[
        styles.overlayContent,
        { backgroundColor: theme.colors.surface }
      ]}>
        <DragonflyLoading 
          width={80} 
          height={80}
          color={theme.tenant.mainColor}
        />
        <ThemedText style={styles.overlayMessage}>
          {message}
        </ThemedText>
      </View>
    </View>
  );
};

interface InlineLoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  color?: string;
}

export const InlineLoading = ({ 
  size = 'medium', 
  message,
  color 
}: InlineLoadingProps) => {
  const theme = useAppTheme();
  
  const sizes = {
    small: 40,
    medium: 60,
    large: 80,
  };

  return (
    <View style={styles.inlineContainer}>
      <DragonflyLoading 
        width={sizes[size]} 
        height={sizes[size]}
        color={color || theme.tenant.mainColor}
      />
      {message && (
        <ThemedText style={[styles.message, styles.inlineMessage]}>
          {message}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overlayMessage: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  inlineMessage: {
    fontSize: 14,
  },
});
