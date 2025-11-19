import * as SplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

// Prevenir que el splash screen nativo se oculte automáticamente
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignorar errores de race condition al recargar la app */
});

interface AnimatedSplashScreenProps {
  children: ReactNode;
  onReady?: () => void;
}

export function AnimatedSplashScreen({
  children,
  onReady,
}: AnimatedSplashScreenProps) {
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashAnimationComplete, setSplashAnimationComplete] = useState(false);

  // Valores animados para transición suave
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

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

  const onAnimationFinish = useCallback(() => {
    if (isAppReady) {
      // Animar salida del splash screen
      opacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withSpring(1.2, {
        damping: 10,
        stiffness: 100,
      });

      // Marcar animación como completa después de la transición
      setTimeout(() => {
        runOnJS(setSplashAnimationComplete)(true);
      }, 500);
    }
  }, [isAppReady, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
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
      <Animated.View style={[styles.splashContainer, animatedStyle]}>
        <LottieView
          source={require('@/assets/animations/splash.json')}
          autoPlay
          loop={false}
          onAnimationFinish={onAnimationFinish}
          style={styles.animation}
        />
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
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  animation: {
    width: 300,
    height: 300,
  },
});
