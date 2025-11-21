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
