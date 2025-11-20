import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TenantTheme {
  slug: string;
  name: string;
  mainColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientColors: string[];
  textOnPrimary: string;
  textOnSecondary: string;
}

interface TenantThemeContextType {
  currentTheme: TenantTheme | null;
  colorScheme: 'light' | 'dark';
  setTenant: (tenant: TenantTheme) => Promise<void>;
  clearTenant: () => Promise<void>;
  isLoading: boolean;
}

const defaultTheme: TenantTheme = {
  slug: 'default',
  name: 'Default',
  mainColor: '#0a7ea4',
  secondaryColor: '#2196F3',
  accentColor: '#FF9800',
  gradientColors: ['#0a7ea4', '#2196F3'],
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
};

const TenantThemeContext = createContext<TenantThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@tenant_theme';

export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<TenantTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useRNColorScheme() ?? 'light';

  // Cargar tema guardado al iniciar
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTheme) {
        setCurrentTheme(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTenant = async (tenant: TenantTheme) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tenant));
      setCurrentTheme(tenant);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const clearTenant = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setCurrentTheme(null);
    } catch (error) {
      console.error('Error clearing theme:', error);
    }
  };

  return (
    <TenantThemeContext.Provider
      value={{
        currentTheme: currentTheme || defaultTheme,
        colorScheme,
        setTenant,
        clearTenant,
        isLoading,
      }}
    >
      {children}
    </TenantThemeContext.Provider>
  );
}

export function useTenantTheme() {
  const context = useContext(TenantThemeContext);
  if (context === undefined) {
    throw new Error('useTenantTheme must be used within a TenantThemeProvider');
  }
  return context;
}

// Hook para obtener colores basados en el tema actual
export function useThemedColors() {
  const { currentTheme, colorScheme } = useTenantTheme();
  
  return {
    primary: currentTheme?.mainColor || '#0a7ea4',
    secondary: currentTheme?.secondaryColor || '#2196F3',
    accent: currentTheme?.accentColor || '#FF9800',
    background: colorScheme === 'dark' ? '#151718' : '#fff',
    text: colorScheme === 'dark' ? '#ECEDEE' : '#11181C',
    textOnPrimary: currentTheme?.textOnPrimary || '#FFFFFF',
    textOnSecondary: currentTheme?.textOnSecondary || '#FFFFFF',
    border: colorScheme === 'dark' ? '#333' : '#e0e0e0',
    card: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
    gradientColors: currentTheme?.gradientColors || ['#0a7ea4', '#2196F3'],
  };
}
