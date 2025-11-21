import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

import { HapticTab } from '@/components/haptic-tab';
import { CardsIcon, HomeIcon } from '@/components/ui/tab-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const theme = useAppTheme();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tenant.mainColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView 
              intensity={80} 
              style={StyleSheet.absoluteFill} 
              tint={colorScheme === 'dark' ? 'dark' : 'light'} 
            />
          ) : null
        ),
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
          tabBarIcon: ({ color, focused }) => <HomeIcon size={26} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'Tarjetas',
          tabBarIcon: ({ color, focused }) => <CardsIcon size={26} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
