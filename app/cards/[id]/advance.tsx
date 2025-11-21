import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function AdvanceScreen() {
  return (
    <ThemedView style={styles.container} surface="level1">
      <ThemedText type="title">Avance de Efectivo</ThemedText>
      <ThemedText>Próximamente: Formulario de solicitud de avance.</ThemedText>
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
