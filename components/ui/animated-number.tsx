/**
 * AnimatedNumber - Componente de número animado con efecto contador
 * Anima números suavemente cuando cambian de valor
 */

import React, { useEffect, useState } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/use-app-theme';

export interface AnimatedNumberProps {
  value: number;
  style?: TextStyle | TextStyle[];
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  locale?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  style,
  prefix = '',
  suffix = '',
  decimals = 2,
  duration = 800,
  locale = 'en-US',
}) => {
  const theme = useAppTheme();
  const [displayText, setDisplayText] = useState(
    `${prefix}${value.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`
  );

  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, animatedValue]);

  // Actualizar el texto en cada frame de la animación
  useDerivedValue(() => {
    const formattedValue = animatedValue.value.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    
    runOnJS(setDisplayText)(`${prefix}${formattedValue}${suffix}`);
  });

  return (
    <Animated.Text style={[{ color: theme.colors.text }, style]}>
      {displayText}
    </Animated.Text>
  );
};
