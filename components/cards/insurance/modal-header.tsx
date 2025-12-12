import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import type { AppTheme } from '@/hooks/use-app-theme';
import type { Insurance } from './insurance-generator';

interface ModalHeaderProps {
  insurance: Insurance;
  theme: AppTheme;
  onClose: () => void;
  styles: any;
  iconMap: Record<string, keyof typeof Ionicons.glyphMap>;
}

export const ModalHeader = ({ insurance, theme, onClose, styles, iconMap }: ModalHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${insurance.color}15` },
        ]}
      >
        <Ionicons
          name={iconMap[insurance.icon] || 'shield-checkmark'}
          size={24}
          color={insurance.color}
        />
      </View>

      <Pressable style={styles.closeButton} onPress={onClose}>
        <Ionicons
          name="close"
          size={18}
          color={theme.colors.text}
        />
      </Pressable>
    </View>

    <ThemedText style={styles.title}>{insurance.title}</ThemedText>
    <ThemedText style={styles.description}>
      {insurance.description}
    </ThemedText>
  </View>
);
