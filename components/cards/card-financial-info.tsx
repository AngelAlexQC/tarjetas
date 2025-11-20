/**
 * CardFinancialInfo - Panel de información financiera con glassmorphism
 * Diseño 2025: Clean, professional, con micro-animaciones
 */

import { ThemedText } from '@/components/themed-text';
import type { Card } from '@/features/cards/services/card-service';
import { formatCurrency } from '@/utils/formatters';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
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
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
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
    <View style={styles.content}>
      {/* Header con título y badge */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.headerIcon}>💰</ThemedText>
          <ThemedText style={styles.headerTitle}>
            {isCredit ? 'Crédito Disponible' : 'Saldo Disponible'}
          </ThemedText>
        </View>
        <StatusBadge status={card.status} size="small" />
      </View>

      {/* Balance principal */}
      <View style={styles.balanceSection}>
        <ThemedText style={styles.balanceAmount}>
          {formatCurrency(balance, { locale, currency })}
        </ThemedText>
        <ThemedText style={styles.balanceCurrency}>{currency}</ThemedText>
      </View>

      {/* Progress bar para tarjetas de crédito */}
      {isCredit && creditLimit > 0 && (
        <View style={styles.progressSection}>
          <CreditProgressBar
            used={usedCredit}
            total={creditLimit}
            showLabels={true}
          />
        </View>
      )}

      {/* Información adicional */}
      <View style={styles.metadataSection}>
        {isCredit ? (
          <>
            <View style={styles.metadataItem}>
              <ThemedText style={styles.metadataIcon}>📅</ThemedText>
              <ThemedText style={styles.metadataText}>
                Último pago: Hace {lastPaymentDays} días
              </ThemedText>
            </View>
            <View style={styles.metadataItem}>
              <ThemedText style={styles.metadataIcon}>📅</ThemedText>
              <ThemedText style={styles.metadataText}>
                Próximo corte: En {nextPaymentDays} días
              </ThemedText>
            </View>
          </>
        ) : (
          <View style={styles.metadataItem}>
            <ThemedText style={styles.metadataIcon}>📊</ThemedText>
            <ThemedText style={styles.metadataText}>
              Movimientos hoy: 3 transacciones
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.85,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  blurContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  androidContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 40,
  },
  balanceCurrency: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.5,
  },
  progressSection: {
    marginBottom: 12,
  },
  metadataSection: {
    gap: 6,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataIcon: {
    fontSize: 14,
  },
  metadataText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
});
