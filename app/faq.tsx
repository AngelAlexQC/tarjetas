import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PoweredBy } from '@/components/ui/powered-by';
import { ThemedButton } from '@/components/ui/themed-button';
import { useTour } from '@/contexts/tour-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { loggers } from '@/utils/logger';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import React from 'react';
import { Alert, NativeModules, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const { resetTour } = useTour();

  const handleResetTour = async () => {
    Alert.alert(
      "Reiniciar Tour",
      "¿Quieres volver a ver el recorrido guiado de la aplicación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Reiniciar", 
          onPress: () => {
            // Reiniciar estado del tour
            void (async () => {
              await resetTour();
              
              try {
                // Intentar recargar con expo-updates
                await Updates.reloadAsync();
              } catch (error) {
                // Fallback si falla expo-updates (común en desarrollo)
                loggers.ui.debug('expo-updates no disponible, usando fallback:', error);
                if (__DEV__ && NativeModules.DevSettings) {
                  NativeModules.DevSettings.reload();
                } else {
                  // Fallback de navegación
                  if (router.canGoBack()) {
                    router.dismissAll();
                  }
                  router.replace('/');
                }
              }
            })();
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>Preguntas Frecuentes</ThemedText>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
        <View style={[styles.resetSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.resetContent}>
            <View style={styles.resetHeader}>
              <Ionicons name="help-buoy-outline" size={20} color={theme.tenant.mainColor} style={{ marginRight: 8 }} />
              <ThemedText type="defaultSemiBold">¿Necesitas ayuda?</ThemedText>
            </View>
            <ThemedText style={[styles.resetDescription, { color: theme.colors.textSecondary }]}>
              Inicia el tour para ver las guías nuevamente.
            </ThemedText>
          </View>
          <ThemedButton 
            title="Ver Tour" 
            onPress={handleResetTour}
            variant="secondary"
            style={styles.resetButton}
          />
        </View>

        <ThemedText type="subtitle" style={{ marginBottom: 16, marginTop: 8 }}>Temas Populares</ThemedText>

        {FAQ_ITEMS.map((item, index) => (
            <View key={item.question} style={[styles.item, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}>
                <View style={styles.questionRow}>
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.tenant.mainColor} style={{ marginRight: 12 }} />
                  <ThemedText type="defaultSemiBold" style={styles.question}>{item.question}</ThemedText>
                </View>
                <ThemedText style={[styles.answer, { color: theme.colors.textSecondary }]}>{item.answer}</ThemedText>
            </View>
        ))}
        
        {/* Powered By */}
        <PoweredBy />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#00838F',
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  content: { padding: 20, gap: 16 },
  resetSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resetContent: {
    flex: 1,
    marginRight: 12,
  },
  resetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resetTitle: {
    textAlign: 'left',
    marginBottom: 0,
  },
  resetDescription: {
    textAlign: 'left',
    fontSize: 13,
    lineHeight: 18,
  },
  resetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  item: { 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  question: { 
    flex: 1,
    fontSize: 15, 
  },
  answer: { 
    fontSize: 14, 
    lineHeight: 22,
    paddingLeft: 32,
  },
});
