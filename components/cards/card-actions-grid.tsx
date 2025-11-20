/**
 * Componente reutilizable para carousel de acciones de tarjeta
 */

import { ThemedText } from '@/components/themed-text';
import { CARD_ACTIONS, CardAction, CardActionType } from '@/constants/card-actions';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_BUTTON_SIZE = 90;
const ACTION_BUTTON_SPACING = 16;

interface CardActionsGridProps {
  cardId: string;
  isLoading?: boolean;
  onActionPress: (actionType: CardActionType) => void;
}

export function CardActionsGrid({ cardId, isLoading, onActionPress }: CardActionsGridProps) {
  const { currentTheme } = useTenantTheme();
  const colorScheme = useColorScheme();

  const blendColorWithTheme = (actionColor: string): string => {
    // Mezclar el color de la acción con el color principal del tema
    const themeColor = currentTheme?.mainColor || '#007AFF';
    return actionColor; // Mantener color de acción pero con adaptación
  };

  const renderActionButton = ({ item: action }: { item: CardAction }) => {
    const themeColor = currentTheme?.mainColor || '#007AFF';
    const secondaryColor = currentTheme?.secondaryColor || '#2196F3';
    const isDark = colorScheme === 'dark';
    
    return (
      <View style={styles.actionWrapper}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            {
              transform: [{ scale: pressed ? 0.92 : 1 }],
            },
          ]}
          onPress={() => onActionPress(action.id)}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isDark 
              ? [`${themeColor}CC`, `${secondaryColor}CC`]
              : [themeColor, secondaryColor]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <View style={styles.iconContainer}>
              <ThemedText style={styles.icon}>{action.icon}</ThemedText>
            </View>
          </LinearGradient>
        </Pressable>
        <ThemedText style={styles.actionLabel} numberOfLines={2}>
          {action.title}
        </ThemedText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={currentTheme?.mainColor || '#007AFF'} />
        </View>
      )}
      
      <FlatList
        data={CARD_ACTIONS}
        renderItem={renderActionButton}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
        ItemSeparatorComponent={() => <View style={{ width: ACTION_BUTTON_SPACING }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  carouselContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  actionWrapper: {
    alignItems: 'center',
    width: ACTION_BUTTON_SIZE,
  },
  actionButton: {
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    borderRadius: ACTION_BUTTON_SIZE / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 8,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  icon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 20,
  },
});
