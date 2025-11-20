import { useAppTheme } from '@/hooks/use-app-theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface DateBadgeProps {
  date: Date | string;
  variant?: 'compact' | 'detailed' | 'expiry';
  showIcon?: boolean;
}

export const DateBadge: React.FC<DateBadgeProps> = ({
  date,
  variant = 'compact',
  showIcon = false,
}) => {
  const theme = useAppTheme();
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatCompact = () => {
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('es-ES', { month: 'short' });
    return { day: day.toString(), month };
  };

  const formatDetailed = () => {
    return dateObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatExpiry = () => {
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = String(dateObj.getFullYear()).slice(-2);
    return `${month}/${year}`;
  };

  if (variant === 'expiry') {
    return (
      <View style={[styles.expiryContainer, { 
        backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
      }]}>
        {showIcon && <ThemedText style={styles.icon}>📅</ThemedText>}
        <ThemedText style={styles.expiryText}>{formatExpiry()}</ThemedText>
      </View>
    );
  }

  if (variant === 'detailed') {
    return (
      <View style={styles.detailedContainer}>
        {showIcon && <ThemedText style={styles.icon}>📅</ThemedText>}
        <ThemedText style={styles.detailedText}>{formatDetailed()}</ThemedText>
      </View>
    );
  }

  // Compact variant
  const { day, month } = formatCompact();
  return (
    <View style={[styles.compactContainer, { 
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    }]}>
      <ThemedText style={styles.compactDay}>{day}</ThemedText>
      <ThemedText style={styles.compactMonth}>{month.toUpperCase()}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  compactDay: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  compactMonth: {
    fontSize: 8,
    fontWeight: '600',
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  detailedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  icon: {
    fontSize: 14,
  },
});
