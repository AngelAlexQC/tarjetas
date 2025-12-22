import { NavigationButton } from '@/components/navigation/navigation-button';
import { ThemedText } from '@/ui/primitives/themed-text';
import { CardBrandIcons } from '@/components/ui/card-brand-icons';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { useAppTheme } from '@/ui/theming';
import type { Card } from '@/repositories';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CardOperationHeaderProps {
  title: string;
  card?: Card;
  onBack?: () => void;
  isModal?: boolean;
}

export function CardOperationHeader({ 
  title, 
  card,
  onBack,
  isModal = false
}: CardOperationHeaderProps) {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const last4 = card?.cardNumber.slice(-4) || '••••';
  const BrandIcon = card?.cardBrand ? CardBrandIcons[card.cardBrand] : null;

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.surface, 
        borderBottomColor: theme.colors.borderSubtle,
        paddingTop: insets.top + 12, // Add safe area inset
      }
    ]}>
      <NavigationButton 
        type={isModal ? 'close' : 'back'}
        onPress={handlePress}
      />

      <View style={styles.titleContainer}>
        <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
        <View style={styles.cardBadge}>
          {BrandIcon ? (
            <BrandIcon width={24} height={15} />
          ) : (
            <FinancialIcons.creditCard size={12} color={theme.colors.textSecondary} />
          )}
          <ThemedText style={styles.cardText}>•••• {last4}</ThemedText>
        </View>
      </View>

      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  button: {
    padding: 4,
    width: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.7,
  },
  cardText: {
    fontSize: 10,
  },
  placeholder: {
    width: 40,
  },
});
