import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

// Crear versiones animadas de los componentes SVG
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Prevenir que el splash screen nativo se oculte automáticamente
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignorar errores de race condition al recargar la app */
});

interface AnimatedSplashScreenProps {
  children: ReactNode;
  onReady?: () => void;
}

// Componente de partícula con morphing líquido
const Particle = ({ delay, index, totalParticles }: { delay: number; index: number; totalParticles: number }) => {
  const progress = useSharedValue(0);
  const angle = (index / totalParticles) * Math.PI * 2;
  const radius = 180 + (Math.cos(angle * 3) * 40);
  
  // Posiciones de destino para formar la libélula
  const getTargetPosition = () => {
    const segmentSize = totalParticles / 4;
    if (index < segmentSize) {
      // Ala superior izquierda
      return { x: -80 + (index % 7) * -15, y: -60 - (index % 7) * 8 };
    } else if (index < segmentSize * 2) {
      // Ala superior derecha
      return { x: 80 + (index % 7) * 15, y: -60 - (index % 7) * 8 };
    } else if (index < segmentSize * 3) {
      // Ala inferior izquierda
      return { x: -70 + (index % 6) * -12, y: 20 + (index % 6) * 10 };
    } else {
      // Ala inferior derecha
      return { x: 70 + (index % 6) * 12, y: 20 + (index % 6) * 10 };
    }
  };

  const target = getTargetPosition();

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: 1400, // Más rápido y fluido
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Ease-out cuadrático - suave y natural
      })
    );
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    // Fase 1: Expansión inicial más rápida (0-0.25)
    const explosionX = interpolate(progress.value, [0, 0.25], [Math.cos(angle) * radius, Math.cos(angle) * (radius + 40)]);
    const explosionY = interpolate(progress.value, [0, 0.25], [Math.sin(angle) * radius, Math.sin(angle) * (radius + 40)]);
    
    // Fase 2: Morphing fluido hacia la forma de libélula (0.25-0.65) - overlapping
    const morphX = interpolate(progress.value, [0.25, 0.65], [explosionX, target.x]);
    const morphY = interpolate(progress.value, [0.25, 0.65], [explosionY, target.y]);
    
    // Fase 3: Disolución suave (0.65-1)
    const finalX = interpolate(progress.value, [0.65, 1], [morphX, target.x]);
    const finalY = interpolate(progress.value, [0.65, 1], [morphY, target.y]);
    
    // Opacidad con transiciones más suaves
    const opacity = interpolate(
      progress.value, 
      [0, 0.12, 0.25, 0.65, 0.8, 1], 
      [0, 1, 0.95, 0.85, 0.5, 0]
    );
    
    // Escala con curva más natural
    const scale = interpolate(
      progress.value, 
      [0, 0.12, 0.25, 0.65, 1], 
      [0, 1.15, 1, 0.85, 0.4]
    );

    // Blur más gradual
    const blur = interpolate(progress.value, [0.65, 1], [0, 3]);

    return {
      transform: [{ translateX: finalX }, { translateY: finalY }, { scale }],
      opacity,
      shadowRadius: blur + 6,
    };
  });

  // Colores iridiscentes más sofisticados para fintech
  const colors = [
    '#00E5FF', // Cyan brillante
    '#00FFD1', // Aqua
    '#B388FF', // Púrpura pastel
    '#FFAB91', // Coral suave
    '#80DEEA', // Teal claro
    '#FFF59D', // Amarillo pastel
  ];

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          backgroundColor: colors[index % colors.length],
        },
      ]}
    />
  );
};

// Componente SVG de libélula con efecto iridiscente profesional
interface DragonflyProps {
  progress: ReturnType<typeof useSharedValue<number>>;
  screenWidth: number;
}

const DragonflyComponent = ({ progress, screenWidth }: DragonflyProps) => {
  // Animaciones de aleteo continuo - más natural y fluido
  const wingFlapTop = useSharedValue(0);
  const wingFlapBottom = useSharedValue(0);
  const bodyHover = useSharedValue(0);
  const wingShimmer = useSharedValue(0);
  const iridescence = useSharedValue(0);
  
  useEffect(() => {
    const wingFlapTopValue = wingFlapTop;
    const wingFlapBottomValue = wingFlapBottom;
    const bodyHoverValue = bodyHover;
    const wingShimmerValue = wingShimmer;
    const iridescenceValue = iridescence;

    // Aleteo continuo de alas superiores - LOOP INFINITO (empieza antes, overlapping)
    wingFlapTopValue.value = withDelay(
      1200, // Empieza antes para overlap
      withRepeat(
        withSequence(
          withTiming(1, { duration: 75, easing: Easing.bezier(0.33, 0, 0.67, 1) }), // Ease-out
          withTiming(-0.8, { duration: 75, easing: Easing.bezier(0.33, 0, 0.67, 1) })
        ),
        -1,
        true
      )
    );
    
    // Aleteo de alas inferiores (desfasado 20ms)
    wingFlapBottomValue.value = withDelay(
      1220,
      withRepeat(
        withSequence(
          withTiming(-0.7, { duration: 75, easing: Easing.bezier(0.33, 0, 0.67, 1) }),
          withTiming(0.9, { duration: 75, easing: Easing.bezier(0.33, 0, 0.67, 1) })
        ),
        -1,
        true
      )
    );
    
    // Floating suave del cuerpo - empieza antes
    bodyHoverValue.value = withDelay(
      1300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    
    // Iridiscencia dinámica - más rápida y fluida
    iridescenceValue.value = withDelay(
      1300,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
    
    // Shimmer que recorre las alas - empieza antes
    wingShimmerValue.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.4, { duration: 500 })
        ),
        -1,
        true
      )
    );
  }, [wingFlapTop, wingFlapBottom, bodyHover, wingShimmer, iridescence]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.2, 0.5, 1], [0, 1, 1]);
    return { opacity };
  });
  
  // Estilos animados para alas superiores con más naturalidad
  const topLeftWingStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(wingFlapTop.value, [-1, 0, 1], [-30, 0, 18]);
    const rotateX = interpolate(wingFlapTop.value, [-1, 0, 1], [5, 0, -5]);
    return {
      transform: [
        { translateX: 150 },
        { translateY: 150 },
        { rotateZ: `${rotateZ}deg` },
        { rotateX: `${rotateX}deg` },
        { translateX: -150 },
        { translateY: -150 },
      ],
    };
  });
  
  const topRightWingStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(wingFlapTop.value, [-1, 0, 1], [18, 0, -30]);
    const rotateX = interpolate(wingFlapTop.value, [-1, 0, 1], [-5, 0, 5]);
    return {
      transform: [
        { translateX: 150 },
        { translateY: 150 },
        { rotateZ: `${rotateZ}deg` },
        { rotateX: `${rotateX}deg` },
        { translateX: -150 },
        { translateY: -150 },
      ],
    };
  });
  
  const bottomLeftWingStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(wingFlapBottom.value, [-1, 0, 1], [22, 0, -18]);
    const rotateX = interpolate(wingFlapBottom.value, [-1, 0, 1], [-4, 0, 4]);
    return {
      transform: [
        { translateX: 150 },
        { translateY: 150 },
        { rotateZ: `${rotateZ}deg` },
        { rotateX: `${rotateX}deg` },
        { translateX: -150 },
        { translateY: -150 },
      ],
    };
  });
  
  const bottomRightWingStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(wingFlapBottom.value, [-1, 0, 1], [-18, 0, 22]);
    const rotateX = interpolate(wingFlapBottom.value, [-1, 0, 1], [4, 0, -4]);
    return {
      transform: [
        { translateX: 150 },
        { translateY: 150 },
        { rotateZ: `${rotateZ}deg` },
        { rotateX: `${rotateX}deg` },
        { translateX: -150 },
        { translateY: -150 },
      ],
    };
  });
  
  // Breathing y floating del cuerpo
  const bodyStyle = useAnimatedStyle(() => {
    const translateY = interpolate(bodyHover.value, [-1, 0, 1], [4, 0, -4]);
    const rotateZ = interpolate(bodyHover.value, [-1, 0, 1], [-3, 0, 3]);
    const scaleY = interpolate(bodyHover.value, [-1, 0, 1], [0.98, 1, 1.02]);
    return {
      transform: [
        { translateY },
        { rotateZ: `${rotateZ}deg` },
        { scaleY },
      ],
    };
  });
  
  // Shimmer e iridiscencia dinámica
  const wingOpacityStyle = useAnimatedStyle(() => {
    const baseOpacity = interpolate(wingShimmer.value, [0, 1], [0.85, 0.98]);
    // Efecto iridiscente integrado
    const iridescenceEffect = interpolate(iridescence.value, [0, 0.5, 1], [1, 0.9, 1]);
    return { opacity: baseOpacity * iridescenceEffect };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Svg
        width={Math.min(SCREEN_WIDTH * 0.85, 320)}
        height={Math.min(SCREEN_WIDTH * 0.85, 320)}
        viewBox="0 0 300 300"
      >
      <Defs>
        {/* Gradientes iridiscentes premium - estilo fintech */}
        <RadialGradient id="wingGrad1" cx="35%" cy="35%">
          <Stop offset="0%" stopColor="#00FFE5" stopOpacity="0.75" />
          <Stop offset="30%" stopColor="#00D4FF" stopOpacity="0.65" />
          <Stop offset="60%" stopColor="#B388FF" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.3" />
        </RadialGradient>
        <RadialGradient id="wingGrad2" cx="65%" cy="35%">
          <Stop offset="0%" stopColor="#80DEEA" stopOpacity="0.75" />
          <Stop offset="30%" stopColor="#00D4FF" stopOpacity="0.65" />
          <Stop offset="60%" stopColor="#B388FF" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#7C4DFF" stopOpacity="0.3" />
        </RadialGradient>
        <RadialGradient id="wingGrad3" cx="35%" cy="65%">
          <Stop offset="0%" stopColor="#00FFD1" stopOpacity="0.7" />
          <Stop offset="40%" stopColor="#80DEEA" stopOpacity="0.6" />
          <Stop offset="80%" stopColor="#B388FF" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#9575CD" stopOpacity="0.25" />
        </RadialGradient>
        <RadialGradient id="wingGrad4" cx="65%" cy="65%">
          <Stop offset="0%" stopColor="#FFAB91" stopOpacity="0.7" />
          <Stop offset="40%" stopColor="#FFF59D" stopOpacity="0.6" />
          <Stop offset="80%" stopColor="#B388FF" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#9575CD" stopOpacity="0.25" />
        </RadialGradient>
        
        {/* Gradiente para el cuerpo - metalizado */}
        <RadialGradient id="bodyGrad" cx="50%" cy="40%">
          <Stop offset="0%" stopColor="#00E5FF" stopOpacity="1" />
          <Stop offset="50%" stopColor="#00B8D4" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#0091EA" stopOpacity="0.9" />
        </RadialGradient>
      </Defs>

      {/* Ala superior izquierda - Forma más orgánica */}
      <AnimatedG animatedProps={topLeftWingStyle}>
        <AnimatedPath
          d="M 150 150 Q 110 120 70 95 Q 55 75 58 55 Q 62 40 78 42 Q 95 50 115 80 Q 135 110 150 150 Z"
          fill="url(#wingGrad1)"
          stroke="#00E5FF"
          strokeWidth="1.5"
          animatedProps={wingOpacityStyle}
        />
        {/* Nervaduras internas con efecto glassmorphism */}
        <Path
          d="M 150 150 Q 115 125 85 100 M 150 150 Q 110 115 75 85 M 100 105 L 80 75"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          opacity="0.3"
          fill="none"
        />
      </AnimatedG>
      
      {/* Ala superior derecha */}
      <AnimatedG animatedProps={topRightWingStyle}>
        <AnimatedPath
          d="M 150 150 Q 190 120 230 95 Q 245 75 242 55 Q 238 40 222 42 Q 205 50 185 80 Q 165 110 150 150 Z"
          fill="url(#wingGrad2)"
          stroke="#00E5FF"
          strokeWidth="1.5"
          animatedProps={wingOpacityStyle}
        />
        <Path
          d="M 150 150 Q 185 125 215 100 M 150 150 Q 190 115 225 85 M 200 105 L 220 75"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          opacity="0.3"
          fill="none"
        />
      </AnimatedG>

      {/* Ala inferior izquierda - Más pequeña y delicada */}
      <AnimatedG animatedProps={bottomLeftWingStyle}>
        <AnimatedPath
          d="M 150 150 Q 115 170 88 195 Q 72 210 75 225 Q 80 235 93 232 Q 110 222 130 190 Q 142 170 150 150 Z"
          fill="url(#wingGrad3)"
          stroke="#80DEEA"
          strokeWidth="1.5"
          animatedProps={wingOpacityStyle}
        />
        <Path
          d="M 150 150 Q 120 175 95 200 M 150 150 Q 115 180 88 208"
          stroke="#FFFFFF"
          strokeWidth="0.7"
          opacity="0.25"
          fill="none"
        />
      </AnimatedG>

      {/* Ala inferior derecha */}
      <AnimatedG animatedProps={bottomRightWingStyle}>
        <AnimatedPath
          d="M 150 150 Q 185 170 212 195 Q 228 210 225 225 Q 220 235 207 232 Q 190 222 170 190 Q 158 170 150 150 Z"
          fill="url(#wingGrad4)"
          stroke="#80DEEA"
          strokeWidth="1.5"
          animatedProps={wingOpacityStyle}
        />
        <Path
          d="M 150 150 Q 180 175 205 200 M 150 150 Q 185 180 212 208"
          stroke="#FFFFFF"
          strokeWidth="0.7"
          opacity="0.25"
          fill="none"
        />
      </AnimatedG>

      {/* Cuerpo con breathing animation */}
      <AnimatedG animatedProps={bodyStyle}>
        {/* Abdomen - Elegante y estilizado */}
        <Path
          d="M 148 145 Q 146 185 147 230 Q 150 232 153 230 Q 154 185 152 145 Z"
          fill="url(#bodyGrad)"
          opacity="0.95"
        />
        
        {/* Segmentos del abdomen con glassmorphism */}
        <Path d="M 147 162 L 153 162" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" />
        <Path d="M 147 178 L 153 178" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.35" />
        <Path d="M 147 194 L 153 194" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.3" />
        <Path d="M 147 210 L 153 210" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.25" />
        
        {/* Highlights para efecto 3D */}
        <Path d="M 148.5 145 L 148.5 228" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.6" />

        {/* Tórax - Más robusto */}
        <Path
          d="M 144 145 Q 143 137 145 130 L 150 126 L 155 130 Q 157 137 156 145 Z"
          fill="url(#bodyGrad)"
          stroke="#00FFE5"
          strokeWidth="1.2"
          opacity="1"
        />

        {/* Cabeza - Forma más orgánica */}
        <Path
          d="M 146 126 Q 145 120 146 114 Q 148 110 150 110 Q 152 110 154 114 Q 155 120 154 126 Z"
          fill="#B388FF"
          stroke="#00FFE5"
          strokeWidth="1.2"
          opacity="1"
        />

        {/* Ojos compuestos - Más detallados */}
        <Path
          d="M 147 118 m -2.5 0 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0"
          fill="#00FFE5"
          opacity="1"
        />
        <Path
          d="M 153 118 m -2.5 0 a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0"
          fill="#00FFE5"
          opacity="1"
        />
        {/* Reflejos en los ojos */}
        <Path
          d="M 146.5 117 m -0.8 0 a 0.8 0.8 0 1 0 1.6 0 a 0.8 0.8 0 1 0 -1.6 0"
          fill="#FFFFFF"
          opacity="0.9"
        />
        <Path
          d="M 152.5 117 m -0.8 0 a 0.8 0.8 0 1 0 1.6 0 a 0.8 0.8 0 1 0 -1.6 0"
          fill="#FFFFFF"
          opacity="0.9"
        />

        {/* Patas - Más estilizadas */}
        <Path d="M 147 134 Q 140 138 134 144" stroke="#00E5FF" strokeWidth="1.3" opacity="0.75" />
        <Path d="M 153 134 Q 160 138 166 144" stroke="#00E5FF" strokeWidth="1.3" opacity="0.75" />
        <Path d="M 147 139 Q 138 146 128 154" stroke="#00E5FF" strokeWidth="1.3" opacity="0.7" />
        <Path d="M 153 139 Q 162 146 172 154" stroke="#00E5FF" strokeWidth="1.3" opacity="0.7" />
      </AnimatedG>
    </Svg>
    </Animated.View>
  );
};

export function AnimatedSplashScreen({
  children,
  onReady,
}: AnimatedSplashScreenProps) {
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashAnimationComplete, setSplashAnimationComplete] = useState(false);

  // Valores animados para transición suave
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  
  // Control maestro de la animación
  const masterProgress = useSharedValue(0);
  const dragonflyY = useSharedValue(-SCREEN_HEIGHT / 2);
  const dragonflyRotation = useSharedValue(0);
  const dragonflyScale = useSharedValue(0.3);
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    async function prepare() {
      try {
        // Ocultar el splash screen nativo
        await SplashScreen.hideAsync();

        // Aquí puedes cargar recursos, fuentes, etc.
        // await loadFonts();
        // await loadData();

        // Llamar callback opcional
        onReady?.();
      } catch (e) {
        console.warn('Error preparando la app:', e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, [onReady]);

  useEffect(() => {
    if (isAppReady) {
      // Valores para evitar warnings
      const masterProgressValue = masterProgress;
      const dragonflyYValue = dragonflyY;
      const dragonflyRotationValue = dragonflyRotation;
      const dragonflyScaleValue = dragonflyScale;
      const glowIntensityValue = glowIntensity;
      const opacityValue = opacity;
      const scaleValue = scale;

      // Secuencia optimizada (2.5 segundos total) - flujo continuo sin pausas
      masterProgressValue.value = withTiming(1, {
        duration: 2500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Ease asimétrico estándar
      });

      // Fase 1: Partículas morphing (0-1.4s) - overlapping con entrada de libélula
      // Las partículas tienen sus propias animaciones

      // Fase 2: Entrada de la libélula con anticipación y flow continuo (1.0-1.8s)
      dragonflyYValue.value = withSequence(
        // Anticipación breve y sutil
        withDelay(1000, withTiming(-SCREEN_HEIGHT / 2.3, {
          duration: 120, // Más corto
          easing: Easing.in(Easing.ease),
        })),
        // Entrada principal suave con ease-out asimétrico
        withTiming(8, {
          duration: 450,
          easing: Easing.bezier(0.16, 1, 0.3, 1), // Ease-out con overshoot sutil
        }),
        // Settle final rápido
        withSpring(0, {
          damping: 15,
          stiffness: 100,
          mass: 0.8,
        })
      );

      // Rotación sincronizada y fluida
      dragonflyRotationValue.value = withSequence(
        withDelay(1000, withTiming(-12, { duration: 120, easing: Easing.in(Easing.ease) })),
        withTiming(6, { duration: 350, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        withSpring(0, { damping: 12, stiffness: 100 })
      );

      // Escala con flow natural
      dragonflyScaleValue.value = withSequence(
        withDelay(1000, withTiming(0.5, { duration: 80 })),
        withSpring(1.05, {
          damping: 10,
          stiffness: 120,
        }),
        withSpring(1, {
          damping: 14,
          stiffness: 100,
        })
      );

      // Glow que empieza durante la entrada (overlapping)
      glowIntensityValue.value = withSequence(
        withDelay(1400, withTiming(1, { duration: 350, easing: Easing.bezier(0.16, 1, 0.3, 1) })),
        withTiming(0.5, { duration: 350, easing: Easing.inOut(Easing.ease) })
      );

      // Salida suave y elegante
      setTimeout(() => {
        opacityValue.value = withTiming(0, {
          duration: 500, // Más rápido
          easing: Easing.in(Easing.ease), // Ease-in para salida
        });
        scaleValue.value = withTiming(1.03, {
          duration: 500,
          easing: Easing.in(Easing.ease),
        });

        setTimeout(() => {
          runOnJS(setSplashAnimationComplete)(true);
        }, 500);
      }, 2500);
    }
  }, [isAppReady, masterProgress, dragonflyY, dragonflyRotation, dragonflyScale, glowIntensity, opacity, scale]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const dragonflyAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: dragonflyY.value },
        { rotate: `${dragonflyRotation.value}deg` },
        { scale: dragonflyScale.value },
      ],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const glowScale = interpolate(glowIntensity.value, [0, 1], [1, 1.5]);
    const glowOpacity = interpolate(glowIntensity.value, [0, 1], [0, 0.6]);
    
    return {
      transform: [{ scale: glowScale }],
      opacity: glowOpacity,
    };
  });

  // No mostrar nada hasta que el splash esté completo
  if (isSplashAnimationComplete) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* Renderizar contenido de la app en el fondo */}
      {isAppReady && children}

      {/* Overlay del splash screen animado */}
      <Animated.View style={[styles.splashContainer, containerAnimatedStyle]}>
        {/* Fondo premium con gradiente sofisticado */}
        <LinearGradient
          colors={['#0D1117', '#161B22', '#1C2128', '#21262D', '#0D1117']}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Overlay sutil para profundidad */}
        <View style={styles.backgroundOverlay} />

        {/* Campo de partículas con morphing líquido - timing escalonado fluido */}
        <View style={styles.particleContainer}>
          {Array.from({ length: 24 }).map((_, index) => (
            <Particle key={index} delay={index * 18} index={index} totalParticles={24} />
          ))}
        </View>

        {/* Efecto de glow glassmorphism */}
        <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
          <BlurView intensity={60} tint="light" style={styles.glow}>
            <LinearGradient
              colors={['#00E5FF', '#80DEEA', '#B388FF', '#FFF59D']}
              locations={[0, 0.3, 0.7, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glowInner}
            />
          </BlurView>
          {/* Anillo exterior sutil */}
          <View style={styles.glowRing} />
        </Animated.View>

        {/* Libélula animada */}
        <Animated.View style={[styles.dragonflyContainer, dragonflyAnimatedStyle]}>
          <DragonflyComponent progress={masterProgress} screenWidth={SCREEN_WIDTH} />
        </Animated.View>

        {/* Texto con glassmorphism premium */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: masterProgress,
            },
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.textBlurContainer}>
            <LinearGradient
              colors={['rgba(0, 229, 255, 0.15)', 'rgba(179, 136, 255, 0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.textGradient}
            >
              <Animated.Text style={styles.brandText}>
                Libélula<Animated.Text style={styles.brandTextBold}>Soft</Animated.Text>
              </Animated.Text>
            </LinearGradient>
          </BlurView>
          <Animated.Text style={styles.subText}>AGILIDAD TECNOLÓGICA</Animated.Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D1117',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 229, 255, 0.03)',
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  glowContainer: {
    position: 'absolute',
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glowInner: {
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  glowRing: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  dragonflyContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.18,
    alignItems: 'center',
    paddingHorizontal: 16,
    width: SCREEN_WIDTH,
  },
  textBlurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
  },
  textGradient: {
    paddingHorizontal: SCREEN_WIDTH < 350 ? 20 : 28,
    paddingVertical: 10,
    borderRadius: 20,
  },
  brandText: {
    fontSize: SCREEN_WIDTH < 350 ? 36 : SCREEN_WIDTH > 768 ? 48 : 42, // Móvil pequeño | Desktop | Normal
    fontWeight: '200',
    letterSpacing: SCREEN_WIDTH < 350 ? 4 : 6,
    color: '#FFFFFF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    flexWrap: 'nowrap', // No permitir salto de línea
    includeFontPadding: false,
  },
  brandTextBold: {
    fontWeight: '700',
    letterSpacing: SCREEN_WIDTH < 350 ? 4 : 6,
  },
  subText: {
    fontSize: SCREEN_WIDTH < 350 ? 9 : SCREEN_WIDTH > 768 ? 13 : 11,
    fontWeight: '400',
    letterSpacing: SCREEN_WIDTH < 350 ? 3 : SCREEN_WIDTH > 768 ? 6 : 4,
    color: '#80DEEA',
    marginTop: 12,
    textTransform: 'uppercase',
    opacity: 0.85,
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
