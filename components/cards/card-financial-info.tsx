/**
 * CardFinancialInfo - Panel de información financiera con glassmorphism
 * Diseño 2025: Clean, professional, con micro-animaciones
 */

import { ThemedText } from '@/components/themed-text';
import type { Card } from '@/features/cards/services/card-service';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { AnimatedNumber } from '@/components/ui/animated-number';
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
        <BlurView intensity={20} tint="light" style={styles.blurContainer}>
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
        <View style={styles.androidContainer}>
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
  return (
    <Animated.View 
      style={styles.content}
      layout={LinearTransition.springify().damping(25).stiffness(90)}
    >
      {/* Header con título y badge */}
      <Animated.View 
        style={styles.header}
        layout={LinearTransition.springify().damping(25).stiffness(90)}
      >
        <View style={styles.headerLeft}>
          <ThemedText style={styles.headerIcon}>💰</ThemedText>
          <ThemedText style={styles.headerTitle}>
            {isCredit ? 'Crédito Disponible' : 'Saldo Disponible'}
          </ThemedText>
        </View>
        <StatusBadge status={card.status} size="small" />
      </Animated.View>

      {/* Balance principal */}
      <Animated.View 
        style={styles.balanceSection}
        layout={LinearTransition.springify().damping(25).stiffness(90)}
      >
        <AnimatedNumber 
          value={balance}
          style={styles.balanceAmount}
          prefix="$"
          decimals={2}
          duration={1000}
          locale={locale}
        />
        <ThemedText style={styles.balanceCurrency}>{currency}</ThemedText>
      </Animated.View>

      {/* Progress bar para tarjetas de crédito */}
      {isCredit && creditLimit > 0 && (
        <Animated.View 
          style={styles.progressSection}
          entering={FadeIn.duration(600).springify()}
          exiting={FadeOut.duration(400)}
          layout={LinearTransition.springify().damping(25).stiffness(90)}
        >
          <CreditProgressBar
            used={usedCredit}
            total={creditLimit}
            showLabels={true}
          />
        </Animated.View>
      )}

      {/* Información adicional */}
      <Animated.View 
        style={styles.metadataSection}
        layout={LinearTransition.springify().damping(25).stiffness(90)}
      >
        {isCredit ? (
          <View style={styles.metadataItem}>
            <ThemedText style={styles.metadataIcon}>📅</ThemedText>
            <ThemedText style={styles.metadataText}>
              Próximo corte en {nextPaymentDays} días · Último pago hace {lastPaymentDays}d
            </ThemedText>
          </View>
        ) : (
          <View style={styles.metadataItem}>
            <ThemedText style={styles.metadataIcon}>📊</ThemedText>
            <ThemedText style={styles.metadataText}>
              3 movimientos hoy
            </ThemedText>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.85,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 16,
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  blurContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  androidContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 36,
  },
  balanceCurrency: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.5,
  },
  progressSection: {
    marginBottom: 8,
  },
  metadataSection: {
    gap: 4,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataIcon: {
    fontSize: 12,
  },
  metadataText: {
    fontSize: 11,
    opacity: 0.65,
    lineHeight: 16,
  },
});
