import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { FeedbackColors } from '@/constants';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUserRecovery } from '@/hooks/use-user-recovery';

interface RecoverUserScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function RecoverUserScreen({ onBack, onSuccess }: RecoverUserScreenProps) {
  const theme = useAppTheme();
  const { currentTheme } = useTenantTheme(); // Access tenant config for allowed ID types
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { recoverUser, isLoading, error, setError } = useUserRecovery();
  
  const [step, setStep] = useState<'input' | 'success'>('input');
  const [recoveredData, setRecoveredData] = useState<{username: string, maskedEmail: string} | null>(null);
  
  const [formData, setFormData] = useState({
    documentType: (currentTheme as any)?.features?.auth?.allowedDocumentTypes?.[0] || 'CC',
    documentId: '',
    birthDate: '',
    pin: '',
    verificationMethod: 'dob' as 'dob' | 'pin',
  });

  const allowedDocTypes = (currentTheme as any)?.features?.auth?.allowedDocumentTypes || ['CC', 'CE', 'PAS'];

  const handleRecover = async () => {
    if (!formData.documentId) {
      setError('Ingresa tu número de documento');
      return;
    }

    const requestData = {
      documentType: formData.documentType,
      documentId: formData.documentId,
      birthDate: formData.verificationMethod === 'dob' ? formData.birthDate : undefined,
      pin: formData.verificationMethod === 'pin' ? formData.pin : undefined,
    };
    
    // Validar localmente antes de enviar
    if (formData.verificationMethod === 'pin' && (!formData.pin || formData.pin.length !== 4)) {
       setError('El PIN debe tener 4 dígitos');
       return;
    }

    if (formData.verificationMethod === 'dob' && !formData.birthDate) {
       setError('Ingresa tu fecha de nacimiento');
       return;
    }
    
    const result = await recoverUser(requestData);
    if (result.success && result.username && result.maskedEmail) {
      setRecoveredData({
        username: result.username,
        maskedEmail: result.maskedEmail
      });
      setStep('success');
    }
  };

  const containerMaxWidth = Math.min(layout.screenWidth * 0.9, 420);

  // Success View
  if (step === 'success' && recoveredData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.contentCenter, { paddingTop: insets.top }]}>
          <Animated.View entering={FadeInUp.springify()} style={styles.successIcon}>
             <Ionicons name="person-circle" size={80} color={theme.tenant.mainColor} />
          </Animated.View>
          
          <ThemedText type="title" style={styles.successTitle}>
            ¡Usuario Encontrado!
          </ThemedText>
          
          <View style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <ThemedText style={styles.resultLabel}>Tu usuario es:</ThemedText>
            <ThemedText type="title" style={{ color: theme.tenant.mainColor }}>
              {recoveredData.username}
            </ThemedText>
            <ThemedText style={styles.resultHint}>
              Hemos enviado un correo de confirmación a {recoveredData.maskedEmail}
            </ThemedText>
          </View>

          <ThemedButton 
            title="Ir a Iniciar Sesión" 
            onPress={onSuccess}
            variant="primary"
            style={styles.successButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: insets.top + 20, 
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: layout.horizontalPadding 
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
         <View style={[styles.header, { maxWidth: containerMaxWidth, alignSelf: 'center', width: '100%' }]}>
            <ThemedButton
              icon={<Ionicons name="arrow-back" size={24} color={theme.colors.text} />}
              variant="outline"
              style={styles.backButton}
              onPress={onBack}
              title=""
            />
            <ThemedText type="title" style={styles.title}>
              Recuperar Usuario
            </ThemedText>
          </View>

        <Animated.View 
          entering={FadeInUp.duration(600)} 
          style={[styles.content, { maxWidth: containerMaxWidth }]}
        >
          <ThemedText style={styles.subtitle}>
            Ingresa tus datos para localizar tu usuario
          </ThemedText>

          {error && (
            <Animated.View entering={FadeInDown} style={[styles.errorContainer, { backgroundColor: FeedbackColors.error + '20' }]}>
              <Ionicons name="alert-circle" size={20} color={FeedbackColors.error} />
              <ThemedText style={[styles.errorText, { color: FeedbackColors.error }]}>{error}</ThemedText>
            </Animated.View>
          )}

          <View style={styles.form}>
            {/* Document Type Selector (Simplified as Input for now, ideally a picker) */}
             <View style={styles.typeSelector}>
                 {allowedDocTypes.map((type: string) => (
                   <ThemedButton
                      key={type}
                      title={type}
                      variant={formData.documentType === type ? 'primary' : 'outline'}
                      onPress={() => setFormData({...formData, documentType: type})}
                      style={{ flex: 1, marginHorizontal: 4, minWidth: 60 }}
                      textStyle={{ fontSize: 12 }}
                   />
                 ))}
             </View>

            <ThemedInput
              label="Número de Documento"
              value={formData.documentId}
              onChangeText={(text) => setFormData({...formData, documentId: text})}
              keyboardType="numeric"
              placeholder="Ej. 1723456789"
            />

            <View style={styles.methodToggle}>
               <ThemedText 
                 style={[styles.methodLabel, formData.verificationMethod === 'dob' && { color: theme.tenant.mainColor, fontWeight: 'bold' }]}
                 onPress={() => setFormData({...formData, verificationMethod: 'dob'})}
               >
                 Fecha Nacimiento
               </ThemedText>
               <ThemedText style={{ color: theme.colors.textSecondary }}> | </ThemedText>
               <ThemedText 
                  style={[styles.methodLabel, formData.verificationMethod === 'pin' && { color: theme.tenant.mainColor, fontWeight: 'bold' }]}
                  onPress={() => setFormData({...formData, verificationMethod: 'pin'})}
               >
                 PIN Tarjeta
               </ThemedText>
            </View>

            {formData.verificationMethod === 'dob' ? (
              <ThemedInput
                label="Fecha de Nacimiento"
                placeholder="DD/MM/AAAA"
                value={formData.birthDate}
                onChangeText={(text) => setFormData({...formData, birthDate: text})}
                keyboardType="numeric"
                maxLength={10}
              />
            ) : (
               <ThemedInput
                label="PIN de Tarjeta (4 dígitos)"
                placeholder="****"
                value={formData.pin}
                onChangeText={(text) => setFormData({...formData, pin: text})}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
              />
            )}

            <ThemedButton
              title={isLoading ? "Buscando..." : "Recuperar Usuario"}
              onPress={handleRecover}
              variant="primary"
              disabled={isLoading}
              style={styles.submitButton}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 0,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  methodToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  methodLabel: {
    fontSize: 14,
    padding: 8,
  },
  submitButton: {
    marginTop: 16,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    marginBottom: 32,
    textAlign: 'center',
  },
  resultCard: {
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
  },
  resultLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  resultHint: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.5,
  },
  successButton: {
    width: '100%',
  },
});
