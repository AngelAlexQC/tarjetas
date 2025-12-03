/**
 * CardFinancialInfo - Panel de información financiera con glassmorphism
 * Diseño 2025: Clean, professional, con micro-animaciones
 */

import { ThemedText } from '@/components/themed-text';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SettingsIcon } from '@/components/ui/tab-icons';
import { InfoIcon } from '@/components/ui/info-icon';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useThemedColors } from '@/contexts/tenant-theme-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { Card } from '@/repositories';
import { formatCurrency } from '@/utils/formatters/currency';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
// Formatea la moneda usando el símbolo personalizado si está definido
function formatCurrencyWithSymbol(amount: number, options: { locale: string; currency: string; currencySymbol?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }) {
  const { currencySymbol, locale, currency, minimumFractionDigits, maximumFractionDigits } = options;
  const value = formatCurrency(amount, { locale, currency, minimumFractionDigits, maximumFractionDigits });
  return currencySymbol ? `${currencySymbol} ${value.replace(/[^\d.,-]+/, '').trim()}` : value;
}

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
  const themedColors = useThemedColors();
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
            primaryColor={themedColors.primary}
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
            primaryColor={themedColors.primary}
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
  primaryColor?: string;
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
  primaryColor,
}) => {
  const styles = useStyles();
  const router = useRouter();
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
  const dailySpentPercentage = dailyPurchaseLimit > 0 
    ? Math.round((todaySpent / dailyPurchaseLimit) * 100) 
    : 0;
  
  // Para virtual/prepago: límites y recargas
  const spendingLimit = isVirtual ? 3000 : 0;
  const isReloadable = isVirtual ? true : false;
  
  // Cálculos para información de pagos (crédito)
  const minimumPayment = isCredit && creditLimit > 0 ? usedCredit * 0.05 : 0;
  const isPaymentSoon = isCredit && nextPaymentDays <= 5;

  // Calcular fecha de pago para el calendario
  const nextPaymentDate = new Date();
  nextPaymentDate.setDate(nextPaymentDate.getDate() + nextPaymentDays);
  nextPaymentDate.setHours(9, 0, 0, 0); // 9:00 AM

  // Colores semánticos mejorados para accesibilidad
  const getUsageColor = (percentage: number) => {
    return { bg: `${primaryColor}20`, fg: primaryColor };
  };
  
  const usageColors = getUsageColor(usagePercentage);
  const dailySpentColors = getUsageColor(dailySpentPercentage);

  // Color para el balance principal
  // El usuario prefiere que el valor principal tenga siempre el tema de la institución
  const heroColor = primaryColor;

  const baseOrder = card.cardType === 'credit' ? 100 : card.cardType === 'debit' ? 200 : 300;

  return (
    <Animated.View 
      style={styles.content}
      layout={LinearTransition.springify().damping(25).stiffness(90)}
    >
      {/* Balance principal - Hero section minimalista */}
      <View style={styles.heroSection}>
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
          tourKey={`tour-${card.cardType}-balance`}
          tourOrder={baseOrder + 10}
        >
          <View style={{ alignItems: 'center', gap: 4 }}>
            <AnimatedNumber 
              value={balance}
              style={[styles.heroAmount, { color: heroColor }]}
              currency={currency}
              currencySymbol={currencySymbol}
              decimals={2}
              duration={1000}
              locale={locale}
            />
            <View style={styles.heroLabelContainer}>
              <ThemedText style={styles.heroLabel}>
                {isCredit ? 'Saldo actual' : isDebit ? 'Disponible' : 'Balance'}
              </ThemedText>
              <View style={styles.infoIconWrapper}>
                <InfoIcon size={14} />
              </View>
            </View>
          </View>
        </InfoTooltip>
      </View>

      {/* Stats compactos - Solo info esencial */}
      {isCredit && creditLimit > 0 ? (
        <>
        <View style={styles.statsRow}>
          <InfoTooltip
            title="Crédito Disponible"
            content={`Tienes ${formatCurrencyWithSymbol(availableCredit, { locale, currency, currencySymbol })} disponibles de tu línea de crédito de ${formatCurrencyWithSymbol(creditLimit, { locale, currency, currencySymbol })}. Este es el monto que puedes usar sin exceder tu límite.`}
            placement="bottom"
            tourKey={`tour-${card.cardType}-available`}
            tourOrder={baseOrder + 11}
          >
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: primaryColor }]}>
                {formatCurrencyWithSymbol(availableCredit, {
                  locale,
                  currency,
                  currencySymbol,
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
            tourKey={`tour-${card.cardType}-usage`}
            tourOrder={baseOrder + 12}
          >
            <View style={styles.statItem}>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress 
                  value={usedCredit} 
                  max={creditLimit} 
                  size={42} 
                  strokeWidth={4}
                  color={usageColors.fg}
                  backgroundColor={`${usageColors.fg}20`}
                  textStyle={{ fontSize: 10, fontWeight: '700', color: usageColors.fg }}
                />
              </View>
              <View style={styles.statLabelWithIcon}>
                <ThemedText style={styles.statLabel}>usado</ThemedText>
                <InfoIcon size={12} opacity={0.3} />
              </View>
            </View>
          </InfoTooltip>
          <View style={styles.statDivider} />
          <InfoTooltip
            title="Próximo Pago"
            content={`Tienes ${nextPaymentDays} días para realizar tu pago. ${isPaymentSoon ? 'Tu fecha de pago está cerca, considera programar tu pago pronto.' : 'El pago mínimo sugerido es de ' + formatCurrencyWithSymbol(minimumPayment, { locale, currency, currencySymbol }) + '.'}`}
            placement="bottom"
            calendarEvent={{
              title: `Pago de Tarjeta ${card.cardNumber ? `(**** ${card.cardNumber.slice(-4)})` : ''}`,
              startDate: nextPaymentDate,
              notes: `Pago mínimo sugerido: ${formatCurrencyWithSymbol(minimumPayment, { locale, currency, currencySymbol })}. Saldo actual: ${formatCurrencyWithSymbol(usedCredit, { locale, currency, currencySymbol })}`,
            }}
            tourKey={`tour-${card.cardType}-payment`}
            tourOrder={baseOrder + 13}
          >
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: primaryColor }]}>{nextPaymentDays}d</ThemedText>
              <View style={styles.statLabelWithIcon}>
                <ThemedText style={styles.statLabel}>próximo pago</ThemedText>
                <InfoIcon size={12} opacity={0.3} />
              </View>
            </View>
          </InfoTooltip>
        </View>
      </>
      ) : isDebit ? (
        <>
        <View style={styles.statsRow}>
          <InfoTooltip
            title="Gasto de Hoy"
            content={`Has gastado ${formatCurrencyWithSymbol(todaySpent, { locale, currency, currencySymbol })} hoy. Este contador se reinicia cada 24 horas. Te quedan ${formatCurrencyWithSymbol(dailyPurchaseLimit - todaySpent, { locale, currency, currencySymbol })} disponibles para compras hoy.`}
            placement="bottom"
            extraContent={({ close }) => (
              <View style={{ gap: 16 }}>
                <Pressable 
                  onPress={() => {
                    close();
                    router.push(`/cards/${card.id}/limits`);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <SettingsIcon size={16} color={primaryColor} />
                  <ThemedText style={{ fontSize: 13, color: primaryColor, fontWeight: '600' }}>Configurar límites</ThemedText>
                </Pressable>
              </View>
            )}
            tourKey={`tour-${card.cardType}-daily-spent`}
            tourOrder={baseOrder + 11}
          >
            <View style={styles.statItem}>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress 
                  value={todaySpent} 
                  max={dailyPurchaseLimit} 
                  size={42} 
                  strokeWidth={4}
                  color={dailySpentColors.fg}
                  backgroundColor={dailySpentColors.bg}
                  showText={false}
                />
                <View style={{ position: 'absolute' }}>
                  <ThemedText style={{ fontSize: 10, fontWeight: '700', color: dailySpentColors.fg }}>
                    {dailySpentPercentage}%
                  </ThemedText>
                </View>
              </View>
              <View style={styles.statLabelWithIcon}>
                <ThemedText style={styles.statLabel}>hoy</ThemedText>
                <InfoIcon size={12} opacity={0.3} />
              </View>
            </View>
          </InfoTooltip>
          <View style={styles.statDivider} />
          <InfoTooltip
            title="Límite Diario de Compras"
            content={`Tu límite de compras diario es de ${formatCurrencyWithSymbol(dailyPurchaseLimit, { locale, currency, currencySymbol })}. Este límite se establece por seguridad y se reinicia automáticamente cada día. También tienes un límite para cajeros de ${formatCurrencyWithSymbol(dailyATMLimit, { locale, currency, currencySymbol })} diarios.`}
            placement="bottom"
            extraContent={({ close }) => (
              <View style={{ gap: 16 }}>
                <Pressable 
                  onPress={() => {
                    close();
                    router.push(`/cards/${card.id}/limits`);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <SettingsIcon size={16} color={primaryColor} />
                  <ThemedText style={{ fontSize: 13, color: primaryColor, fontWeight: '600' }}>Configurar límites</ThemedText>
                </Pressable>
              </View>
            )}
            tourKey={`tour-${card.cardType}-daily-limit`}
            tourOrder={baseOrder + 12}
          >
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: primaryColor }]}>
                {formatCurrencyWithSymbol(dailyPurchaseLimit, {
                  locale,
                  currency,
                  currencySymbol,
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
        </>
      ) : (
        <View style={styles.statsRow}>
          <InfoTooltip
            title="Límite de Gasto"
            content={`Esta tarjeta virtual tiene un límite máximo de ${formatCurrencyWithSymbol(spendingLimit, { locale, currency, currencySymbol })}. ${isReloadable ? 'Puedes recargarla múltiples veces hasta este límite.' : 'Es una tarjeta de un solo uso, ideal para compras online seguras.'}`}
            placement="bottom"
            extraContent={({ close }) => (
              <View style={{ gap: 16 }}>
                <Pressable 
                  onPress={() => {
                    close();
                    router.push(`/cards/${card.id}/limits`);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <SettingsIcon size={16} color={primaryColor} />
                  <ThemedText style={{ fontSize: 13, color: primaryColor, fontWeight: '600' }}>Configurar límites</ThemedText>
                </Pressable>
              </View>
            )}
            tourKey={`tour-${card.cardType}-spending-limit`}
            tourOrder={baseOrder + 11}
          >
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: primaryColor }]}>
                {formatCurrencyWithSymbol(spendingLimit, {
                  locale,
                  currency,
                  currencySymbol,
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
            tourKey={`tour-${card.cardType}-reloads`}
            tourOrder={baseOrder + 12}
          >
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: primaryColor }]}>
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
    </Animated.View>
  );
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 4,
    borderRadius: Platform.OS === 'ios' ? 10 : 24,
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
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
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: theme.colors.borderSubtle,
    overflow: 'hidden',
  },
  androidContainer: {
    backgroundColor: theme.isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
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
});

// Hook para usar estilos con tema
function useStyles() {
  const theme = useAppTheme();
  return React.useMemo(() => createStyles(theme), [theme]);
}
