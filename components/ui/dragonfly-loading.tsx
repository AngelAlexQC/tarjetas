import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

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
  // Animación para el aleteo de las alas superiores
  const upperWingAnim = useSharedValue(0);
  // Animación para el aleteo de las alas inferiores
  const lowerWingAnim = useSharedValue(0);
  // Animación para el movimiento vertical de la libélula
  const verticalAnim = useSharedValue(0);
  // Animación para la opacidad/pulso
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    // Aleteo de alas superiores - más rápido
    upperWingAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Aleteo de alas inferiores - ligeramente desfasado
    setTimeout(() => {
      lowerWingAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }, 100);

    // Movimiento vertical suave
    verticalAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Pulso suave
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [upperWingAnim, lowerWingAnim, verticalAnim, pulseAnim]);

  // Props animados para las alas superiores
  const upperWingAnimatedProps = useAnimatedProps(() => {
    const rotation = interpolate(upperWingAnim.value, [0, 1], [0, -15]);
    return {
      transform: `rotate(${rotation} 62 40)`,
    };
  });

  // Props animados para las alas inferiores
  const lowerWingAnimatedProps = useAnimatedProps(() => {
    const rotation = interpolate(lowerWingAnim.value, [0, 1], [0, -12]);
    return {
      transform: `rotate(${rotation} 60 45)`,
    };
  });

  // Props animados para el cuerpo (movimiento vertical)
  const bodyAnimatedProps = useAnimatedProps(() => {
    const translateY = interpolate(verticalAnim.value, [0, 1], [0, -6]);
    return {
      transform: `translate(0, ${translateY})`,
    };
  });

  // Props animados para la opacidad
  const opacityAnimatedProps = useAnimatedProps(() => {
    return {
      opacity: pulseAnim.value,
    };
  });

  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" style={style}>
      <Defs>
        <LinearGradient id="dragonflyLoadingGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={color || "#10b981"} stopOpacity="1" />
          <Stop offset="1" stopColor={color || "#0ea5e9"} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      
      <AnimatedG animatedProps={bodyAnimatedProps}>
        {/* Cabeza con pulso */}
        <AnimatedG animatedProps={opacityAnimatedProps}>
          <Circle cx="65" cy="35" r="3" fill={color || "url(#dragonflyLoadingGrad)"} />
        </AnimatedG>
        
        {/* Cuerpo principal */}
        <Path 
          d="M65 38 L60 45" 
          stroke={color || "url(#dragonflyLoadingGrad)"} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
        
        {/* Cola segmentada */}
        <Path 
          d="M60 45 L40 75" 
          stroke={color || "url(#dragonflyLoadingGrad)"} 
          strokeWidth="1.5" 
          strokeLinecap="round"
          strokeDasharray="5, 2" 
        />

        {/* Alas superiores animadas */}
        <AnimatedG 
          stroke={color || "url(#dragonflyLoadingGrad)"} 
          strokeWidth="1.2" 
          fill="none"
          animatedProps={upperWingAnimatedProps}
        >
          <Path d="M62 40 C 50 25, 25 15, 20 25 C 18 30, 40 45, 62 40" />
          <Path d="M62 40 L 25 25" strokeWidth="0.5" opacity="0.8" />
          <Path d="M55 35 L 30 30" strokeWidth="0.5" opacity="0.6" />
          <Path d="M50 38 L 35 40" strokeWidth="0.5" opacity="0.6" />
        </AnimatedG>

        {/* Alas inferiores animadas */}
        <AnimatedG 
          stroke={color || "url(#dragonflyLoadingGrad)"} 
          strokeWidth="1.2" 
          fill="none"
          animatedProps={lowerWingAnimatedProps}
        >
          <Path d="M60 45 C 50 50, 30 60, 25 55 C 22 50, 45 45, 60 45" />
          <Path d="M60 45 L 30 55" strokeWidth="0.5" opacity="0.8" />
          <Path d="M50 48 L 35 52" strokeWidth="0.5" opacity="0.6" />
        </AnimatedG>
      </AnimatedG>
    </Svg>
  );
};
