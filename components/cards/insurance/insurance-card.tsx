import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatCurrency } from '@/utils/formatters/currency';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Insurance } from './insurance-generator';

interface InsuranceCardProps {
  insurance: Insurance;
  index: number;
  onPress: () => void;
}

// Mapeo de iconos personalizados a Ionicons
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  heart: 'heart',
  shield: 'shield-checkmark',
  briefcase: 'briefcase',
  airplane: 'airplane',
  medical: 'medical',
  cart: 'cart',
  lock: 'lock-closed',
  globe: 'globe',
};

// Colores minimalistas por tipo de seguro
const INSURANCE_COLORS: Record<string, string> = {
  vida: '#FF3B30',
  fraude: '#007AFF',
  desempleo: '#FF9500',
  'viaje-accidente': '#5856D6',
  incapacidad: '#34C759',
  compras: '#FF2D55',
  robo: '#5AC8FA',
  'asistencia-viaje': '#FFCC00',
};

// Badges minimalistas
const BADGE_COLORS: Record<string, string> = {
  Popular: '#FF3B30',
  Recomendado: '#34C759',
  Nuevo: '#5856D6',
  Disponible: '#007AFF',
};

export function InsuranceCard({ insurance, index, onPress }: InsuranceCardProps) {
  const theme = useAppTheme();
  const accentColor = INSURANCE_COLORS[insurance.type] || INSURANCE_COLORS.fraude;
  
  // Solo animar los primeros 3 items en carousel horizontal
  const shouldAnimate = index < 3;

  const styles = StyleSheet.create({
    container: {
      width: 320,
      marginRight: 8,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    },
    pressable: {
      flex: 1,
    },
    content: {
      padding: 14,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 10,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${accentColor}15`,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
      letterSpacing: -0.2,
    },
    description: {
      fontSize: 12,
      opacity: 0.5,
      lineHeight: 16,
    },
    badge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: insurance.badge ? `${BADGE_COLORS[insurance.badge]}15` : 'transparent',
    },
    badgeText: {
      fontSize: 9,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: insurance.badge ? BADGE_COLORS[insurance.badge] : theme.colors.text,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    },
    stat: {
      flex: 1,
    },
    statLabel: {
      fontSize: 10,
      opacity: 0.4,
      marginBottom: 3,
      fontWeight: '500',
    },
    statValue: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    divider: {
      width: 1,
      height: 24,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
      marginHorizontal: 12,
    },
    arrowContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
  });

  // Formatear monto con separadores de miles
  const formatAmount = (amount: number): string => {
    return formatCurrency(amount, {
      locale: 'en-US',
      currency: insurance.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const ContainerView = shouldAnimate ? Animated.View : View;
  const animationProps = shouldAnimate
    ? { entering: FadeInUp.delay(index * 50).duration(300) }
    : {};

  return (
    <ContainerView
      {...animationProps}
      style={styles.container}
    >
      <Pressable
        style={styles.pressable}
        onPress={onPress}
        android_ripple={{
          color: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <View style={styles.content}>
          {/* Top row compacta */}
          <View style={styles.topRow}>
            <View style={styles.leftSection}>
              {/* Icono minimalista */}
              <View style={styles.iconCircle}>
                <Ionicons
                  name={ICON_MAP[insurance.icon] || 'shield-checkmark'}
                  size={20}
                  color={accentColor}
                />
              </View>

              {/* Textos compactos */}
              <View style={styles.textContainer}>
                <ThemedText style={styles.title}>{insurance.title}</ThemedText>
                <ThemedText style={styles.description} numberOfLines={1}>
                  {insurance.description}
                </ThemedText>
              </View>
            </View>

            {/* Badge minimalista */}
            {insurance.badge && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>
                  {insurance.badge}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Stats row horizontal */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <ThemedText style={styles.statLabel}>Cobertura</ThemedText>
              <ThemedText style={styles.statValue}>
                {formatAmount(insurance.coverageAmount)}
              </ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.stat}>
              <ThemedText style={styles.statLabel}>Desde</ThemedText>
              <ThemedText style={styles.statValue}>
                {formatAmount(insurance.monthlyPrice)}
              </ThemedText>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={accentColor}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </ContainerView>
  );
}
