import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/hooks/use-app-theme';

export function createInsuranceCardStyles(theme: AppTheme, accentColor: string) {
  return StyleSheet.create({
    container: {
      width: 320,
      marginRight: 8,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    },
    pressable: {
      flex: 1,
    },
    content: {
      padding: 14,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 10,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${accentColor}15`,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
      letterSpacing: -0.2,
    },
    description: {
      fontSize: 12,
      opacity: 0.5,
      lineHeight: 16,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    },
    stat: {
      flex: 1,
    },
    statLabel: {
      fontSize: 10,
      opacity: 0.4,
      marginBottom: 3,
      fontWeight: '500',
    },
    statValue: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    divider: {
      width: 1,
      height: 24,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
      marginHorizontal: 12,
    },
    arrowContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
  });
}
