/**
 * Componente reutilizable para grid de acciones de tarjeta
 */

import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CARD_ACTIONS, CardAction, CardActionType } from '@/constants/card-actions';
import { useThemedColors } from '@/contexts/tenant-theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardActionsGridProps {
  cardId: string;
  isLoading?: boolean;
  onActionPress: (actionType: CardActionType) => void;
}

export function CardActionsGrid({ cardId, isLoading, onActionPress }: CardActionsGridProps) {
  const colors = useThemedColors();
  const colorScheme = useColorScheme();

  const renderActionButton = (action: CardAction) => {
    return (
      <Pressable
        key={action.id}
        style={({ pressed }) => [
          styles.actionButton,
          {
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
            borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        onPress={() => onActionPress(action.id)}
        disabled={isLoading}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${action.color}15` }]}>
          <ThemedText style={styles.icon}>{action.icon}</ThemedText>
        </View>
        <ThemedText style={styles.actionTitle} numberOfLines={1}>
          {action.title}
        </ThemedText>
        <ThemedText style={styles.actionDescription} numberOfLines={2}>
          {action.description}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Acciones Rápidas
      </ThemedText>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      <View style={styles.grid}>
        {CARD_ACTIONS.map(renderActionButton)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 16,
  },
});
