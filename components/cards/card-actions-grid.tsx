/**
 * Componente reutilizable para carousel de acciones de tarjeta
 * Usando Design System centralizado
 */

import { ThemedText } from '@/components/themed-text';
import { CARD_ACTIONS, CardAction, CardActionType } from '@/constants/card-actions';
import { useAppTheme } from '@/hooks/use-app-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

const ACTION_BUTTON_SIZE = 80;
const ACTION_BUTTON_SPACING = 14;

interface CardActionsGridProps {
  cardId: string;
  isLoading?: boolean;
  onActionPress: (actionType: CardActionType) => void;
}

export function CardActionsGrid({ cardId, isLoading, onActionPress }: CardActionsGridProps) {
  const theme = useAppTheme();

  const renderActionButton = ({ item: action }: { item: CardAction }) => {
    // Usar el theme centralizado
    const gradientColors = theme.helpers.getThemeGradient();
    const glassTokens = theme.helpers.getGlassTokens();
    const shadowColor = theme.colors.shadowElevated;
    
    return (
      <View style={styles.actionWrapper}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            {
              transform: [{ scale: pressed ? 0.88 : 1 }],
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={() => onActionPress(action.id)}
          disabled={isLoading}
        >
          <View style={[styles.outerRing, { 
            backgroundColor: glassTokens.background,
            shadowColor: shadowColor,
          }]}>
            <LinearGradient
              colors={gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              {/* Glassmorphism overlay usando design tokens */}
              <View style={[styles.glassOverlay, {
                backgroundColor: theme.helpers.getOverlay('light')
              }]} />
              
              <View style={[styles.iconContainer, {
                backgroundColor: glassTokens.innerGlow,
                borderColor: glassTokens.border,
              }]}>
                <ThemedText style={styles.icon}>{action.icon}</ThemedText>
              </View>
              
              {/* Shimmer effect usando design tokens */}
              <View style={[styles.shimmerOverlay, {
                backgroundColor: theme.helpers.getOverlay('medium'),
              }]} />
            </LinearGradient>
          </View>
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
          <ActivityIndicator size="large" color={theme.tenant.mainColor} />
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
    width: ACTION_BUTTON_SIZE + 10,
  },
  actionButton: {
    marginBottom: 10,
  },
  outerRing: {
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    borderRadius: ACTION_BUTTON_SIZE / 2,
    padding: 3,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (ACTION_BUTTON_SIZE - 6) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: (ACTION_BUTTON_SIZE - 6) / 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    borderTopLeftRadius: (ACTION_BUTTON_SIZE - 6) / 2,
    borderTopRightRadius: (ACTION_BUTTON_SIZE - 6) / 2,
    zIndex: 1,
  },
  icon: {
    fontSize: 26,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13,
    letterSpacing: 0.2,
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
