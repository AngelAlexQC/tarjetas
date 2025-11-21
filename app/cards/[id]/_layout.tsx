import { useAppTheme } from '@/hooks/use-app-theme';
import { Stack } from 'expo-router';

export default function CardOperationsLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
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
    </Stack>
  );
}
