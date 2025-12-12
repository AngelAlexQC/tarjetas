import { ThemedText } from '@/components/themed-text';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SettingsIcon } from '@/components/ui/tab-icons';
import { InfoIcon } from '@/components/ui/info-icon';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { formatCurrencyWithSymbol } from './utils';
import type { CardMetrics } from './metrics';

interface DebitCardStatsProps {
  metrics: CardMetrics;
  locale: string;
  currency: string;
  currencySymbol: string;
  primaryColor: string;
  cardId: string;
  styles: {
    statsRow: object;
    statItem: object;
    statValue: object;
    statLabel: object;
    statDivider: object;
    statLabelWithIcon: object;
  };
}

export function DebitCardStats({
  metrics,
  locale,
  currency,
  currencySymbol,
  primaryColor,
  cardId,
  styles,
}: DebitCardStatsProps) {
  const router = useRouter();
  const {
    todaySpent,
    dailyPurchaseLimit,
    dailyATMLimit,
    dailySpentPercentage,
    dailySpentColors,
    baseOrder,
  } = metrics;

  return (
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
                router.push(`/cards/${cardId}/limits`);
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <SettingsIcon size={16} color={primaryColor} />
              <ThemedText style={{ fontSize: 13, color: primaryColor, fontWeight: '600' }}>
                Configurar límites
              </ThemedText>
            </Pressable>
          </View>
        )}
        tourKey="tour-debit-daily-spent"
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
                router.push(`/cards/${cardId}/limits`);
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <SettingsIcon size={16} color={primaryColor} />
              <ThemedText style={{ fontSize: 13, color: primaryColor, fontWeight: '600' }}>
                Configurar límites
              </ThemedText>
            </Pressable>
          </View>
        )}
        tourKey="tour-debit-daily-limit"
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
  );
}
