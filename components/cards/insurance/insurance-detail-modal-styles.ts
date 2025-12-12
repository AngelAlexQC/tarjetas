import { Platform, StyleSheet } from 'react-native';
import type { AppTheme } from '@/hooks/use-app-theme';

interface StyleParams {
  theme: AppTheme;
  insets: { bottom: number };
  isLargeScreen: boolean;
  modalMaxHeight: number;
  modalMaxWidth: number;
}

export const createStyles = ({
  theme,
  insets,
  isLargeScreen,
  modalMaxHeight,
  modalMaxWidth,
}: StyleParams) => {
  const isWeb = Platform.OS === 'web';

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: isLargeScreen ? 'center' : 'flex-end',
      alignItems: isLargeScreen ? 'center' : 'stretch',
    },
    modalContainer: {
      backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: isLargeScreen ? 20 : 0,
      borderBottomRightRadius: isLargeScreen ? 20 : 0,
      maxHeight: modalMaxHeight,
      maxWidth: modalMaxWidth,
      width: isLargeScreen ? modalMaxWidth : '100%',
      overflow: 'hidden',
      ...(isWeb && {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }),
    },
    dragIndicator: {
      width: 32,
      height: 4,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 6,
    },
    header: {
      padding: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3,
      marginBottom: 6,
    },
    description: {
      fontSize: 14,
      opacity: 0.6,
      lineHeight: 20,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 10,
      letterSpacing: -0.2,
    },
    coverageCard: {
      flexDirection: 'row',
      padding: 14,
      borderRadius: 10,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    coverageLeft: {
      flex: 1,
    },
    coverageLabel: {
      fontSize: 11,
      opacity: 0.5,
      marginBottom: 4,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    coverageValue: {
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.4,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
      gap: 10,
    },
    benefitIconContainer: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    benefitText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    footer: {
      padding: 16,
      paddingTop: 14,
      paddingBottom: isLargeScreen ? 16 : Math.max(16, insets.bottom),
      borderTopWidth: 1,
      borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
      backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    priceLabel: {
      fontSize: 13,
      opacity: 0.6,
      fontWeight: '500',
    },
    priceValue: {
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: -0.4,
    },
    disclaimer: {
      fontSize: 11,
      opacity: 0.4,
      lineHeight: 16,
      marginTop: 10,
      textAlign: 'center',
    },
    paymentCardSection: {
      marginBottom: 14,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    paymentCardHeader: {
      fontSize: 11,
      opacity: 0.5,
      marginBottom: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    paymentCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardIconContainer: {
      width: 48,
      height: 32,
      borderRadius: 6,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    cardInfo: {
      flex: 1,
    },
    cardNumber: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
      letterSpacing: 0.5,
    },
    cardType: {
      fontSize: 11,
      opacity: 0.5,
      textTransform: 'capitalize',
    },
  });
};
