import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function CardOperationsLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: theme.colors.surfaceElevated,
        },
      }}
    >
      <Stack.Screen 
        name="block" 
        options={{ 
          title: 'Bloquear Tarjeta',
          presentation: 'formSheet',
        }} 
      />
      <Stack.Screen 
        name="defer" 
        options={{ 
          title: 'Diferir Consumos',
          presentation: 'fullScreenModal',
        }} 
      />
      <Stack.Screen 
        name="statements" 
        options={{ 
          title: 'Estados de Cuenta',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="advance" 
        options={{ 
          title: 'Avance de Efectivo',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="limits" 
        options={{ 
          title: 'Configurar Cupos',
          presentation: 'formSheet',
        }} 
      />
      <Stack.Screen 
        name="pin" 
        options={{ 
          title: 'Cambio de PIN',
          presentation: 'formSheet',
        }} 
      />
      <Stack.Screen 
        name="subscriptions" 
        options={{ 
          title: 'Suscripciones',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}
