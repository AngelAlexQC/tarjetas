import { ThemedText } from '@/components/themed-text';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { InfoIcon } from '@/components/ui/info-icon';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import React from 'react';
import { View } from 'react-native';

interface HeroSectionProps {
  balance: number;
  isCredit: boolean;
  isDebit: boolean;
  currency: string;
  currencySymbol: string;
  locale: string;
  heroColor: string;
  baseOrder: number;
  cardType: string;
  styles: {
    heroSection: object;
    heroAmount: object;
    heroLabelContainer: object;
    heroLabel: object;
    infoIconWrapper: object;
  };
}

export function HeroSection({
  balance,
  isCredit,
  isDebit,
  currency,
  currencySymbol,
  locale,
  heroColor,
  baseOrder,
  cardType,
  styles,
}: HeroSectionProps) {
  const getBalanceLabel = () => {
    if (isCredit) return 'Saldo actual';
    if (isDebit) return 'Disponible';
    return 'Balance';
  };

  const getBalanceTooltipContent = () => {
    if (isCredit) {
      return 'Es el total que has usado de tu línea de crédito. Este monto debe ser pagado en o antes de la fecha de vencimiento.';
    }
    if (isDebit) {
      return 'Es el dinero que tienes disponible en tu cuenta para usar inmediatamente en compras o retiros.';
    }
    return 'Es el saldo total disponible en tu tarjeta virtual. Puede ser recargable o de un solo uso.';
  };

  return (
    <View style={styles.heroSection}>
      <InfoTooltip
        title={isCredit ? 'Saldo Actual' : isDebit ? 'Saldo Disponible' : 'Balance'}
        content={getBalanceTooltipContent()}
        placement="bottom"
        tourKey={`tour-${cardType}-balance`}
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
            <ThemedText style={styles.heroLabel}>{getBalanceLabel()}</ThemedText>
            <View style={styles.infoIconWrapper}>
              <InfoIcon size={14} />
            </View>
          </View>
        </View>
      </InfoTooltip>
    </View>
  );
}
