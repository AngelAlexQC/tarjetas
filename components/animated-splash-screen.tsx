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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Path, RadialGradient, Stop, G } from 'react-native-svg';

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

// Componente de partícula individual
const Particle = ({ delay, index }: { delay: number; index: number }) => {
  const progress = useSharedValue(0);
  const angle = (index / 30) * Math.PI * 2;
  const radius = 200 + Math.random() * 100;

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const x = interpolate(progress.value, [0, 1], [Math.cos(angle) * radius, 0]);
    const y = interpolate(progress.value, [0, 1], [Math.sin(angle) * radius, 0]);
    const opacity = interpolate(progress.value, [0, 0.3, 1], [0, 1, 0]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [0, 1, 0.3]);

    return {
      transform: [{ translateX: x }, { translateY: y }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          backgroundColor: [
            '#00D4FF',
            '#00FF88',
            '#9D4EDD',
            '#FFD700',
            '#FF1744',
            '#00E5FF',
          ][index % 6],
        },
      ]}
    />
  );
};

// Componente SVG de libélula con efecto holográfico
interface DragonflyProps {
  progress: ReturnType<typeof useSharedValue<number>>;
}

const DragonflyComponent = ({ progress }: DragonflyProps) => {
  // Animaciones de aleteo de alas - más rápido y continuo
  const wingFlapTop = useSharedValue(0);
  const wingFlapBottom = useSharedValue(0);
  const bodyHover = useSharedValue(0);
  const wingShimmer = useSharedValue(0);
  
  useEffect(() => {
    // Aleteo rápido de alas superiores (ciclos continuos)
    wingFlapTop.value = withDelay(
      2500,
      withSequence(
        withTiming(1, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 100, easing: Easing.inOut(Easing.ease) })
      )
    );
    
    // Aleteo de alas inferiores (ligeramente desfasado)
    wingFlapBottom.value = withDelay(
      2550,
      withSequence(
        withTiming(-0.8, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(-0.8, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(-0.8, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(-0.8, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 100, easing: Easing.inOut(Easing.ease) })
      )
    );
    
    // Movimiento de flotación del cuerpo
    bodyHover.value = withDelay(
      4000,
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.sin) })
      )
    );
    
    // Efecto de brillo en las alas
    wingShimmer.value = withDelay(
      3000,
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 }),
        withTiming(1, { duration: 400 }),
        withTiming(0.5, { duration: 400 })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.2, 0.5, 1], [0, 1, 1]);
    return { opacity };
  });
  
  // Estilos animados para las alas superiores izquierda
  const topLeftWingStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(wingFlapTop.value, [-1, 0, 1], [-25, 0, 15]);
    return {
      transform: [
        { translateX: 150 },
        { translateY: 150 },
        { rotateZ: `${rotateZ}deg` },
        { translateX: -150 },
        { translateY: -150 },
      ],
    };
  });
  
  // Estilos animados para las alas superiores derecha
  const topRightWingStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(wingFlapTop.value, [-1, 0, 1], [15, 0, -25]);
    return {
      transform: [
        { translateX: 150 },
        { translateY: 150 },
        { rotateZ: `${rotateZ}deg` },
        { translateX: -150 },
        { translateY: -150 },
      ],
    };
  });
  
  // Estilos animados para las alas inferiores izquierda
  const bottomLeftWingStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(wingFlapBottom.value, [-1, 0, 1], [20, 0, -15]);
    return {
      transform: [
        { translateX: 150 },
        { translateY: 150 },
        { rotateZ: `${rotateZ}deg` },
        { translateX: -150 },
        { translateY: -150 },
      ],
    };
  });
  
  // Estilos animados para las alas inferiores derecha
  const bottomRightWingStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(wingFlapBottom.value, [-1, 0, 1], [-15, 0, 20]);
    return {
      transform: [
        { translateX: 150 },
        { translateY: 150 },
        { rotateZ: `${rotateZ}deg` },
        { translateX: -150 },
        { translateY: -150 },
      ],
    };
  });
  
  // Movimiento sutil del cuerpo
  const bodyStyle = useAnimatedStyle(() => {
    const translateY = interpolate(bodyHover.value, [-1, 0, 1], [3, 0, -3]);
    const rotateZ = interpolate(bodyHover.value, [-1, 0, 1], [-2, 0, 2]);
    return {
      transform: [
        { translateY },
        { rotateZ: `${rotateZ}deg` },
      ],
    };
  });
  
  // Brillo dinámico de las alas
  const wingOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(wingShimmer.value, [0, 1], [0.75, 0.95]);
    return { opacity };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
      >
      <Defs>
        <RadialGradient id="wingGrad1" cx="30%" cy="30%">
          <Stop offset="0%" stopColor="#00FFB8" stopOpacity="0.6" />
          <Stop offset="50%" stopColor="#00D4FF" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.2" />
        </RadialGradient>
        <RadialGradient id="wingGrad2" cx="70%" cy="30%">
          <Stop offset="0%" stopColor="#00D4FF" stopOpacity="0.6" />
          <Stop offset="50%" stopColor="#9D4EDD" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#0066FF" stopOpacity="0.2" />
        </RadialGradient>
      </Defs>

      {/* Ala superior izquierda - Animada */}
      <AnimatedG animatedProps={topLeftWingStyle}>
        <AnimatedPath
          d="M 150 150 L 70 100 L 55 70 L 60 50 L 75 45 L 95 60 L 120 110 Z"
          fill="url(#wingGrad1)"
          stroke="#00D4FF"
          strokeWidth="2"
          animatedProps={wingOpacityStyle}
        />
      </AnimatedG>
      
      {/* Ala superior derecha - Animada */}
      <AnimatedG animatedProps={topRightWingStyle}>
        <AnimatedPath
          d="M 150 150 L 230 100 L 245 70 L 240 50 L 225 45 L 205 60 L 180 110 Z"
          fill="url(#wingGrad2)"
          stroke="#00D4FF"
          strokeWidth="2"
          animatedProps={wingOpacityStyle}
        />
      </AnimatedG>

      {/* Ala inferior izquierda - Animada */}
      <AnimatedG animatedProps={bottomLeftWingStyle}>
        <AnimatedPath
          d="M 150 150 L 85 185 L 70 210 L 75 225 L 90 230 L 105 215 L 130 175 Z"
          fill="url(#wingGrad1)"
          stroke="#00FFB8"
          strokeWidth="2"
          animatedProps={wingOpacityStyle}
        />
      </AnimatedG>

      {/* Ala inferior derecha - Animada */}
      <AnimatedG animatedProps={bottomRightWingStyle}>
        <AnimatedPath
          d="M 150 150 L 215 185 L 230 210 L 225 225 L 210 230 L 195 215 L 170 175 Z"
          fill="url(#wingGrad2)"
          stroke="#00FFB8"
          strokeWidth="2"
          animatedProps={wingOpacityStyle}
        />
      </AnimatedG>

      {/* Detalles internos de alas superiores - Nervaduras geométricas */}
      <Path
        d="M 150 150 L 80 90 M 150 150 L 70 80 M 90 100 L 75 70"
        stroke="#00D4FF"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />
      <Path
        d="M 150 150 L 220 90 M 150 150 L 230 80 M 210 100 L 225 70"
        stroke="#00D4FF"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      {/* Cuerpo con animación - Grupo animado */}
      <AnimatedG animatedProps={bodyStyle}>
        {/* Cuerpo - Delgado y recto (más geométrico) */}
        <Path
          d="M 147 145 L 147 230 L 153 230 L 153 145 Z"
          fill="#00D4FF"
          opacity="0.9"
        />
        
        {/* Segmentos del abdomen */}
        <Path d="M 147 160 L 153 160" stroke="#0066FF" strokeWidth="2" opacity="0.6" />
        <Path d="M 147 175 L 153 175" stroke="#0066FF" strokeWidth="2" opacity="0.6" />
        <Path d="M 147 190 L 153 190" stroke="#0066FF" strokeWidth="2" opacity="0.6" />
        <Path d="M 147 205 L 153 205" stroke="#0066FF" strokeWidth="2" opacity="0.6" />
        <Path d="M 147 220 L 153 220" stroke="#0066FF" strokeWidth="2" opacity="0.6" />

        {/* Tórax - Forma angular */}
        <Path
          d="M 145 145 L 145 130 L 150 125 L 155 130 L 155 145 Z"
          fill="#00D4FF"
          stroke="#00FFB8"
          strokeWidth="1.5"
          opacity="0.95"
        />

        {/* Cabeza - Más pequeña y angular */}
        <Path
          d="M 146 125 L 146 115 L 150 110 L 154 115 L 154 125 Z"
          fill="#9D4EDD"
          stroke="#FFD700"
          strokeWidth="1.5"
        />

        {/* Ojos - Puntos brillantes */}
        <Path
          d="M 148 118 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0"
          fill="#00FFE5"
          opacity="1"
        />
        <Path
          d="M 152 118 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0"
          fill="#00FFE5"
          opacity="1"
        />

        {/* Patas delanteras - Líneas delgadas con movimiento sutil */}
        <Path d="M 148 135 L 135 145" stroke="#00D4FF" strokeWidth="1.5" opacity="0.7" />
        <Path d="M 152 135 L 165 145" stroke="#00D4FF" strokeWidth="1.5" opacity="0.7" />
        
        {/* Patas medias */}
        <Path d="M 148 140 L 130 155" stroke="#00D4FF" strokeWidth="1.5" opacity="0.7" />
        <Path d="M 152 140 L 170 155" stroke="#00D4FF" strokeWidth="1.5" opacity="0.7" />
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
      // Secuencia completa de animación (5 segundos)
      masterProgress.value = withTiming(1, {
        duration: 5000,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });

      // Fase 1-2: Partículas y formación (0-2.5s)
      // Las partículas ya tienen sus propias animaciones

      // Fase 3: Vuelo de libélula (2.5-4s)
      dragonflyY.value = withSequence(
        withDelay(2500, withTiming(0, {
          duration: 1500,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1), // Elastic ease
        }))
      );

      dragonflyRotation.value = withSequence(
        withDelay(2500, withTiming(10, { duration: 300 })),
        withTiming(-10, { duration: 600 }),
        withTiming(5, { duration: 300 }),
        withTiming(0, { duration: 300 })
      );

      dragonflyScale.value = withSequence(
        withDelay(2500, withSpring(1, {
          damping: 8,
          stiffness: 80,
        }))
      );

      // Efecto glow al aterrizar
      glowIntensity.value = withSequence(
        withDelay(4000, withTiming(1, { duration: 500 })),
        withTiming(0.3, { duration: 500 })
      );

      // Salida final
      setTimeout(() => {
        opacity.value = withTiming(0, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withSpring(1.1, {
          damping: 10,
          stiffness: 100,
        });

        setTimeout(() => {
          runOnJS(setSplashAnimationComplete)(true);
        }, 800);
      }, 5000);
    }
  }, [isAppReady]);

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
        {/* Fondo con gradiente holográfico */}
        <LinearGradient
          colors={['#0A0E27', '#1A1F3A', '#2D1B4E', '#1A1F3A', '#0A0E27']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Campo de partículas convergentes */}
        <View style={styles.particleContainer}>
          {Array.from({ length: 40 }).map((_, index) => (
            <Particle key={index} delay={index * 20} index={index} />
          ))}
        </View>

        {/* Efecto de glow central */}
        <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
          <BlurView intensity={80} style={styles.glow}>
            <LinearGradient
              colors={['#00D4FF', '#9D4EDD', '#FFD700']}
              style={styles.glowInner}
            />
          </BlurView>
        </Animated.View>

        {/* Libélula animada */}
        <Animated.View style={[styles.dragonflyContainer, dragonflyAnimatedStyle]}>
          <DragonflyComponent progress={masterProgress} />
        </Animated.View>

        {/* Texto con efecto holográfico */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: masterProgress,
            },
          ]}
        >
          <LinearGradient
            colors={['#00D4FF', '#00FFB8', '#9D4EDD', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.textGradient}
          >
            <Animated.Text style={styles.brandText}>
              Libélula<Animated.Text style={styles.brandTextBold}>Soft</Animated.Text>
            </Animated.Text>
          </LinearGradient>
          <Animated.Text style={styles.subText}>Agilidad Tecnológica</Animated.Text>
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
    backgroundColor: '#0A0E27',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  glowContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
  },
  glowInner: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  dragonflyContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.2,
    alignItems: 'center',
  },
  textGradient: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  brandText: {
    fontSize: 48,
    fontWeight: '200',
    letterSpacing: 8,
    color: '#FFFFFF',
    textShadowColor: '#00D4FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  brandTextBold: {
    fontWeight: '700',
  },
  subText: {
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 4,
    color: '#00FFB8',
    marginTop: 8,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
});
