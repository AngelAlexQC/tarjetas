import { ThemedText } from '@/components/themed-text';
import { DragonflyLogo } from '@/components/ui/dragonfly-logo';
import { useAppTheme } from '@/hooks/use-app-theme';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface PoweredByProps {
  style?: StyleProp<ViewStyle>;
}

export const PoweredBy: React.FC<PoweredByProps> = ({ style }) => {
  const theme = useAppTheme();
  
  return (
    <View style={[styles.container, style]}>
      <ThemedText style={[styles.text, { color: theme.colors.textTertiary }]}>
        Powered by
      </ThemedText>
      <ThemedText style={[styles.brandText, { color: theme.colors.textSecondary }]}>
        <ThemedText style={styles.lightText}>Libélula</ThemedText>
        <ThemedText style={styles.boldText}>Soft</ThemedText>
      </ThemedText>
      <DragonflyLogo width={16} height={16} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    opacity: 0.5,
  },
  text: {
    fontSize: 10,
  },
  brandText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  lightText: {
    fontWeight: '300',
  },
  boldText: {
    fontWeight: '700',
  },
});
