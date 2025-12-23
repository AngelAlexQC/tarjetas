import { Platform, StyleSheet } from 'react-native';
import type { AppTheme } from '@/hooks/use-app-theme';

interface StyleParams {
  theme: AppTheme;
  insets: { bottom: number };
  isLargeScreen: boolean;
  modalMaxHeight: number;
  modalMaxWidth: number;
}

const createLayoutStyles = (isLargeScreen: boolean, modalMaxHeight: number, modalMaxWidth: number) => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: isLargeScreen ? 'center' : 'flex-end',
    alignItems: isLargeScreen ? 'center' : 'stretch',
  } as const,
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: isLargeScreen ? 20 : 0,
    borderBottomRightRadius: isLargeScreen ? 20 : 0,
    maxHeight: modalMaxHeight,
    maxWidth: modalMaxWidth,
    width: isLargeScreen ? modalMaxWidth : '100%',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    }),
  } as const,
  content: {
    flex: 1,
  } as const,
  scrollContent: {
    padding: 16,
  } as const,
});

const createHeaderStyles = (theme: AppTheme) => ({
  header: {
    padding: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
  } as const,
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  } as const,
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  } as const,
  description: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
  } as const,
  dragIndicator: {
    width: 32,
    height: 4,
    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  } as const,
});

const createContentStyles = (theme: AppTheme) => ({
  section: {
    marginBottom: 20,
  } as const,
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: -0.2,
  } as const,
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
  } as const,
  coverageLeft: {
    flex: 1,
  } as const,
  coverageLabel: {
    fontSize: 11,
    opacity: 0.5,
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as const,
  coverageValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  } as const,
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  } as const,
  benefitIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  } as const,
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  } as const,
});

const createFooterStyles = (theme: AppTheme, isLargeScreen: boolean, insetsBottom: number) => ({
  footer: {
    padding: 16,
    paddingTop: 14,
    paddingBottom: isLargeScreen ? 16 : Math.max(16, insetsBottom),
    borderTopWidth: 1,
    borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
  } as const,
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  } as const,
  priceLabel: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  } as const,
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  } as const,
  disclaimer: {
    fontSize: 11,
    opacity: 0.4,
    lineHeight: 16,
    marginTop: 10,
    textAlign: 'center',
  } as const,
});

const createPaymentCardStyles = (theme: AppTheme) => ({
  paymentCardSection: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  } as const,
  paymentCardHeader: {
    fontSize: 11,
    opacity: 0.5,
    marginBottom: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as const,
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as const,
  cardIconContainer: {
    width: 48,
    height: 32,
    borderRadius: 6,
    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as const,
  cardInfo: {
    flex: 1,
  } as const,
  cardNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.5,
  } as const,
  cardType: {
    fontSize: 11,
    opacity: 0.5,
    textTransform: 'capitalize',
  } as const,
});

const createThemeStyles = (theme: AppTheme) => ({
  modalContainer: {
    backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
  } as const,
});

export const createStyles = ({
  theme,
  insets,
  isLargeScreen,
  modalMaxHeight,
  modalMaxWidth,
}: StyleParams) => {
  const layoutStyles = createLayoutStyles(isLargeScreen, modalMaxHeight, modalMaxWidth);
  const headerStyles = createHeaderStyles(theme);
  const contentStyles = createContentStyles(theme);
  const footerStyles = createFooterStyles(theme, isLargeScreen, insets.bottom);
  const paymentCardStyles = createPaymentCardStyles(theme);
  const themeStyles = createThemeStyles(theme);

  return StyleSheet.create({
    ...layoutStyles,
    modalContainer: { ...layoutStyles.modalContainer, ...themeStyles.modalContainer },
    ...headerStyles,
    ...contentStyles,
    ...footerStyles,
    ...paymentCardStyles,
  });
};

export type InsuranceModalStyles = ReturnType<typeof createStyles>;
