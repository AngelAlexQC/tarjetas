import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function DeferScreen() {
  return (
    <ThemedView style={styles.container} surface="level1">
      <ThemedText type="title">Diferir Consumos</ThemedText>
      <ThemedText>Próximamente: Wizard de selección de consumos y plazos.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
