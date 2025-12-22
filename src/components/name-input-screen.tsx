import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NameInputScreenProps {
  onContinue: (name: string) => void;
}

export function NameInputScreen({ onContinue }: NameInputScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');

  const containerMaxWidth = Math.min(layout.screenWidth * 0.9, 420);

  const handleContinue = () => {
    if (name.trim()) {
      onContinue(name.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: insets.top + 60, 
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: layout.horizontalPadding 
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          entering={FadeInUp.duration(600)} 
          style={[styles.content, { maxWidth: containerMaxWidth }]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle-outline" size={80} color={theme.tenant.mainColor} />
          </View>
          
          <ThemedText type="title" style={styles.title}>
            ¡Hola!
          </ThemedText>
          
          <ThemedText style={styles.subtitle}>
            ¿Cómo te gustaría que te llamemos?
          </ThemedText>

          <Animated.View 
            entering={FadeInDown.delay(200).duration(600)} 
            style={styles.form}
          >
            <ThemedInput
              label="Tu nombre"
              placeholder="Ej. Sofía"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
              textContentType="name"
              autoComplete="name"
              icon={<Ionicons name="happy-outline" size={20} color={theme.colors.textSecondary} />}
            />

            <ThemedButton
              title="Continuar"
              onPress={handleContinue}
              variant="primary"
              disabled={!name.trim()}
              style={styles.button}
            />
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    gap: 24,
  },
  button: {
    marginTop: 16,
  },
});
