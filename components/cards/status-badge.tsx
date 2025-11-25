/**
 * StatusBadge - Badge moderno tipo pill para mostrar estados
 * Diseño 2025: Flat, colores semánticos, con ícono opcional
 */

import { ThemedText } from '@/components/themed-text';
import type { Card } from '@/repositories';
import { useAppTheme } from '@/hooks/use-app-theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type CardStatus = Card['status'];

export interface StatusBadgeProps {
  status: CardStatus;
  size?: 'small' | 'medium';
}

const getStatusConfig = (status: CardStatus, isDark: boolean) => {
  const configs: Record<
    CardStatus,
    {
      label: string;
      icon: string;
      backgroundColor: string;
      textColor: string;
    }
  > = {
    active: {
      label: 'Activa',
      icon: '🟢',
      backgroundColor: isDark ? 'rgba(6, 95, 70, 0.3)' : '#ECFDF5',
      textColor: isDark ? '#6EE7B7' : '#065F46',
    },
    blocked: {
      label: 'Bloqueada',
      icon: '🔴',
      backgroundColor: isDark ? 'rgba(153, 27, 27, 0.3)' : '#FEF2F2',
      textColor: isDark ? '#FCA5A5' : '#991B1B',
    },
    expired: {
      label: 'Expirada',
      icon: '⚫',
      backgroundColor: isDark ? 'rgba(75, 85, 99, 0.3)' : '#F3F4F6',
      textColor: isDark ? '#D1D5DB' : '#374151',
    },
    pending: {
      label: 'Pendiente',
      icon: '⏳',
      backgroundColor: isDark ? 'rgba(146, 64, 14, 0.3)' : '#FEF3C7',
      textColor: isDark ? '#FCD34D' : '#92400E',
    },
  };
  return configs[status];
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
}) => {
  const theme = useAppTheme();
  const config = getStatusConfig(status, theme.isDark);
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          paddingHorizontal: isSmall ? 6 : 8,
          paddingVertical: isSmall ? 3 : 6,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.icon,
          {
            fontSize: isSmall ? 8 : 10,
          },
        ]}
      >
        {config.icon}
      </ThemedText>
      <ThemedText
        style={[
          styles.label,
          {
            color: config.textColor,
            fontSize: isSmall ? 10 : 11,
          },
        ]}
      >
        {config.label}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    lineHeight: 12,
  },
  label: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
