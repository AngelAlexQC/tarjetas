import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface PaymentOptionProps {
  title: string;
  subtitle: string;
  amount: number;
  selected: boolean;
  onPress: () => void;
}

export function PaymentOption({ title, subtitle, amount, selected, onPress }: PaymentOptionProps) {
  const theme = useAppTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.option, 
        selected && { borderColor: theme.tenant.mainColor, borderWidth: 2 }
      ]}
      onPress={onPress}
    >
      <View>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{subtitle}</ThemedText>
      </View>
      <ThemedText type="subtitle">${amount.toFixed(2)}</ThemedText>
    </TouchableOpacity>
  );
}

interface SourceAccountCardProps {
  icon: string;
  title: string;
  details: string;
}

export function SourceAccountCard({ icon, title, details }: SourceAccountCardProps) {
  const theme = useAppTheme();
  
  return (
    <View style={styles.accountRow}>
      <View style={[styles.accountIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
        <ThemedText>{icon}</ThemedText>
      </View>
      <View>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText style={{ fontSize: 12 }}>{details}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
