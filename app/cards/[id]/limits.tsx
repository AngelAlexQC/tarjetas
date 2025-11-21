import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function LimitsScreen() {
  return (
    <ThemedView style={styles.container} surface="level1">
      <ThemedText type="title">Configurar Cupos</ThemedText>
      <ThemedText>Próximamente: Sliders para control de límites.</ThemedText>
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
