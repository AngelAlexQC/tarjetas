import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function StatementsScreen() {
  return (
    <ThemedView style={styles.container} surface="level1">
      <ThemedText type="title">Estados de Cuenta</ThemedText>
      <ThemedText>Próximamente: Listado de movimientos y descarga de PDF.</ThemedText>
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
