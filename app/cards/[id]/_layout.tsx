import { ErrorFallback } from '@/components/error-fallback';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter, type ErrorBoundaryProps } from 'expo-router';
import { Platform } from 'react-native';

/**
 * ErrorBoundary para las operaciones de tarjeta.
 * Permite volver a la pantalla de tarjetas si hay un error.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const router = useRouter();

  return (
    <ErrorFallback
      error={error}
      retry={retry}
      title="Error en la operación"
      showHomeButton
      onGoHome={() => router.replace('/(tabs)/cards')}
    />
  );
}

export default function CardOperationsLayout() {
  const theme = useAppTheme();
  const colorScheme = useColorScheme();
  
  const isIOS = Platform.OS === 'ios';
  const headerBlurEffect = isIOS ? (colorScheme === 'dark' ? 'dark' : 'light') : undefined;

  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        headerTransparent: isIOS,
        headerBlurEffect,
        headerStyle: {
          backgroundColor: isIOS ? 'transparent' : theme.colors.surfaceElevated,
        },
        headerTintColor: theme.colors.text,
        contentStyle: {
          backgroundColor: theme.colors.surfaceElevated,
        },
      }}
    >
      <Stack.Screen 
        name="block" 
        options={{ 
          presentation: 'formSheet',
        }} 
      />
      <Stack.Screen 
        name="defer" 
        options={{ 
          presentation: 'fullScreenModal',
        }} 
      />
      <Stack.Screen 
        name="statements" 
        options={{ 
          presentation: 'fullScreenModal',
        }} 
      />
      <Stack.Screen 
        name="advance" 
        options={{ 
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="limits" 
        options={{ 
          presentation: 'formSheet',
        }} 
      />
      <Stack.Screen 
        name="pin" 
        options={{ 
          presentation: 'formSheet',
        }} 
      />
      <Stack.Screen 
        name="subscriptions" 
        options={{ 
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="pay" 
        options={{ 
          presentation: 'formSheet',
        }} 
      />
      <Stack.Screen 
        name="cardless-atm" 
        options={{ 
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="travel" 
        options={{ 
          presentation: 'formSheet',
        }} 
      />
      <Stack.Screen 
        name="channels" 
        options={{ 
          presentation: 'formSheet',
        }} 
      />
      <Stack.Screen 
        name="cvv" 
        options={{ 
          presentation: 'transparentModal',
          animation: 'fade',
        }} 
      />
      <Stack.Screen 
        name="replace" 
        options={{ 
          presentation: 'formSheet',
        }} 
      />
      <Stack.Screen 
        name="rewards" 
        options={{ 
          presentation: 'fullScreenModal',
        }} 
      />
    </Stack>
  );
}
