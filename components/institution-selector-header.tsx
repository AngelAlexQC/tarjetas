import { ThemedText } from "@/components/themed-text";
import { useTenantTheme } from "@/contexts/tenant-theme-context";
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { homeRoute } from '@/types/routes';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Helper functions to reduce complexity
const getContainerWidth = (isLandscape: boolean, screenWidth: number) => {
  const widthPercentage = isLandscape ? 0.5 : 0.9;
  return Math.min(screenWidth * widthPercentage, 420);
};

const getPlatformStyles = (isDark: boolean) => {
  const isIOS = Platform.OS === 'ios';
  const borderRadius = isIOS ? 10 : 24;
  
  const backgroundColor = isDark 
    ? (isIOS ? 'rgba(28, 28, 30, 0.6)' : '#1C1C1E') 
    : (isIOS ? 'rgba(255, 255, 255, 0.8)' : '#FFFFFF');
    
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const shadowOpacity = isDark ? 0.3 : 0.05;
  const logoContainerRadius = isIOS ? 8 : 12;

  return { isIOS, borderRadius, backgroundColor, borderColor, shadowOpacity, logoContainerRadius };
};

const getTopPadding = (hasHeader: boolean, insetsTop: number) => {
  const isIOS = Platform.OS === 'ios';
  return isIOS ? (hasHeader ? 10 : insetsTop + 10) : 10;
};

/**
 * Header minimalista moderno - Fintech Design 2025
 * Diseño "Flat & Clean" optimizado para Dark Mode
 */
export function InstitutionSelectorHeader({ hasHeader = true }: { hasHeader?: boolean }) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { currentTheme } = useTenantTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scaleValue = useSharedValue(1);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    setImageError(false);
  }, [currentTheme?.slug]);
  
  const containerWidth = getContainerWidth(layout.isLandscape, layout.screenWidth);
  const platformStyles = getPlatformStyles(theme.isDark);
  const topPadding = getTopPadding(hasHeader, insets.top);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePress = () => router.push(homeRoute());
  const handlePressIn = () => { scaleValue.value = withSpring(0.98, { damping: 15 }); };
  const handlePressOut = () => { scaleValue.value = withSpring(1, { damping: 15 }); };

  const logoContainerBg = theme.isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5';
  const textColor = theme.isDark ? '#FFFFFF' : '#000000';
  const actionBg = theme.isDark ? 'rgba(255,255,255,0.1)' : '#F0F0F0';

  const Content = () => (
    <View style={styles.contentRow}>
      <View style={[styles.logoContainer, { 
        backgroundColor: logoContainerBg,
        borderRadius: platformStyles.logoContainerRadius
      }]}>
        {currentTheme.branding.logoUrl && !imageError ? (
          <Image
            source={{ uri: currentTheme.branding.logoUrl }}
            style={styles.logo}
            contentFit="contain"
            onError={() => setImageError(true)}
            transition={300}
          />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: theme.tenant.mainColor }]}>
            <ThemedText style={styles.logoInitial}>
              {currentTheme.name.charAt(0)}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.textContainer}>
        <ThemedText 
          type="defaultSemiBold" 
          style={[styles.institutionName, { color: textColor }]} 
          numberOfLines={1}
        >
          {currentTheme?.name}
        </ThemedText>
      </View>

      <View style={[styles.actionIconContainer, { 
        backgroundColor: actionBg,
        borderRadius: 14
      }]}>
        <Ionicons 
          name="chevron-down" 
          size={16} 
          color={textColor} 
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.wrapper, { paddingTop: topPadding }]}>
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <Animated.View 
          style={[styles.container, { width: containerWidth, borderRadius: platformStyles.borderRadius }, animatedStyle]}
        >
          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={({ pressed }) => [
              styles.pressable, 
              { 
                borderRadius: platformStyles.borderRadius,
                borderColor: platformStyles.borderColor,
                shadowColor: '#000000',
                shadowOpacity: platformStyles.shadowOpacity,
                backgroundColor: platformStyles.isIOS ? 'transparent' : platformStyles.backgroundColor,
                opacity: pressed ? 0.9 : 1
              }
            ]}
          >
            {platformStyles.isIOS ? (
              <BlurView 
                intensity={theme.isDark ? 40 : 60} 
                tint={theme.isDark ? 'dark' : 'light'}
                style={[StyleSheet.absoluteFill, { borderRadius: platformStyles.borderRadius }]}
              >
                <View style={[StyleSheet.absoluteFill, { backgroundColor: platformStyles.backgroundColor }]} />
                <Content />
              </BlurView>
            ) : (
              <Content />
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    zIndex: 100,
    marginBottom: 16,
  },
  container: {
    height: 60,
    // borderRadius se maneja dinámicamente
  },
  pressable: {
    flex: 1,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    justifyContent: 'center',
    overflow: 'hidden', // Importante para el BlurView
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%', // Asegurar que ocupe todo el alto
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 28,
    height: 28,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  institutionName: {
    fontSize: 15,
  },
  actionIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
