import { ErrorFallback } from '@/components/error-fallback';
import { HapticTab } from '@/components/haptic-tab';
import { CardsIcon, HomeIcon } from '@/components/ui/tab-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { Tabs, type ErrorBoundaryProps } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, type ColorSchemeName } from 'react-native';


/**
 * ErrorBoundary para las pantallas de tabs.
 * Captura errores específicos de las tabs sin afectar el resto de la app.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback error={error} retry={retry} title="Error en la pantalla" />;
}

// Componente extraído para evitar nested components (S6478)


const TabBarBackground = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
  if (Platform.OS !== 'ios') return null;
  return (
    <BlurView 
      intensity={80} 
      style={StyleSheet.absoluteFill} 
      tint={colorScheme === 'dark' ? 'dark' : 'light'} 
    />
  );
};

export default function TabLayout() {
  const theme = useAppTheme();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tenant.mainColor,
        headerShown: Platform.OS === 'ios',
        headerTransparent: Platform.OS === 'ios',
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        tabBarButton: HapticTab,
        tabBarBackground: () => <TabBarBackground colorScheme={colorScheme} />,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.colors.background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          position: Platform.OS === 'ios' ? 'absolute' : 'relative',
        },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Instituciones',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => <HomeIcon size={26} color={color} focused={focused} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'Tarjetas',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => <CardsIcon size={26} color={color} focused={focused} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
