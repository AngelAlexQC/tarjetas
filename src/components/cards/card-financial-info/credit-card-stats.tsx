import { ThemedText } from '@/components/themed-text';
import { CircularProgress } from '@/components/ui/circular-progress';
import { InfoIcon } from '@/components/ui/info-icon';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import React from 'react';
import { View } from 'react-native';
import { formatCurrencyWithSymbol } from './utils';
import type { CardMetrics } from './metrics';

interface CreditCardStatsProps {
  metrics: CardMetrics;
  locale: string;
  currency: string;
  currencySymbol: string;
  primaryColor: string;
  cardId: string;
  cardNumber?: string;
  creditLimit: number;
  usedCredit: number;
  minimumPayment: number;
  nextPaymentDays: number;
  styles: {
    statsRow: object;
    statItem: object;
    statValue: object;
    statLabel: object;
    statDivider: object;
    statLabelWithIcon: object;
  };
}

export function CreditCardStats({
  metrics,
  locale,
  currency,
  currencySymbol,
  primaryColor,
  cardNumber,
  creditLimit,
  usedCredit,
  minimumPayment,
  nextPaymentDays,
  styles,
}: CreditCardStatsProps) {
  const { availableCredit, usagePercentage, usageColors, nextPaymentDate, isPaymentSoon, baseOrder } = metrics;

  return (
    <View style={styles.statsRow}>
      <InfoTooltip
        title="Crédito Disponible"
        content={`Tienes ${formatCurrencyWithSymbol(availableCredit, { locale, currency, currencySymbol })} disponibles de tu línea de crédito de ${formatCurrencyWithSymbol(creditLimit, { locale, currency, currencySymbol })}. Este es el monto que puedes usar sin exceder tu límite.`}
        placement="bottom"
        tourKey="tour-credit-available"
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
        tourKey="tour-credit-usage"
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
          title: cardNumber ? `Pago de Tarjeta (**** ${cardNumber.slice(-4)})` : 'Pago de Tarjeta',
          startDate: nextPaymentDate,
          notes: `Pago mínimo sugerido: ${formatCurrencyWithSymbol(minimumPayment, { locale, currency, currencySymbol })}. Saldo actual: ${formatCurrencyWithSymbol(usedCredit, { locale, currency, currencySymbol })}`,
        }}
        tourKey="tour-credit-payment"
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
  );
}
