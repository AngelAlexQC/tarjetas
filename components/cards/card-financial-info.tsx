/**
 * CardFinancialInfo - Panel de información financiera con glassmorphism
 * Diseño 2025: Clean, professional, con micro-animaciones
 */

import { ThemedText } from '@/components/themed-text';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { InfoIcon } from '@/components/ui/info-icon';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { Card } from '@/features/cards/services/card-service';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { formatCurrency } from '@/utils/formatters/currency';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

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
  const layout = useResponsiveLayout();
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
          currency={currency}
          decimals={2}
          duration={1000}
          locale={locale}
        />
        <View style={styles.heroLabelContainer}>
          <ThemedText style={styles.heroLabel}>
            {isCredit ? 'Saldo actual' : isDebit ? 'Disponible' : 'Balance'}
          </ThemedText>
          <InfoTooltip
            title={isCredit ? 'Saldo Actual' : isDebit ? 'Saldo Disponible' : 'Balance'}
            content={
              isCredit
                ? 'Es el total que has usado de tu línea de crédito. Este monto debe ser pagado en o antes de la fecha de vencimiento.'
                : isDebit
                ? 'Es el dinero que tienes disponible en tu cuenta para usar inmediatamente en compras o retiros.'
                : 'Es el saldo total disponible en tu tarjeta virtual. Puede ser recargable o de un solo uso.'
            }
            placement="bottom"
          >
            <View style={styles.infoIconWrapper}>
              <InfoIcon size={14} />
            </View>
          </InfoTooltip>
        </View>
      </View>

      {/* Stats compactos - Solo info esencial */}
      {isCredit && creditLimit > 0 ? (
        <View style={styles.statsRow}>
          <InfoTooltip
            title="Crédito Disponible"
            content={`Tienes ${formatCurrency(availableCredit, { locale, currency })} disponibles de tu línea de crédito de ${formatCurrency(creditLimit, { locale, currency })}. Este es el monto que puedes usar sin exceder tu límite.`}
            placement="bottom"
          >
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {formatCurrency(availableCredit, {
                  locale,
                  currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </ThemedText>
              <View style={styles.statLabelWithIcon}>
                <ThemedText style={styles.statLabel}>disponible</ThemedText>
                <InfoIcon size={12} opacity={0.3} />
              </View>
            </View>
          </InfoTooltip>
          <View style={styles.statDivider} />
          <InfoTooltip
            title="Porcentaje de Uso"
            content={`Has usado el ${usagePercentage}% de tu línea de crédito. ${usagePercentage >= 75 ? 'Se recomienda mantener el uso por debajo del 30% para un mejor score crediticio.' : 'Mantén un buen manejo de tu crédito.'}`}
            placement="bottom"
          >
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{usagePercentage}%</ThemedText>
              <View style={styles.statLabelWithIcon}>
                <ThemedText style={styles.statLabel}>usado</ThemedText>
                <InfoIcon size={12} opacity={0.3} />
              </View>
            </View>
          </InfoTooltip>
          <View style={styles.statDivider} />
          <InfoTooltip
            title="Próximo Pago"
            content={`Tienes ${nextPaymentDays} días para realizar tu pago. ${isPaymentSoon ? 'Tu fecha de pago está cerca, considera programar tu pago pronto.' : 'El pago mínimo sugerido es de ' + formatCurrency(minimumPayment, { locale, currency }) + '.'}`}
            placement="bottom"
          >
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{nextPaymentDays}d</ThemedText>
              <View style={styles.statLabelWithIcon}>
                <ThemedText style={styles.statLabel}>próximo pago</ThemedText>
                <InfoIcon size={12} opacity={0.3} />
              </View>
            </View>
          </InfoTooltip>
        </View>
      ) : isDebit ? (
        <View style={styles.statsRow}>
          <InfoTooltip
            title="Gasto de Hoy"
            content={`Has gastado ${formatCurrency(todaySpent, { locale, currency })} hoy. Este contador se reinicia cada 24 horas. Te quedan ${formatCurrency(dailyPurchaseLimit - todaySpent, { locale, currency })} disponibles para compras hoy.`}
            placement="bottom"
          >
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {formatCurrency(todaySpent, {
                  locale,
                  currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </ThemedText>
              <View style={styles.statLabelWithIcon}>
                <ThemedText style={styles.statLabel}>hoy</ThemedText>
                <InfoIcon size={12} opacity={0.3} />
              </View>
            </View>
          </InfoTooltip>
          <View style={styles.statDivider} />
          <InfoTooltip
            title="Límite Diario de Compras"
            content={`Tu límite de compras diario es de ${formatCurrency(dailyPurchaseLimit, { locale, currency })}. Este límite se establece por seguridad y se reinicia automáticamente cada día. También tienes un límite para cajeros de ${formatCurrency(dailyATMLimit, { locale, currency })} diarios.`}
            placement="bottom"
          >
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {formatCurrency(dailyPurchaseLimit, {
                  locale,
                  currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </ThemedText>
              <View style={styles.statLabelWithIcon}>
                <ThemedText style={styles.statLabel}>límite diario</ThemedText>
                <InfoIcon size={12} opacity={0.3} />
              </View>
            </View>
          </InfoTooltip>
        </View>
      ) : (
        <View style={styles.statsRow}>
          <InfoTooltip
            title="Límite de Gasto"
            content={`Esta tarjeta virtual tiene un límite máximo de ${formatCurrency(spendingLimit, { locale, currency })}. ${isReloadable ? 'Puedes recargarla múltiples veces hasta este límite.' : 'Es una tarjeta de un solo uso, ideal para compras online seguras.'}`}
            placement="bottom"
          >
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {formatCurrency(spendingLimit, {
                  locale,
                  currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </ThemedText>
              <View style={styles.statLabelWithIcon}>
                <ThemedText style={styles.statLabel}>límite</ThemedText>
                <InfoIcon size={12} opacity={0.3} />
              </View>
            </View>
          </InfoTooltip>
          <View style={styles.statDivider} />
          <InfoTooltip
            title={isReloadable ? 'Tarjeta Recargable' : 'Tarjeta de Uso Único'}
            content={
              isReloadable
                ? 'Esta tarjeta virtual es recargable. Puedes agregar fondos ilimitadamente y usarla múltiples veces. Ideal para uso frecuente con máxima flexibilidad.'
                : 'Esta es una tarjeta virtual de un solo uso. Una vez utilizada, se desactiva automáticamente. Perfecta para compras únicas con máxima seguridad.'
            }
            placement="bottom"
          >
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {isReloadable ? '∞' : '1×'}
              </ThemedText>
              <View style={styles.statLabelWithIcon}>
                <ThemedText style={styles.statLabel}>
                  {isReloadable ? 'recargas' : 'uso único'}
                </ThemedText>
                <InfoIcon size={12} opacity={0.3} />
              </View>
            </View>
          </InfoTooltip>
        </View>
      )}

      {/* Barra de progreso minimalista - Solo para crédito con uso */}
      {isCredit && creditLimit > 0 && usedCredit > 0 && (
        <InfoTooltip
          title="Indicador de Uso de Crédito"
          content={`Este indicador muestra qué tan cerca estás de tu límite de crédito. ${
            usagePercentage >= 90
              ? '⚠️ Estás cerca del límite. Considera hacer un pago pronto.'
              : usagePercentage >= 75
              ? '⚡ Uso alto. Un pago pronto ayudará a tu score crediticio.'
              : usagePercentage >= 50
              ? '✓ Uso moderado. Mantén un buen control de tus gastos.'
              : '✓ Excelente manejo. Estás usando tu crédito responsablemente.'
          }`}
          placement="bottom"
        >
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
        </InfoTooltip>
      )}
    </Animated.View>
  );
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 16,
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
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
  heroLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.5,
    color: theme.colors.textSecondary,
  },
  infoIconWrapper: {
    paddingVertical: 2,
    paddingHorizontal: 2,
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
  statLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
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
