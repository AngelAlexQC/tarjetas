/**
 * CreditProgressBar - Progress bar moderno con animación
 * Muestra visualmente el uso de crédito con colores semánticos
 */

import { ThemedText } from '@/components/themed-text';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export interface CreditProgressBarProps {
  used: number;
  total: number;
  showLabels?: boolean;
  animated?: boolean;
}

/**
 * Obtiene el color según el porcentaje de uso
 */
const getProgressColor = (percentage: number): string => {
  if (percentage <= 50) {
    return '#10B981'; // Verde
  } else if (percentage <= 75) {
    return '#F59E0B'; // Amarillo
  } else {
    return '#EF4444'; // Rojo
  }
};

export const CreditProgressBar: React.FC<CreditProgressBarProps> = ({
  used,
  total,
  showLabels = true,
  animated = true,
}) => {
  const percentage = Math.min((used / total) * 100, 100);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressWidth.value = withSpring(percentage, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      progressWidth.value = percentage;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const progressColor = getProgressColor(percentage);

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.trackContainer}>
        <View style={[styles.track, { backgroundColor: `${progressColor}10` }]}>
          <Animated.View
            style={[
              styles.fill,
              {
                backgroundColor: progressColor,
              },
              animatedStyle,
            ]}
          />
        </View>
        <ThemedText style={styles.percentageText}>
          {Math.round(percentage)}%
        </ThemedText>
      </View>

      {/* Labels opcionales */}
      {showLabels && (
        <View style={styles.labelsContainer}>
          <View style={styles.labelItem}>
            <ThemedText style={styles.labelValue}>
              ${used.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </ThemedText>
            <ThemedText style={styles.labelText}>usado</ThemedText>
          </View>
          <View style={[styles.labelItem, styles.labelRight]}>
            <ThemedText style={styles.labelValue}>
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </ThemedText>
            <ThemedText style={styles.labelText}>total</ThemedText>
          </View>
        </View>
      )}
    </View>
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
