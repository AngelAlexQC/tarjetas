import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

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
  // Animación para el movimiento vertical de la libélula
  const verticalAnim = useSharedValue(0);
  // Animación para la rotación sutil
  const rotationAnim = useSharedValue(0);
  // Animación para la escala/pulso
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    // Movimiento vertical suave (flotando)
    verticalAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Rotación sutil (como si estuviera volando)
    rotationAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Pulso de escala suave
    scaleAnim.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [verticalAnim, rotationAnim, scaleAnim]);

  // Estilo animado para el contenedor
  const animatedContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(verticalAnim.value, [0, 1], [0, -8]);
    const rotate = interpolate(rotationAnim.value, [-1, 0, 1], [-3, 0, 3]);
    const scale = scaleAnim.value;

    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  const fillColor = color || "url(#dragonflyLoadingGrad)";

  return (
    <View style={[{ width, height }, style]}>
      <Animated.View style={[{ width, height }, animatedContainerStyle]}>
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="dragonflyLoadingGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={color || "#10b981"} stopOpacity="1" />
              <Stop offset="1" stopColor={color || "#0ea5e9"} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          
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

            {/* Alas superiores */}
            <G stroke={fillColor} strokeWidth="1.2" fill="none">
              <Path d="M62 40 C 50 25, 25 15, 20 25 C 18 30, 40 45, 62 40" />
              <Path d="M62 40 L 25 25" strokeWidth="0.5" opacity="0.8" />
              <Path d="M55 35 L 30 30" strokeWidth="0.5" opacity="0.6" />
              <Path d="M50 38 L 35 40" strokeWidth="0.5" opacity="0.6" />
            </G>

            {/* Alas inferiores */}
            <G stroke={fillColor} strokeWidth="1.2" fill="none">
              <Path d="M60 45 C 50 50, 30 60, 25 55 C 22 50, 45 45, 60 45" />
              <Path d="M60 45 L 30 55" strokeWidth="0.5" opacity="0.8" />
              <Path d="M50 48 L 35 52" strokeWidth="0.5" opacity="0.6" />
            </G>
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
};
