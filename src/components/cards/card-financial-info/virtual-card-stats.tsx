import { ThemedText } from '@/components/themed-text';
import { SettingsIcon } from '@/components/ui/tab-icons';
import { InfoIcon } from '@/components/ui/info-icon';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { formatCurrencyWithSymbol } from './utils';
import type { CardMetrics } from './metrics';

// Componente extraído para evitar nested components (S6478)
const LimitsConfigButton = ({ close, cardId, primaryColor, router }: { close: () => void; cardId: string; primaryColor: string; router: ReturnType<typeof useRouter> }) => (
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
);

interface VirtualCardStatsProps {
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

export function VirtualCardStats({
  metrics,
  locale,
  currency,
  currencySymbol,
  primaryColor,
  cardId,
  styles,
}: VirtualCardStatsProps) {
  const router = useRouter();
  const { spendingLimit, isReloadable, baseOrder } = metrics;

  return (
    <View style={styles.statsRow}>
      <InfoTooltip
        title="Límite de Gasto"
        content={`Esta tarjeta virtual tiene un límite máximo de ${formatCurrencyWithSymbol(spendingLimit, { locale, currency, currencySymbol })}. ${isReloadable ? 'Puedes recargarla múltiples veces hasta este límite.' : 'Es una tarjeta de un solo uso, ideal para compras online seguras.'}`}
        placement="bottom"
        extraContent={({ close }) => <LimitsConfigButton close={close} cardId={cardId} primaryColor={primaryColor} router={router} />}
        tourKey="tour-virtual-spending-limit"
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
        tourKey="tour-virtual-reloads"
        tourOrder={baseOrder + 12}
      >
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: primaryColor }]}>
            {isReloadable ? '∞' : '1×'}
          </ThemedText>
          <View style={styles.statLabelWithIcon}>
            <ThemedText style={styles.statLabel}>{isReloadable ? 'recargas' : 'uso único'}</ThemedText>
            <InfoIcon size={12} opacity={0.3} />
          </View>
        </View>
      </InfoTooltip>
    </View>
  );
}
