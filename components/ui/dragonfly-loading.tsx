import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface DragonflyLoadingProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

export const DragonflyLoading = ({ 
  width = 120, 
  height = 120, 
  style, 
  color 
}: DragonflyLoadingProps) => {
  // Animación maestra sincronizada para todo
  const masterAnim = useSharedValue(0);
  
  // Animación para el movimiento vertical del cuerpo (sutil)
  const bodyVerticalAnim = useSharedValue(0);
  // Animación para la rotación sutil del cuerpo
  const bodyRotationAnim = useSharedValue(0);

  useEffect(() => {
    // Animación maestra que controla el ciclo de aleteo (más rápido, realista)
    masterAnim.value = withRepeat(
      withTiming(1, { 
        duration: 800, // Ciclo de aleteo rápido ~75 beats/min (realista para libélulas)
        easing: Easing.inOut(Easing.sin) 
      }),
      -1,
      false
    );

    // Movimiento vertical del cuerpo (más lento, sincronizado con aleteo)
    bodyVerticalAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Rotación sutil del cuerpo (más lento que el aleteo)
    bodyRotationAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [masterAnim, bodyVerticalAnim, bodyRotationAnim]);

  // Estilo animado para el contenedor del cuerpo (movimiento general sutil)
  const bodyContainerStyle = useAnimatedStyle(() => {
    // Movimiento vertical muy sutil
    const translateY = interpolate(bodyVerticalAnim.value, [0, 1], [0, -4]);
    // Rotación muy sutil
    const rotate = interpolate(bodyRotationAnim.value, [-1, 0, 1], [-2, 0, 2]);
    // Escala sutil sincronizada con el aleteo
    const scale = interpolate(masterAnim.value, [0, 0.5, 1], [1, 1.02, 1]);
    
    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  // Animación de alas superiores (aleteo rápido) - solo opacidad
  const upperWingsOpacity = useAnimatedProps(() => {
    return {
      opacity: interpolate(masterAnim.value, [0, 0.25, 0.5, 0.75, 1], [0.75, 0.95, 0.75, 0.95, 0.75]),
    };
  });

  // Animación de alas inferiores (ligeramente desfasadas) - solo opacidad
  const lowerWingsOpacity = useAnimatedProps(() => {
    const phase = (masterAnim.value + 0.2) % 1;
    return {
      opacity: interpolate(phase, [0, 0.25, 0.5, 0.75, 1], [0.7, 0.9, 0.7, 0.9, 0.7]),
    };
  });

  const fillColor = color || "url(#dragonflyLoadingGrad)";

  return (
    <View style={[{ width, height }, style]}>
      <Animated.View style={[{ width, height }, bodyContainerStyle]}>
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="dragonflyLoadingGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={color || "#10b981"} stopOpacity="1" />
              <Stop offset="1" stopColor={color || "#0ea5e9"} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
          <G>
            {/* Alas superiores - con animación de opacidad independiente */}
            <AnimatedG stroke={fillColor} strokeWidth="1.2" fill="none" animatedProps={upperWingsOpacity}>
              <Path d="M62 40 C 50 25, 25 15, 20 25 C 18 30, 40 45, 62 40" />
              <Path d="M62 40 L 25 25" strokeWidth="0.5" opacity="0.8" />
              <Path d="M55 35 L 30 30" strokeWidth="0.5" opacity="0.6" />
              <Path d="M50 38 L 35 40" strokeWidth="0.5" opacity="0.6" />
            </AnimatedG>

            {/* Alas inferiores - con animación desfasada */}
            <AnimatedG stroke={fillColor} strokeWidth="1.2" fill="none" animatedProps={lowerWingsOpacity}>
              <Path d="M60 45 C 50 50, 30 60, 25 55 C 22 50, 45 45, 60 45" />
              <Path d="M60 45 L 30 55" strokeWidth="0.5" opacity="0.8" />
              <Path d="M50 48 L 35 52" strokeWidth="0.5" opacity="0.6" />
            </AnimatedG>

            {/* Cuerpo - estático relativo a las alas */}
            <G>
              {/* Cabeza */}
              <Circle cx="65" cy="35" r="3" fill={fillColor} />
              
              {/* Cuerpo principal */}
              <Path 
                d="M65 38 L60 45" 
                stroke={fillColor} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
              
              {/* Cola segmentada */}
              <Path 
                d="M60 45 L40 75" 
                stroke={fillColor} 
                strokeWidth="1.5" 
                strokeLinecap="round"
                strokeDasharray="5, 2" 
              />
            </G>
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
};
