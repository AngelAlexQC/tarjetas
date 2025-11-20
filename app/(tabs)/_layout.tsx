import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { CardsIcon, HomeIcon } from '@/components/ui/tab-icons';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tenant.mainColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
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
