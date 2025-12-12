import { useAppTheme } from '@/hooks/use-app-theme';
import { formatCurrency } from '@/utils/formatters/currency';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { InsuranceHeader, InsuranceStats } from './insurance-card-components';
import { BADGE_COLORS, getInsuranceColor } from './insurance-card-constants';
import { createInsuranceCardStyles } from './insurance-card-styles';
import { Insurance } from './insurance-generator';

interface InsuranceCardProps {
  insurance: Insurance;
  index: number;
  onPress: () => void;
}

function formatAmount(amount: number, currency: string): string {
  return formatCurrency(amount, {
    locale: 'en-US',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function InsuranceCard({ insurance, index, onPress }: InsuranceCardProps) {
  const theme = useAppTheme();
  const accentColor = getInsuranceColor(insurance.type);
  const shouldAnimate = index < 3;

  const styles = useMemo(
    () => {
      const baseStyles = createInsuranceCardStyles(theme, accentColor);
      return StyleSheet.create({
        ...baseStyles,
        badge: {
          paddingHorizontal: 6,
          paddingVertical: 3,
          borderRadius: 6,
          backgroundColor: insurance.badge ? `${BADGE_COLORS[insurance.badge]}15` : 'transparent',
        },
        badgeText: {
          fontSize: 9,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: insurance.badge ? BADGE_COLORS[insurance.badge] : theme.colors.text,
        },
      });
    },
    [theme, accentColor, insurance.badge]
  );

  const coverageAmount = formatAmount(insurance.coverageAmount, insurance.currency);
  const monthlyPrice = formatAmount(insurance.monthlyPrice, insurance.currency);

  const ContainerView = shouldAnimate ? Animated.View : View;
  const animationProps = shouldAnimate
    ? { entering: FadeInUp.delay(index * 50).duration(300) }
    : {};

  return (
    <ContainerView {...animationProps} style={styles.container}>
      <Pressable
        style={styles.pressable}
        onPress={onPress}
        android_ripple={{
          color: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <View style={styles.content}>
          <InsuranceHeader insurance={insurance} accentColor={accentColor} styles={styles} />
          <InsuranceStats 
            coverageAmount={coverageAmount}
            monthlyPrice={monthlyPrice}
            accentColor={accentColor}
            styles={styles}
          />
        </View>
      </Pressable>
    </ContainerView>
  );
}
