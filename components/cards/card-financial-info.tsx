/**
 * CardFinancialInfo - Panel de información financiera con glassmorphism
 * Diseño 2025: Clean, professional, con micro-animaciones
 */

import { useThemedColors } from '@/contexts/tenant-theme-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { Card } from '@/repositories';
import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { HeroSection } from './card-financial-info/hero-section';
import { CreditCardStats } from './card-financial-info/credit-card-stats';
import { DebitCardStats } from './card-financial-info/debit-card-stats';
import { VirtualCardStats } from './card-financial-info/virtual-card-stats';
import { calculateCardMetrics } from './card-financial-info/metrics';
import { createStyles } from './card-financial-info/styles';

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
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isCredit = card.cardType === 'credit';
  const balance = card.balance;
  const creditLimit = card.creditLimit || 0;
  const availableCredit = card.availableCredit || 0;
  const usedCredit = creditLimit - availableCredit;
  const nextPaymentDays = 12;

  const content = (
    <CardFinancialInfoContent
      card={card}
      isCredit={isCredit}
      balance={balance}
      creditLimit={creditLimit}
      usedCredit={usedCredit}
      nextPaymentDays={nextPaymentDays}
      locale={locale}
      currency={currency}
      currencySymbol={currencySymbol}
      primaryColor={themedColors.primary}
      styles={styles}
    />
  );

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
          {content}
        </BlurView>
      ) : (
        <View
          style={[
            styles.androidContainer,
            {
              backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: theme.colors.borderSubtle,
            },
          ]}
        >
          {content}
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
  locale: string;
  currency: string;
  currencySymbol: string;
  primaryColor?: string;
  styles: ReturnType<typeof createStyles>;
}

const CardFinancialInfoContent: React.FC<CardFinancialInfoContentProps> = ({
  card,
  isCredit,
  balance,
  creditLimit,
  usedCredit,
  nextPaymentDays,
  locale,
  currency,
  currencySymbol,
  primaryColor,
  styles,
}) => {
  const isDebit = card.cardType === 'debit';

  const metrics = useMemo(
    () =>
      calculateCardMetrics(
        card,
        isCredit,
        balance,
        creditLimit,
        usedCredit,
        nextPaymentDays,
        primaryColor || '#007AFF'
      ),
    [card, isCredit, balance, creditLimit, usedCredit, nextPaymentDays, primaryColor]
  );

  const { heroColor, baseOrder, minimumPayment } = metrics;

  const renderStats = () => {
    if (isCredit && creditLimit > 0) {
      return (
        <CreditCardStats
          metrics={metrics}
          locale={locale}
          currency={currency}
          currencySymbol={currencySymbol}
          primaryColor={primaryColor || '#007AFF'}
          cardId={card.id}
          cardNumber={card.cardNumber}
          creditLimit={creditLimit}
          usedCredit={usedCredit}
          minimumPayment={minimumPayment}
          nextPaymentDays={nextPaymentDays}
          styles={styles}
        />
      );
    }

    if (isDebit) {
      return (
        <DebitCardStats
          metrics={metrics}
          locale={locale}
          currency={currency}
          currencySymbol={currencySymbol}
          primaryColor={primaryColor || '#007AFF'}
          cardId={card.id}
          styles={styles}
        />
      );
    }

    return (
      <VirtualCardStats
        metrics={metrics}
        locale={locale}
        currency={currency}
        currencySymbol={currencySymbol}
        primaryColor={primaryColor || '#007AFF'}
        cardId={card.id}
        styles={styles}
      />
    );
  };

  return (
    <Animated.View style={styles.content} layout={LinearTransition.springify().damping(25).stiffness(90)}>
      <HeroSection
        balance={balance}
        isCredit={isCredit}
        isDebit={isDebit}
        currency={currency}
        currencySymbol={currencySymbol}
        locale={locale}
        heroColor={heroColor}
        baseOrder={baseOrder}
        cardType={card.cardType}
        styles={styles}
      />
      {renderStats()}
    </Animated.View>
  );
};


