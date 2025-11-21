import { ThemedText } from '@/components/themed-text';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
  formatText?: (value: number, percentage: number) => string;
  textStyle?: any;
  duration?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 60,
  strokeWidth = 4,
  color = '#0a7ea4',
  backgroundColor = 'rgba(0,0,0,0.1)',
  showText = true,
  formatText,
  textStyle,
  duration = 1000,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = useSharedValue(0);
  
  // Calcular porcentaje (0-100)
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  // Calcular valor normalizado (0-1) para la animación
  const normalizedValue = Math.min(1, Math.max(0, value / max));

  useEffect(() => {
    progress.value = withSpring(normalizedValue, {
      damping: 20,
      stiffness: 90,
    });
  }, [normalizedValue, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {showText && (
        <View style={styles.textContainer}>
          <ThemedText style={[styles.text, { fontSize: size * 0.25, color }, textStyle]}>
            {formatText ? formatText(value, percentage) : `${Math.round(percentage)}%`}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
});
