import { ThemedText } from '@/ui/primitives/themed-text';
import { ThemedView } from '@/ui/primitives/themed-view';
import { useAppTheme } from '@/ui/theming';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DragonflyLoading } from './dragonfly-loading';

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
});
