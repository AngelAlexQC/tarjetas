import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function PinScreen() {
  return (
    <ThemedView style={styles.container} surface="level1">
      <ThemedText type="title">Cambio de PIN</ThemedText>
      <ThemedText>Próximamente: Teclado seguro para cambio de clave.</ThemedText>
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
