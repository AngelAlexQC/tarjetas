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
import Svg, { Defs, Path, RadialGradient, Stop } from 'react-native-svg';

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
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.2, 0.5, 1], [0, 1, 1]);
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
        <RadialGradient id="bodyGrad" cx="50%" cy="50%">
          <Stop offset="0%" stopColor="#00D4FF" stopOpacity="1" />
          <Stop offset="50%" stopColor="#9D4EDD" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#0066FF" stopOpacity="0.8" />
        </RadialGradient>
        <RadialGradient id="wingGrad1" cx="30%" cy="30%">
          <Stop offset="0%" stopColor="#00FFB8" stopOpacity="0.4" />
          <Stop offset="40%" stopColor="#00D4FF" stopOpacity="0.25" />
          <Stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.15" />
        </RadialGradient>
        <RadialGradient id="wingGrad2" cx="70%" cy="30%">
          <Stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
          <Stop offset="40%" stopColor="#FF1744" stopOpacity="0.25" />
          <Stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.15" />
        </RadialGradient>
      </Defs>

      {/* Ala superior izquierda */}
      <Path
        d="M 150 150 Q 80 100, 70 60 Q 65 40, 75 30 Q 90 25, 100 40 Q 120 80, 150 150 Z"
        fill="url(#wingGrad1)"
        stroke="#00D4FF"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Ala superior derecha */}
      <Path
        d="M 150 150 Q 220 100, 230 60 Q 235 40, 225 30 Q 210 25, 200 40 Q 180 80, 150 150 Z"
        fill="url(#wingGrad2)"
        stroke="#FFD700"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Ala inferior izquierda */}
      <Path
        d="M 150 150 Q 90 180, 80 210 Q 75 230, 85 240 Q 100 245, 110 230 Q 130 190, 150 150 Z"
        fill="url(#wingGrad1)"
        stroke="#00FFB8"
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Ala inferior derecha */}
      <Path
        d="M 150 150 Q 210 180, 220 210 Q 225 230, 215 240 Q 200 245, 190 230 Q 170 190, 150 150 Z"
        fill="url(#wingGrad2)"
        stroke="#9D4EDD"
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Cuerpo - Abdomen segmentado */}
      <Path
        d="M 150 140 L 150 220 Q 150 230, 145 235 Q 150 240, 155 235 Q 150 230, 150 220 Z"
        fill="url(#bodyGrad)"
        stroke="#0066FF"
        strokeWidth="2"
      />

      {/* Tórax */}
      <Path
        d="M 145 140 Q 145 120, 150 115 Q 155 120, 155 140 Z"
        fill="url(#bodyGrad)"
        stroke="#00D4FF"
        strokeWidth="2"
      />

      {/* Cabeza */}
      <Path
        d="M 150 115 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0"
        fill="#9D4EDD"
        stroke="#FFD700"
        strokeWidth="1.5"
      />

      {/* Ojos holográficos */}
      <Path
        d="M 143 113 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0"
        fill="#00FFE5"
        opacity="0.9"
      />
      <Path
        d="M 157 113 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0"
        fill="#00FFE5"
        opacity="0.9"
      />

      {/* Detalles iridiscentes en las alas */}
      <Path
        d="M 90 80 Q 100 70, 110 85"
        stroke="#FFD700"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <Path
        d="M 210 80 Q 200 70, 190 85"
        stroke="#00FFE5"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
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
            <Animated.Text style={styles.brandText}>Libélula</Animated.Text>
          </LinearGradient>
          <Animated.Text style={styles.subText}>Financial Evolution</Animated.Text>
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
