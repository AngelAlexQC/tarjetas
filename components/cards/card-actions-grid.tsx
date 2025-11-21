import { ThemedText } from '@/components/themed-text';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { CardAction, CardActionType, getAvailableActions } from '@/constants/card-actions';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

const ACTION_BUTTON_SIZE = 80;
const ACTION_BUTTON_SPACING = 14;

interface CardActionsGridProps {
  cardType: 'credit' | 'debit' | 'virtual';
  isLoading?: boolean;
  onActionPress: (actionType: CardActionType) => void;
}

export function CardActionsGrid({ cardType, isLoading, onActionPress }: CardActionsGridProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const availableActions = getAvailableActions(cardType);

  const renderActionButton = ({ item: action }: { item: CardAction }) => {
    const gradientColors = theme.helpers.getThemeGradient();
    const glassTokens = theme.helpers.getGlassTokens();
    const shadowColor = theme.colors.shadowElevated;
    
    return (
      <Animated.View 
        style={styles.actionWrapper}
        entering={FadeIn.duration(600).springify()}
        exiting={FadeOut.duration(400)}
        layout={LinearTransition.springify().damping(25).stiffness(90)}
      >
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
              <View style={[styles.glassOverlay, {
                backgroundColor: theme.helpers.getOverlay('light')
              }]} />
              
              <View style={[styles.iconContainer, {
                backgroundColor: glassTokens.innerGlow,
                borderColor: glassTokens.border,
              }]}>
                {(() => {
                  const IconComponent = FinancialIcons[action.icon];
                  return <IconComponent size={28} color={theme.isDark ? '#E0E0E0' : '#FFFFFF'} />;
                })()}
              </View>
              
              <View style={[styles.shimmerOverlay, {
                backgroundColor: theme.helpers.getOverlay('medium'),
              }]} />
            </LinearGradient>
          </View>
        </Pressable>
        <ThemedText style={styles.actionLabel} numberOfLines={2}>
          {action.title}
        </ThemedText>
      </Animated.View>
    );
  };

  // Determinar si usar grid o carrusel horizontal
  const useGrid = layout.isLandscape || layout.screenWidth >= 768;
  const numColumns = useGrid ? (availableActions.length >= 6 ? 3 : 2) : undefined;

  return (
    <Animated.View 
      style={[styles.container, useGrid && styles.containerGrid]}
      layout={LinearTransition.springify().damping(25).stiffness(90)}
    >
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.tenant.mainColor} />
        </View>
      )}
      
      {useGrid ? (
        // Grid para landscape/pantallas grandes
        <View style={styles.gridContainer}>
          {availableActions.map((action) => (
            <View key={action.id} style={styles.gridItem}>
              {renderActionButton({ item: action })}
            </View>
          ))}
        </View>
      ) : (
        // Carrusel horizontal para portrait/pantallas pequeñas
        <FlatList
          data={availableActions}
          renderItem={renderActionButton}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          ItemSeparatorComponent={() => <View style={{ width: ACTION_BUTTON_SPACING }} />}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  containerLandscape: {
    maxWidth: 500,
    alignSelf: 'center',
  },
  containerGrid: {
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: ACTION_BUTTON_SPACING,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  gridItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  carouselContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  carouselContentLandscape: {
    justifyContent: 'center',
    flexGrow: 1,
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
