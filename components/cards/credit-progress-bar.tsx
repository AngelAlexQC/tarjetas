/**
 * CreditProgressBar - Progress bar moderno con animación
 * Muestra visualmente el uso de crédito con colores semánticos
 */

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemedColors } from '@/contexts/tenant-theme-context';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

export interface CreditProgressBarProps {
  used: number;
  total: number;
  showLabels?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
}

export const CreditProgressBar: React.FC<CreditProgressBarProps> = ({
  used,
  total,
  showLabels = true,
  showPercentage = true,
  animated = true,
}) => {
  const theme = useAppTheme();
  const themedColors = useThemedColors();
  const percentage = Math.min((used / total) * 100, 100);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressWidth.value = withSpring(percentage, {
        damping: 25,
        stiffness: 90,
        mass: 1,
      });
    } else {
      progressWidth.value = percentage;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Usar el color primario de la institución para la barra de progreso
  // Si se prefiere mantener la lógica de semáforo pero con el tema, se podría mezclar,
  // pero la solicitud indica aplicar el tema de la institución.
  const progressColor = themedColors.primary;

  return (
    <Animated.View 
      style={styles.container}
      layout={LinearTransition.springify().damping(25).stiffness(90)}
    >
      {/* Progress Bar */}
      <Animated.View 
        style={styles.trackContainer}
        layout={LinearTransition.springify().damping(25).stiffness(90)}
      >
        <Animated.View 
          style={[styles.track, { backgroundColor: `${progressColor}20` }]}
          layout={LinearTransition.springify().damping(25).stiffness(90)}
        >
          <Animated.View
            style={[
              styles.fill,
              {
                backgroundColor: progressColor,
              },
              animatedStyle,
            ]}
            layout={LinearTransition.springify().damping(25).stiffness(90)}
          />
        </Animated.View>
        {showPercentage && (
          <ThemedText style={[styles.percentageText, { color: progressColor }]}>
            {Math.round(percentage)}%
          </ThemedText>
        )}
      </Animated.View>

      {/* Labels opcionales */}
      {showLabels && (
        <Animated.View 
          style={styles.labelsContainer}
          layout={LinearTransition.springify().damping(25).stiffness(90)}
        >
          <View style={styles.labelItem}>
            <ThemedText style={styles.labelValue}>
              {`${theme.tenant.currencySymbol}${used.toLocaleString(theme.tenant.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </ThemedText>
            <ThemedText style={styles.labelText}>usado</ThemedText>
          </View>
          <View style={[styles.labelItem, styles.labelRight]}>
            <ThemedText style={styles.labelValue}>
              {`${theme.tenant.currencySymbol}${total.toLocaleString(theme.tenant.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </ThemedText>
            <ThemedText style={styles.labelText}>total</ThemedText>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  trackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    minWidth: 40,
    textAlign: 'right',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelItem: {
    alignItems: 'flex-start',
  },
  labelRight: {
    alignItems: 'flex-end',
  },
  labelValue: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  labelText: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },
});
