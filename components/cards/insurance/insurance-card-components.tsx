import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import type { Insurance } from './insurance-generator';

interface InsuranceBadgeProps {
  badge?: string;
  styles: {
    badge: object;
    badgeText: object;
  };
}

export function InsuranceBadge({ badge, styles }: InsuranceBadgeProps) {
  if (!badge) return null;

  return (
    <View style={styles.badge}>
      <ThemedText style={styles.badgeText}>{badge}</ThemedText>
    </View>
  );
}

interface InsuranceIconProps {
  icon: string;
  color: string;
  styles: {
    iconCircle: object;
  };
}

export function InsuranceIcon({ icon, color, styles }: InsuranceIconProps) {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    heart: 'heart',
    shield: 'shield-checkmark',
    briefcase: 'briefcase',
    airplane: 'airplane',
    medical: 'medical',
    cart: 'cart',
    lock: 'lock-closed',
    globe: 'globe',
  };

  return (
    <View style={styles.iconCircle}>
      <Ionicons
        name={iconMap[icon] || 'shield-checkmark'}
        size={20}
        color={color}
      />
    </View>
  );
}

interface InsuranceHeaderProps {
  insurance: Insurance;
  accentColor: string;
  styles: {
    topRow: object;
    leftSection: object;
    textContainer: object;
    title: object;
    description: object;
    badge: object;
    badgeText: object;
    iconCircle: object;
  };
}

export function InsuranceHeader({ insurance, accentColor, styles }: InsuranceHeaderProps) {
  return (
    <View style={styles.topRow}>
      <View style={styles.leftSection}>
        <InsuranceIcon icon={insurance.icon} color={accentColor} styles={styles} />
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{insurance.title}</ThemedText>
          <ThemedText style={styles.description} numberOfLines={1}>
            {insurance.description}
          </ThemedText>
        </View>
      </View>
      <InsuranceBadge badge={insurance.badge} styles={styles} />
    </View>
  );
}

interface InsuranceStatsProps {
  coverageAmount: string;
  monthlyPrice: string;
  accentColor: string;
  styles: {
    statsRow: object;
    stat: object;
    statLabel: object;
    statValue: object;
    divider: object;
    arrowContainer: object;
  };
}

export function InsuranceStats({ coverageAmount, monthlyPrice, accentColor, styles }: InsuranceStatsProps) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.stat}>
        <ThemedText style={styles.statLabel}>Cobertura</ThemedText>
        <ThemedText style={styles.statValue}>{coverageAmount}</ThemedText>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <ThemedText style={styles.statLabel}>Desde</ThemedText>
        <ThemedText style={styles.statValue}>{monthlyPrice}</ThemedText>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={16} color={accentColor} />
      </View>
    </View>
  );
}
