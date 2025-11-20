/**
 * CardFinancialInfo - Panel de información financiera con glassmorphism
 * Diseño 2025: Clean, professional, con micro-animaciones
 */

import { ThemedText } from '@/components/themed-text';
import { AnimatedNumber } from '@/components/ui/animated-number';
import type { Card } from '@/features/cards/services/card-service';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatRelativeDate } from '@/utils/formatters/date';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { StatusBadge } from './status-badge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CardFinancialInfoProps {
  card: Card;
  locale?: string;
  currency?: string;
  currencySymbol?: string;
}

export const CardFinancialInfo: React.FC<CardFinancialInfoProps> = ({
  card,
  locale = 'en-US',
  currency = 'USD',
  currencySymbol = '$',
}) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const isCredit = card.cardType === 'credit';
  const balance = card.balance;
  const creditLimit = card.creditLimit || 0;
  const availableCredit = card.availableCredit || 0;
  const usedCredit = creditLimit - availableCredit;

  // Información de fechas (mockup - en producción vendrían del backend)
  const nextPaymentDays = 12;
  const lastPaymentDays = 3;

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(300)}
      layout={LinearTransition.springify().damping(25).stiffness(90)}
      style={styles.container}
    >
      {Platform.OS === 'ios' ? (
        <BlurView 
          intensity={theme.isDark ? 30 : 20} 
          tint={theme.isDark ? 'dark' : 'light'} 
          style={[styles.blurContainer, { borderColor: theme.colors.borderSubtle }]}
        >
          <CardFinancialInfoContent
            card={card}
            isCredit={isCredit}
            balance={balance}
            creditLimit={creditLimit}
            usedCredit={usedCredit}
            nextPaymentDays={nextPaymentDays}
            lastPaymentDays={lastPaymentDays}
            locale={locale}
            currency={currency}
            currencySymbol={currencySymbol}
          />
        </BlurView>
      ) : (
        <View style={[styles.androidContainer, { 
          backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.96)',
          borderColor: theme.colors.borderSubtle,
        }]}>
          <CardFinancialInfoContent
            card={card}
            isCredit={isCredit}
            balance={balance}
            creditLimit={creditLimit}
            usedCredit={usedCredit}
            nextPaymentDays={nextPaymentDays}
            lastPaymentDays={lastPaymentDays}
            locale={locale}
            currency={currency}
            currencySymbol={currencySymbol}
          />
        </View>
      )}
    </Animated.View>
  );
};

interface CardFinancialInfoContentProps {
  card: Card;
  isCredit: boolean;
  balance: number;
  creditLimit: number;
  usedCredit: number;
  nextPaymentDays: number;
  lastPaymentDays: number;
  locale: string;
  currency: string;
  currencySymbol: string;
}

const CardFinancialInfoContent: React.FC<CardFinancialInfoContentProps> = ({
  card,
  isCredit,
  balance,
  creditLimit,
  usedCredit,
  nextPaymentDays,
  lastPaymentDays,
  locale,
  currency,
  currencySymbol,
}) => {
  const styles = useStyles();
  const isDebit = card.cardType === 'debit';
  const isVirtual = card.cardType === 'virtual';
  
  // Cálculos específicos por tipo de tarjeta
  const usagePercentage = isCredit && creditLimit > 0 
    ? Math.round((usedCredit / creditLimit) * 100) 
    : 0;
  const availableCredit = isCredit ? creditLimit - usedCredit : balance;
  
  // Para débito: límites diarios (mockup - vendrían del backend)
  const dailyPurchaseLimit = isDebit ? 5000 : 0;
  const dailyATMLimit = isDebit ? 2000 : 0;
  const todaySpent = isDebit ? 1250 : 0; // Mockup
  
  // Para virtual/prepago: límites y recargas
  const spendingLimit = isVirtual ? 3000 : 0;
  const isReloadable = isVirtual ? true : false;
  
  // Cálculos para información de pagos (crédito)
  const minimumPayment = isCredit && creditLimit > 0 ? usedCredit * 0.05 : 0;
  const isPaymentSoon = isCredit && nextPaymentDays <= 5;

  // Colores semánticos mejorados para accesibilidad
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return { bg: 'rgba(255, 59, 48, 0.12)', fg: '#FF3B30' };
    if (percentage >= 75) return { bg: 'rgba(255, 149, 0, 0.12)', fg: '#FF9500' };
    if (percentage >= 50) return { bg: 'rgba(255, 204, 0, 0.12)', fg: '#FFCC00' };
    return { bg: 'rgba(52, 199, 89, 0.12)', fg: '#34C759' };
  };
  
  const usageColors = getUsageColor(usagePercentage);

  return (
    <Animated.View 
      style={styles.content}
      layout={LinearTransition.springify().damping(25).stiffness(90)}
    >
      {/* Balance principal - Hero section minimalista */}
      <View style={styles.heroSection}>
        <AnimatedNumber 
          value={balance}
          style={styles.heroAmount}
          prefix={currencySymbol}
          decimals={2}
          duration={1000}
          locale={locale}
        />
        <ThemedText style={styles.heroLabel}>
          {isCredit ? 'Saldo actual' : isDebit ? 'Disponible' : 'Balance'}
        </ThemedText>
      </View>

      {/* Stats compactos - Solo info esencial */}
      {isCredit && creditLimit > 0 ? (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {new Intl.NumberFormat(locale, { 
                style: 'currency', 
                currency, 
                notation: 'compact',
                maximumFractionDigits: 1 
              }).format(availableCredit)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>disponible</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{usagePercentage}%</ThemedText>
            <ThemedText style={styles.statLabel}>usado</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{nextPaymentDays}d</ThemedText>
            <ThemedText style={styles.statLabel}>próximo pago</ThemedText>
          </View>
        </View>
      ) : isDebit ? (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {new Intl.NumberFormat(locale, { 
                style: 'currency', 
                currency, 
                notation: 'compact',
                maximumFractionDigits: 1 
              }).format(todaySpent)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>hoy</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {new Intl.NumberFormat(locale, { 
                style: 'currency', 
                currency, 
                notation: 'compact',
                maximumFractionDigits: 1 
              }).format(dailyPurchaseLimit)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>límite diario</ThemedText>
          </View>
        </View>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {new Intl.NumberFormat(locale, { 
                style: 'currency', 
                currency, 
                notation: 'compact',
                maximumFractionDigits: 1 
              }).format(spendingLimit)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>límite</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {isReloadable ? '∞' : '1×'}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              {isReloadable ? 'recargas' : 'uso único'}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Barra de progreso minimalista - Solo para crédito con uso */}
      {isCredit && creditLimit > 0 && usedCredit > 0 && (
        <Animated.View 
          style={styles.progressContainer}
          entering={FadeIn.duration(400)}
        >
          <View style={styles.progressTrack}>
            <Animated.View 
              style={[
                styles.progressBar,
                { 
                  width: `${Math.min(usagePercentage, 100)}%`,
                  backgroundColor: usageColors.fg,
                }
              ]}
              entering={FadeIn.duration(600)}
            />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.85,
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 16,
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  blurContainer: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.borderSubtle,
    overflow: 'hidden',
  },
  androidContainer: {
    backgroundColor: theme.isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.borderSubtle,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  // Hero section - Balance principal
  heroSection: {
    alignItems: 'center',
    gap: 4,
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1.5,
    color: theme.colors.text,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.5,
    color: theme.colors.textSecondary,
  },
  // Stats row minimalista
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'lowercase',
    letterSpacing: 0.3,
    opacity: 0.5,
    color: theme.colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.borderSubtle,
    opacity: 0.3,
  },
  // Progress bar minimalista
  progressContainer: {
    marginTop: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.helpers.getSurface(1),
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },

});

// Hook para usar estilos con tema
function useStyles() {
  const theme = useAppTheme();
  return React.useMemo(() => createStyles(theme), [theme.mode]);
}
