import { ThemedText } from '@/components/themed-text';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { DollarSign, Info } from 'lucide-react-native';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// AmountInput Component
interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function AmountInput({ value, onChangeText }: AmountInputProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <DollarSign size={20} color={theme.colors.textSecondary} />
      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        placeholder="0.00"
        placeholderTextColor={theme.colors.textDisabled}
        keyboardType="decimal-pad"
        returnKeyType="done"
        value={value}
        onChangeText={onChangeText}
        inputAccessoryViewID="uniqueID"
      />
    </View>
  );
}

// TermGrid Component
interface TermGridProps {
  terms: number[];
  selectedTerm: number;
  onSelectTerm: (term: number) => void;
}

export function TermGrid({ terms, selectedTerm, onSelectTerm }: TermGridProps) {
  const theme = useAppTheme();
  return (
    <View style={styles.termsGrid}>
      {terms.map(t => (
        <TouchableOpacity
          key={t}
          style={[styles.termCard, { borderColor: selectedTerm === t ? theme.tenant.mainColor : theme.colors.border, backgroundColor: selectedTerm === t ? theme.colors.surfaceHigher : theme.colors.surface }]}
          onPress={() => onSelectTerm(t)}
        >
          <ThemedText style={{ fontWeight: selectedTerm === t ? 'bold' : 'normal' }}>{t}</ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// AccountCard Component
interface Account {
  id: string;
  type: string;
  number: string;
  balance: number;
}

interface AccountCardProps {
  account: Account;
  isSelected: boolean;
  onSelect: () => void;
}

export function AccountCard({ account, isSelected, onSelect }: AccountCardProps) {
  const theme = useAppTheme();
  return (
    <TouchableOpacity
      style={[styles.accountCard, { borderColor: isSelected ? theme.tenant.mainColor : theme.colors.border, backgroundColor: isSelected ? theme.colors.surfaceHigher : theme.colors.surface }]}
      onPress={onSelect}
    >
      <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHigher }]}>
        <FinancialIcons.wallet size={24} color={theme.colors.textSecondary} />
      </View>
      <View>
        <ThemedText type="defaultSemiBold">Cuenta {account.type}</ThemedText>
        <ThemedText style={{ opacity: 0.6 }}>{account.number} - Saldo: ${account.balance}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

// InfoBox Component
interface InfoBoxProps {
  message: string;
}

export function InfoBox({ message }: InfoBoxProps) {
  const theme = useAppTheme();
  return (
    <View style={styles.infoBox}>
      <Info size={20} color={theme.tenant.mainColor} />
      <ThemedText style={{ flex: 1, fontSize: 12 }}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 56, gap: 12 },
  input: { flex: 1, fontSize: 18, fontWeight: 'bold' },
  termsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  termCard: { width: 60, height: 60, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  accountCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, gap: 16, marginBottom: 8 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  infoBox: { flexDirection: 'row', padding: 16, backgroundColor: 'rgba(150,150,150,0.1)', borderRadius: 12, gap: 12, alignItems: 'center' },
});
