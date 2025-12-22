import { ThemedText } from '@/components/themed-text';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCardActions } from '@/hooks/use-card-actions';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { CardAction, CardActionType } from '@/repositories/schemas/card-action.schema';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, ColorValue, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const ACTION_BUTTON_SIZE = 80;
const ACTION_BUTTON_SPACING = 14;

interface CardActionsGridProps {
  cardType: 'credit' | 'debit' | 'virtual';
  isLoading?: boolean;
  onActionPress: (actionType: CardActionType) => void;
}

const ActionButton = ({ action, onPress, isLoading }: { action: CardAction, onPress: (id: CardActionType) => void, isLoading?: boolean }) => {
  const theme = useAppTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedInnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 300 }); // Más rápido y reactivo
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const gradientColors = theme.helpers.getThemeGradient();
  const shadowColor = theme.colors.shadowElevated;
  const IconComponent = FinancialIcons[action.icon];
  const iconColor = '#FFFFFF';

  return (
    <Animated.View 
      style={styles.actionWrapper}
      entering={FadeIn.duration(400).delay(50)} // Eliminado springify innecesario
      exiting={FadeOut.duration(200)}
      // Eliminado layout transition individual para evitar jank en la lista
    >
      <Pressable
        onPress={() => onPress(action.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading}
      >
        <Animated.View style={animatedInnerStyle}>
          <LinearGradient
            colors={gradientColors as unknown as readonly [ColorValue, ColorValue, ...ColorValue[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.buttonGradient, { 
              shadowColor: shadowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 6,
            }]}
          >
            <IconComponent size={26} color={iconColor} />
            <ThemedText style={[styles.actionLabel, { color: iconColor }]} numberOfLines={2}>
              {action.title}
            </ThemedText>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export function CardActionsGrid({ cardType, isLoading: propsIsLoading, onActionPress }: CardActionsGridProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { actions: availableActions, isLoading: actionsLoading } = useCardActions(cardType);
  
  const isLoading = propsIsLoading || actionsLoading;

  // Determinar si usar grid o carrusel horizontal
  const useGrid = layout.isLandscape || layout.screenWidth >= 768;

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
              <ActionButton action={action} onPress={onActionPress} isLoading={isLoading} />
            </View>
          ))}
        </View>
      ) : (
        // Carrusel horizontal para portrait/pantallas pequeñas
        <FlatList
          data={availableActions}
          renderItem={({ item }) => <ActionButton action={item} onPress={onActionPress} isLoading={isLoading} />}
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
  buttonGradient: {
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    borderRadius: ACTION_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  icon: {
    fontSize: 26,
    color: '#FFFFFF',
    ...Platform.select({
      web: {
        textShadow: '0px 1px 3px rgba(0, 0, 0, 0.3)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
    }),
  },
  actionLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 11,
    letterSpacing: 0,
    marginTop: 1,
    paddingHorizontal: 2,
    maxWidth: ACTION_BUTTON_SIZE - 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
