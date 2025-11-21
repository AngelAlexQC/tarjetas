import { ThemedText } from '@/components/themed-text';
import { CardBrandIcons } from '@/components/ui/card-brand-icons';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { Card } from '@/features/cards/services/card-service';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
      <TouchableOpacity onPress={handlePress} style={styles.button}>
        {isModal ? (
          <X size={24} color={theme.colors.text} />
        ) : (
          <ChevronLeft size={24} color={theme.colors.text} />
        )}
      </TouchableOpacity>
      
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
