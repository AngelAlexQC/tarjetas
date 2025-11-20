/**
 * CardFinancialInfo - Panel de información financiera con glassmorphism
 * Diseño 2025: Clean, professional, con micro-animaciones
 */

import { ThemedText } from '@/components/themed-text';
import { AnimatedNumber } from '@/components/ui/animated-number';
import type { Card } from '@/features/cards/services/card-service';
import { useAppTheme } from '@/hooks/use-app-theme';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { CreditProgressBar } from './credit-progress-bar';
import { StatusBadge } from './status-badge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CardFinancialInfoProps {
  card: Card;
  locale?: string;
  currency?: string;
}

export const CardFinancialInfo: React.FC<CardFinancialInfoProps> = ({
  card,
  locale = 'en-US',
  currency = 'USD',
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
}) => {
  const styles = useStyles();
  const usagePercentage = isCredit && creditLimit > 0 
    ? Math.round((usedCredit / creditLimit) * 100) 
    : 0;
  
  // Cálculos para información de pagos
  const minimumPayment = isCredit && creditLimit > 0 ? usedCredit * 0.05 : 0; // 5% del saldo usado
  const isPaymentSoon = isCredit && nextPaymentDays <= 5;
  const isVirtual = card.cardType === 'virtual';

  return (
    <Animated.View 
      style={styles.content}
      layout={LinearTransition.springify().damping(25).stiffness(90)}
    >
      {/* Fila principal ultra-compacta */}
      <Animated.View 
        style={styles.compactRow}
        layout={LinearTransition.springify().damping(25).stiffness(90)}
      >
        {/* Balance */}
        <View style={styles.balanceBlock}>
          <AnimatedNumber 
            value={balance}
            style={styles.amount}
            prefix="$"
            decimals={2}
            duration={1000}
            locale={locale}
          />
        </View>

        {/* Divisor visual */}
        <View style={styles.divider} />

        {/* Info compacta según tipo */}
        {isCredit && creditLimit > 0 ? (
          <View style={styles.infoBlock}>
            <View style={styles.miniStat}>
              <ThemedText style={styles.statValue}>
                {usagePercentage}%
              </ThemedText>
              <ThemedText style={styles.statLabel}>uso</ThemedText>
            </View>
            <View style={styles.miniStat}>
              <ThemedText style={styles.statValue}>
                ${(creditLimit / 1000).toFixed(0)}k
              </ThemedText>
              <ThemedText style={styles.statLabel}>límite</ThemedText>
            </View>
          </View>
        ) : (
          <View style={styles.infoBlock}>
            <View style={styles.miniStat}>
              <ThemedText style={styles.statValue}>3</ThemedText>
              <ThemedText style={styles.statLabel}>mov.</ThemedText>
            </View>
            <View style={styles.miniStat}>
              <ThemedText style={styles.statValue}>
                {isVirtual ? '🔒' : '💳'}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                {isVirtual ? 'virtual' : card.cardType}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Status badge */}
        <View style={styles.statusBlock}>
          <StatusBadge status={card.status} size="small" />
        </View>
      </Animated.View>

      {/* Información de pagos para crédito (compacta en una línea) */}
      {isCredit && creditLimit > 0 && usedCredit > 0 && (
        <Animated.View 
          style={styles.paymentRow}
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(300)}
          layout={LinearTransition.springify().damping(25).stiffness(90)}
        >
          {/* Indicador visual de urgencia */}
          <View style={[
            styles.paymentIndicator,
            { backgroundColor: isPaymentSoon ? 'rgba(255,149,0,0.15)' : 'rgba(0,122,255,0.1)' }
          ]}>
            <ThemedText style={[
              styles.paymentDays,
              { color: isPaymentSoon ? '#FF9500' : '#007AFF' }
            ]}>
              {nextPaymentDays}d
            </ThemedText>
          </View>

          {/* Info de pago mínimo */}
          <View style={styles.paymentInfo}>
            <ThemedText style={styles.paymentLabel}>
              Pago mínimo
            </ThemedText>
            <ThemedText style={styles.paymentAmount}>
              ${minimumPayment.toLocaleString(locale, { maximumFractionDigits: 0 })}
            </ThemedText>
          </View>

          {/* Divisor pequeño */}
          <View style={styles.smallDivider} />

          {/* Pago total */}
          <View style={styles.paymentInfo}>
            <ThemedText style={styles.paymentLabel}>
              Total
            </ThemedText>
            <ThemedText style={styles.paymentAmountBold}>
              ${usedCredit.toLocaleString(locale, { maximumFractionDigits: 0 })}
            </ThemedText>
          </View>

          {/* Progress visual sutil */}
          <View style={styles.miniProgressContainer}>
            <View style={styles.miniProgressTrack}>
              <View 
                style={[
                  styles.miniProgressFill,
                  { 
                    width: `${Math.min(usagePercentage, 100)}%`,
                    backgroundColor: usagePercentage > 80 
                      ? '#FF5252' 
                      : usagePercentage > 60 
                        ? '#FF9500' 
                        : '#34C759'
                  }
                ]}
              />
            </View>
          </View>
        </Animated.View>
      )}

      {/* Mensaje de último pago (solo si no hay deuda) */}
      {isCredit && creditLimit > 0 && usedCredit === 0 && (
        <Animated.View 
          style={styles.lastPaymentRow}
          entering={FadeIn.duration(400)}
          layout={LinearTransition.springify().damping(25).stiffness(90)}
        >
          <ThemedText style={styles.lastPaymentText}>
            ✓ Último pago hace {lastPaymentDays}d · Próximo corte en {nextPaymentDays}d
          </ThemedText>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.85,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 12,
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  blurContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  androidContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  content: {
    padding: 8,
    paddingHorizontal: 10,
    gap: 4,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  balanceBlock: {
    flex: 1,
    minWidth: 0,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.9,
    lineHeight: 26,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.borderSubtle,
    marginHorizontal: 2,
  },
  infoBlock: {
    flexDirection: 'row',
    gap: 8,
    flex: 1.2,
  },
  miniStat: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 15,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '500',
    opacity: 0.45,
    textTransform: 'lowercase',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  statusBlock: {
    alignItems: 'flex-end',
  },
  inlineProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  progressLabel: {
    fontSize: 8,
    fontWeight: '600',
    opacity: 0.5,
    letterSpacing: 0.2,
  },
  // Estilos para información de pagos
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  paymentIndicator: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentDays: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 8,
    fontWeight: '500',
    opacity: 0.45,
    letterSpacing: 0.2,
    marginBottom: 1,
  },
  paymentAmount: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  paymentAmountBold: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  smallDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.borderSubtle,
  },
  miniProgressContainer: {
    width: 4,
    height: 32,
    justifyContent: 'center',
  },
  miniProgressTrack: {
    width: 4,
    height: '100%',
    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    width: '100%',
    borderRadius: 2,
  },
  lastPaymentRow: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  lastPaymentText: {
    fontSize: 9,
    fontWeight: '500',
    opacity: 0.5,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
});

// Hook para usar estilos con tema
function useStyles() {
  const theme = useAppTheme();
  return React.useMemo(() => createStyles(theme), [theme.mode]);
}
