/**
 * StatusBadge - Badge moderno tipo pill para mostrar estados
 * Diseño 2025: Flat, colores semánticos, con ícono opcional
 */

import { ThemedText } from '@/components/themed-text';
import type { Card } from '@/features/cards/services/card-service';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type CardStatus = Card['status'];

export interface StatusBadgeProps {
  status: CardStatus;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<
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
    backgroundColor: '#ECFDF5',
    textColor: '#065F46',
  },
  blocked: {
    label: 'Bloqueada',
    icon: '🔴',
    backgroundColor: '#FEF2F2',
    textColor: '#991B1B',
  },
  expired: {
    label: 'Expirada',
    icon: '⚫',
    backgroundColor: '#F3F4F6',
    textColor: '#374151',
  },
  pending: {
    label: 'Pendiente',
    icon: '⏳',
    backgroundColor: '#FEF3C7',
    textColor: '#92400E',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
}) => {
  const config = STATUS_CONFIG[status];
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
