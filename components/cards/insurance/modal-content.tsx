import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { Insurance } from './insurance-generator';

interface ModalContentProps {
  insurance: Insurance;
  styles: any;
  formatAmount: (amount: number) => string;
}

export const ModalContent = ({ insurance, styles, formatAmount }: ModalContentProps) => (
  <>
    {/* Cobertura */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Cobertura</ThemedText>
      <View style={styles.coverageCard}>
        <View style={styles.coverageLeft}>
          <ThemedText style={styles.coverageLabel}>
            Cobertura máxima
          </ThemedText>
          <ThemedText style={styles.coverageValue}>
            {formatAmount(insurance.coverageAmount)}
          </ThemedText>
        </View>
      </View>
    </View>

    {/* Beneficios */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Beneficios incluidos</ThemedText>
      {insurance.benefits.map((benefit, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * 80)}
          style={styles.benefitItem}
        >
          <View
            style={[
              styles.benefitIconContainer,
              { backgroundColor: `${insurance.color}15` },
            ]}
          >
            <Ionicons
              name="checkmark"
              size={14}
              color={insurance.color}
            />
          </View>
          <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
        </Animated.View>
      ))}
    </View>
  </>
);
