/**
 * AuthLogoHeader Component
 * 
 * Logo header reutilizable para pantallas de autenticación.
 * Muestra el logo de Libélula con gradiente y animación.
 */

import { DragonflyLoading } from '@/components/ui/dragonfly-loading';
import { GradientText } from '@/components/ui/gradient-text';
import { ThemedText } from '@/ui/primitives/themed-text';
import { BrandColors } from '@/constants';
import { useAppTheme } from '@/ui/theming';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface AuthLogoHeaderProps {
  /** Tamaño del logo (small, medium, large) */
  size?: 'small' | 'medium' | 'large';
  /** Mostrar subtítulo "Agilidad Tecnológica" */
  showSubtitle?: boolean;
  /** Estilo adicional para el contenedor */
  style?: ViewStyle;
}

const SIZES = {
  small: { logo: 60, fontSize: 20, textWidth: 140, textHeight: 28 },
  medium: { logo: 80, fontSize: 24, textWidth: 160, textHeight: 32 },
  large: { logo: 100, fontSize: 28, textWidth: 200, textHeight: 40 },
};

export function AuthLogoHeader({ 
  size = 'medium', 
  showSubtitle = false,
  style 
}: AuthLogoHeaderProps) {
  const theme = useAppTheme();
  const sizeConfig = SIZES[size];
  
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[...BrandColors.gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          { borderRadius: size === 'large' ? 32 : 24 }
        ]}
      >
        <View style={[
          styles.inner, 
          { 
            backgroundColor: theme.colors.background,
            borderRadius: size === 'large' ? 30 : 22,
            paddingVertical: size === 'large' ? 32 : 20,
            paddingHorizontal: size === 'large' ? 48 : 32,
          }
        ]}>
          <DragonflyLoading 
            width={sizeConfig.logo} 
            height={sizeConfig.logo} 
            style={{ marginBottom: showSubtitle ? 16 : 8 }} 
          />
          <GradientText 
            text="LIBÉLULA" 
            fontSize={sizeConfig.fontSize} 
            width={sizeConfig.textWidth} 
            height={sizeConfig.textHeight}
            style={showSubtitle ? { marginBottom: 4 } : undefined}
          />
          {showSubtitle && (
            <ThemedText 
              type="defaultSemiBold" 
              style={[
                styles.subtitle, 
                { color: theme.colors.textSecondary }
              ]}
            >
              Agilidad Tecnológica
            </ThemedText>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  gradient: {
    padding: 2,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inner: {
    alignItems: 'center',
  },
  subtitle: {
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontSize: 12,
    opacity: 0.8,
  },
});
