import { ThemedText } from "@/components/themed-text";
import { useTenantTheme } from "@/contexts/tenant-theme-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  const [imageError, setImageError] = useState(false);
  
  // Resetear error de imagen cuando cambia el tema
  useEffect(() => {
    setImageError(false);
  }, [currentTheme?.slug]);
  
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
            backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
            shadowColor: theme.tenant.mainColor,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: theme.isDark ? 0.6 : 0.35,
            shadowRadius: 10,
            elevation: 6,
          }]}>
            {/* Avatar de institución con logo real */}
            <View style={[styles.avatarContainer, {
              backgroundColor: '#FFFFFF',
              shadowColor: theme.isDark ? '#000' : theme.tenant.mainColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme.isDark ? 0.3 : 0.2,
              shadowRadius: 4,
              elevation: 3,
            }]}>
              {imageError || !currentTheme?.logoUrl ? (
                <View style={[styles.logoFallback, { backgroundColor: `${theme.tenant.mainColor}20` }]}>
                  <Text style={[styles.logoFallbackText, { color: theme.tenant.mainColor }]}>
                    {(currentTheme?.name || "??").substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: currentTheme.logoUrl }}
                  style={styles.institutionLogo}
                  contentFit="contain"
                  transition={200}
                  onError={() => setImageError(true)}
                />
              )}
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
              color: theme.isDark 
                ? theme.colors.textSecondary
                : 'rgba(0, 0, 0, 0.25)'
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
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: 6,
  },
  institutionLogo: {
    width: 30,
    height: 30,
  },
  logoFallback: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  logoFallbackText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
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
