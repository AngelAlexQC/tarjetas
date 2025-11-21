import { NavigationButton } from '@/components/navigation/navigation-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/themed-button';
import { useTour } from '@/contexts/tour-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

const FAQ_ITEMS = [
  { 
    question: 'Olvidé mi contraseña, ¿cómo la recupero?', 
    answer: 'Puedes recuperar tu contraseña desde la pantalla de inicio de sesión seleccionando la opción "¿Olvidaste tu contraseña?". Sigue las instrucciones enviadas a tu correo electrónico.' 
  },
  { 
    question: '¿Cómo activo la huella o el reconocimiento?', 
    answer: 'Ve a la sección de Configuración > Seguridad y activa la opción de Biometría. Asegúrate de tener configurada la huella o FaceID en tu dispositivo.' 
  },
  { 
    question: '¿Qué hago si sospecho de fraude?', 
    answer: 'Si sospechas de fraude, bloquea tu tarjeta inmediatamente desde la app y comunícate con nuestro centro de atención al cliente.' 
  },
  { 
    question: 'Bloqueo de tarjetas en caso de robo', 
    answer: 'Selecciona tu tarjeta, ve a "Bloquear tarjeta" y confirma la acción. Esto evitará cualquier uso no autorizado.' 
  },
  { 
    question: 'Activar tarjetas nuevas', 
    answer: 'Para activar una tarjeta nueva, ve a la sección de Tarjetas, selecciona la tarjeta inactiva y sigue los pasos para establecer tu PIN.' 
  },
  { 
    question: 'Reclamo de consumos', 
    answer: 'Selecciona el movimiento que deseas reclamar en tu historial, toca en "Reportar problema" y sigue las instrucciones.' 
  },
];

export default function FaqScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { resetTour } = useTour();

  const handleResetTour = async () => {
    Alert.alert(
      "Reiniciar Tour",
      "¿Quieres volver a ver el recorrido guiado de la aplicación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Reiniciar", 
          onPress: async () => {
            // Reiniciar estado del tour
            await resetTour();
            
            // Navegar al inicio para asegurar una recarga completa de la vista
            if (router.canGoBack()) {
              router.dismissAll();
            }
            // Reemplazar con la ruta raíz para forzar un re-montaje
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Preguntas Frecuentes',
        headerLeft: () => (
          <NavigationButton onPress={() => router.back()} />
        ),
        headerBackVisible: false,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTitleStyle: { color: theme.colors.text },
      }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.resetSection}>
          <ThemedText type="subtitle" style={styles.resetTitle}>¿Necesitas ayuda con la app?</ThemedText>
          <ThemedText style={styles.resetDescription}>
            Si quieres volver a ver las explicaciones de las funcionalidades, puedes reiniciar el tour interactivo.
          </ThemedText>
          <ThemedButton 
            title="Reiniciar Tour Guiado" 
            onPress={handleResetTour}
            variant="secondary"
          />
        </View>

        {FAQ_ITEMS.map((item, index) => (
            <View key={index} style={[styles.item, { borderColor: theme.colors.border }]}>
                <ThemedText type="subtitle" style={styles.question}>{item.question}</ThemedText>
                <ThemedText style={styles.answer}>{item.answer}</ThemedText>
            </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  resetSection: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginBottom: 8,
    gap: 12,
    alignItems: 'center',
  },
  resetTitle: {
    textAlign: 'center',
  },
  resetDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 4,
  },
  item: { padding: 16, borderRadius: 12, borderWidth: 1 },
  question: { marginBottom: 8, fontSize: 16, fontWeight: '600' },
  answer: { opacity: 0.8, lineHeight: 20 },
});
