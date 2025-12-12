import { ThemedText } from '@/components/themed-text';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { Transaction } from '@/repositories';
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

// TransactionSelectItem Component
interface TransactionSelectItemProps {
  item: Transaction;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function TransactionSelectItem({ item, isSelected, onToggle }: TransactionSelectItemProps) {
  const theme = useAppTheme();
  const categoryIconMap: Record<string, keyof typeof FinancialIcons> = {
    shopping: 'wallet',
    transport: 'transfer',
    entertainment: 'chart',
    food: 'money',
  };
  const iconKey = categoryIconMap[item.category] || 'wallet';
  const Icon = FinancialIcons[iconKey];

  return (
    <Pressable
      onPress={() => item.canDefer && onToggle(item.id)}
      style={[styles.txItem, { opacity: item.canDefer ? 1 : 0.5, backgroundColor: isSelected ? theme.colors.surfaceHigher : 'transparent' }]}
    >
      <View style={[styles.checkbox, { borderColor: isSelected ? theme.tenant.mainColor : theme.colors.border, backgroundColor: isSelected ? theme.tenant.mainColor : 'transparent' }]}>
        {isSelected && <Check size={14} color="#FFF" />}
      </View>
      <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHigher }]}>
        <Icon size={20} color={theme.colors.textSecondary} />
      </View>
      <View style={styles.txInfo}>
        <ThemedText type="defaultSemiBold">{item.description}</ThemedText>
        <ThemedText style={styles.date}>{item.date}</ThemedText>
      </View>
      <ThemedText type="defaultSemiBold">{item.currency}{item.amount.toFixed(2)}</ThemedText>
    </Pressable>
  );
}

// MonthCard Component
interface MonthCardProps {
  months: number;
  isSelected: boolean;
  onSelect: (months: number) => void;
}

export function MonthCard({ months, isSelected, onSelect }: MonthCardProps) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={() => onSelect(months)}
      style={[styles.monthCard, {
        borderColor: isSelected ? theme.tenant.mainColor : theme.colors.border,
        backgroundColor: isSelected ? theme.colors.surfaceHigher : theme.colors.surface
      }]}
    >
      <ThemedText type="title" style={{ color: isSelected ? theme.tenant.mainColor : theme.colors.text }}>{months}</ThemedText>
      <ThemedText>meses</ThemedText>
    </TouchableOpacity>
  );
}

// ProgressHeader Component
interface ProgressHeaderProps {
  step: 'select' | 'term' | 'summary';
}

export function ProgressHeader({ step }: ProgressHeaderProps) {
  const theme = useAppTheme();
  const widthMap = { select: '33%', term: '66%', summary: '100%' } as const;
  const stepMap = { select: '1/3', term: '2/3', summary: '3/3' } as const;

  return (
    <View style={styles.progressHeader}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: widthMap[step], backgroundColor: theme.tenant.mainColor }]} />
      </View>
      <ThemedText style={styles.stepText}>{stepMap[step]}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  txItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  date: { fontSize: 12, opacity: 0.6 },
  monthCard: { width: '48%', padding: 20, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  progressHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  progressContainer: { flex: 1, height: 6, backgroundColor: 'rgba(150,150,150,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  stepText: { fontSize: 12, fontWeight: 'bold' },
});
