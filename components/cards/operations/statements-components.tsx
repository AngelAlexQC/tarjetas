import { ThemedText } from '@/components/themed-text';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { AppTheme, useAppTheme } from '@/hooks/use-app-theme';
import { Calendar, Check, ChevronDown } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

type TransactionType = 'purchase' | 'payment' | 'transfer' | 'fee';

interface TransactionWithType {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

// TransactionItem Component
interface TransactionItemProps {
  item: TransactionWithType;
}

export function TransactionItem({ item }: TransactionItemProps) {
  const theme = useAppTheme();
  const isPayment = item.type === 'payment';
  const Icon = isPayment ? FinancialIcons.money : FinancialIcons.wallet;

  return (
    <View style={[styles.txItem, { borderBottomColor: theme.colors.borderSubtle }]}>
      <View style={[styles.iconBox, { backgroundColor: isPayment ? theme.colors.surfaceHigher : theme.colors.surface }]}>
        <Icon size={20} color={isPayment ? theme.tenant.mainColor : theme.colors.textSecondary} />
      </View>
      <View style={styles.txContent}>
        <ThemedText type="defaultSemiBold">{item.description}</ThemedText>
        <ThemedText style={styles.date}>{item.date}</ThemedText>
      </View>
      <ThemedText type="defaultSemiBold" style={{ color: isPayment ? '#4CAF50' : theme.colors.text }}>
        {isPayment ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
      </ThemedText>
    </View>
  );
}

// FilterChip Component
interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: AppTheme;
}

export function FilterChip({ label, selected, onPress, theme }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? theme.tenant.mainColor : 'transparent', borderColor: selected ? theme.tenant.mainColor : theme.colors.border }]}
    >
      <ThemedText style={{ color: selected ? '#FFF' : theme.colors.text, fontSize: 12, fontWeight: selected ? 'bold' : 'normal' }}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

// DateRangeButton Component
interface DateRange { id: string; label: string; }

interface DateRangeButtonProps {
  selectedRange: DateRange;
  onPress: () => void;
}

export function DateRangeButton({ selectedRange, onPress }: DateRangeButtonProps) {
  const theme = useAppTheme();
  return (
    <TouchableOpacity style={[styles.filterButton, { borderColor: theme.colors.border }]} onPress={onPress}>
      <Calendar size={16} color={theme.colors.textSecondary} />
      <ThemedText>{selectedRange.label}</ThemedText>
      <ChevronDown size={16} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
}

// DateRangeModal Component
interface DateRangeModalProps {
  visible: boolean;
  ranges: DateRange[];
  selectedRange: DateRange;
  onSelect: (range: DateRange) => void;
  onClose: () => void;
}

export function DateRangeModal({ visible, ranges, selectedRange, onSelect, onClose }: DateRangeModalProps) {
  const theme = useAppTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <ThemedText type="subtitle" style={styles.modalTitle}>Seleccionar Periodo</ThemedText>
          {ranges.map(range => (
            <TouchableOpacity key={range.id} style={[styles.rangeOption, { backgroundColor: selectedRange.id === range.id ? theme.colors.surfaceHigher : 'transparent' }]} onPress={() => onSelect(range)}>
              <ThemedText style={{ fontWeight: selectedRange.id === range.id ? 'bold' : 'normal' }}>{range.label}</ThemedText>
              {selectedRange.id === range.id && <Check size={20} color={theme.tenant.mainColor} />}
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  txContent: { flex: 1 },
  date: { fontSize: 12, opacity: 0.6 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 16 },
  modalTitle: { marginBottom: 8, textAlign: 'center' },
  rangeOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12 },
});
