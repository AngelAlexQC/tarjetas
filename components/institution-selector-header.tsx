import { ThemedText } from "@/components/themed-text";
import { useTenantTheme } from "@/contexts/tenant-theme-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Header minimalista moderno - Fintech Design 2025
 * Siguiendo tendencias de apps como Revolut, N26, Nubank
 * - Diseño limpio sin bordes pesados
 * - Avatar de institución prominente con gradiente
 * - Tipografía clara y jerárquica
 * - Micro-animaciones sutiles
 * - Espaciado generoso
 */
export function InstitutionSelectorHeader() {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { currentTheme } = useTenantTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scaleValue = useSharedValue(1);
  const glowValue = useSharedValue(0);
  
  const containerWidth = layout.isLandscape 
    ? Math.min(layout.screenWidth * 0.6, 500)
    : layout.screenWidth * 0.85;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowValue.value,
  }));

  const handlePress = () => {
    router.push("/" as any);
  };

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.97, { damping: 20, stiffness: 300 });
    glowValue.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 20, stiffness: 300 });
    glowValue.value = withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(0, { duration: 200 })
    );
  };

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 8 }]}>
      <Animated.View style={[styles.container, { width: containerWidth }, animatedStyle]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.pressable}
        >
          {/* Glow effect de fondo al presionar */}
          <Animated.View style={[styles.glowBackground, glowStyle]}>
            <LinearGradient
              colors={[
                `${theme.tenant.mainColor}15`,
                `${theme.tenant.mainColor}05`,
                'transparent'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>

          <View style={[styles.content, {
            backgroundColor: theme.isDark 
              ? 'rgba(28, 28, 30, 0.6)'
              : 'rgba(255, 255, 255, 0.7)'
          }]}>
            {/* Avatar de institución con logo real */}
            <View style={styles.avatarContainer}>
              {/* Logo de la institución */}
              <Image
                source={{ uri: currentTheme?.logoUrl }}
                style={styles.institutionLogo}
                contentFit="contain"
                transition={200}
                placeholder={require('@/assets/images/icon.png')}
              />
            </View>

            {/* Dot de estado */}
            <View style={[styles.statusDot, { 
              backgroundColor: theme.tenant.mainColor 
            }]} />

            {/* Nombre de la institución */}
            <ThemedText style={styles.institutionName} numberOfLines={1}>
              {currentTheme?.name || "Seleccionar institución"}
            </ThemedText>

            {/* Chevron minimalista */}
            <ThemedText style={[styles.chevron, {
              color: theme.colors.textSecondary
            }]}>
              ›
            </ThemedText>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  container: {
    // El ancho se aplica din\u00e1micamente en el componente
  },
  pressable: {
    borderRadius: 16,
    overflow: "hidden",
  },
  glowBackground: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: '4%',
    paddingVertical: '2.5%',
    gap: '3%',
    borderRadius: 16,
    // Shadow sutil y moderna
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 6,
    // Shadow para el avatar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  institutionLogo: {
    width: 30,
    height: 30,
  },
  statusDot: {
    aspectRatio: 1,
    width: '1.8%',
    borderRadius: 100,
    flexShrink: 0,
  },
  institutionName: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.3,
    flex: 1,
  },
  chevron: {
    fontSize: 22,
    fontWeight: "400",
    opacity: 0.3,
    flexShrink: 0,
  },
});
