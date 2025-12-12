import { Platform, StyleSheet } from 'react-native';
import type { AppTheme } from '@/hooks/use-app-theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      marginTop: 6,
      marginBottom: 4,
      borderRadius: Platform.OS === 'ios' ? 10 : 24,
      overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
      width: '100%',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    blurContainer: {
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: theme.colors.borderSubtle,
      overflow: 'hidden',
    },
    androidContainer: {
      backgroundColor: theme.isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
      borderRadius: 24,
      borderWidth: 0.5,
      borderColor: theme.colors.borderSubtle,
    },
    content: {
      padding: 20,
      gap: 16,
    },
    heroSection: {
      alignItems: 'center',
      gap: 4,
    },
    heroAmount: {
      fontSize: 36,
      fontWeight: '700',
      letterSpacing: -1.5,
      color: theme.colors.text,
    },
    heroLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    heroLabel: {
      fontSize: 11,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      opacity: 0.5,
      color: theme.colors.textSecondary,
    },
    infoIconWrapper: {
      paddingVertical: 2,
      paddingHorizontal: 2,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    statItem: {
      alignItems: 'center',
      gap: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: -0.3,
      color: theme.colors.text,
    },
    statLabelWithIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '500',
      textTransform: 'lowercase',
      letterSpacing: 0.3,
      opacity: 0.5,
      color: theme.colors.textSecondary,
    },
    statDivider: {
      width: 1,
      height: 20,
      backgroundColor: theme.colors.borderSubtle,
      opacity: 0.3,
    },
  });
}
