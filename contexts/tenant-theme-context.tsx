import { STORAGE_KEYS } from '@/constants/app';
import { defaultTheme, TenantTheme } from '@/constants/tenant-themes';
import { RepositoryContainer } from '@/repositories';
import type { Tenant } from '@/repositories/schemas/tenant.schema';
import { loggers } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const log = loggers.theme;

// Tipo unificado que soporta tanto el formato antiguo como el nuevo
type TenantThemeType = TenantTheme | Tenant;

interface TenantThemeContextType {
  currentTheme: TenantThemeType | null;
  colorScheme: 'light' | 'dark';
  setTenant: (tenant: TenantThemeType) => Promise<void>;
  clearTenant: () => Promise<void>;
  isLoading: boolean;
}

const TenantThemeContext = createContext<TenantThemeContextType | undefined>(undefined);

export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<TenantThemeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useRNColorScheme() ?? 'light';

  // Cargar tema guardado al iniciar
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.TENANT_THEME);
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        
        // Si es un tenant nuevo (con branding y features), validar que aún exista
        if ('branding' in parsed && 'features' in parsed) {
          try {
            const repo = RepositoryContainer.getTenantRepository();
            const current = await repo.getTenantById(parsed.id);
            
            if (current) {
              setCurrentTheme(current); // Usar versión actualizada
              log.info(`Loaded tenant: ${current.name}`);
            } else {
              log.warn('Saved tenant no longer exists, clearing');
              await AsyncStorage.removeItem(STORAGE_KEYS.TENANT_THEME);
            }
          } catch (err) {
            // Si falla la verificación, usar lo guardado (modo offline)
            log.warn('Could not verify tenant, using cached version');
            setCurrentTheme(parsed);
          }
        } else {
          // Formato antiguo, mantener compatibilidad
          setCurrentTheme(parsed);
        }
      }
    } catch (error) {
      log.error('Error loading saved theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTenant = async (tenant: TenantThemeType) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TENANT_THEME, JSON.stringify(tenant));
      setCurrentTheme(tenant);
      log.info(`Tenant set: ${tenant.name}`);
    } catch (error) {
      log.error('Error saving theme:', error);
    }
  };

  const clearTenant = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TENANT_THEME);
      setCurrentTheme(null);
      log.info('Tenant cleared');
    } catch (error) {
      log.error('Error clearing theme:', error);
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
  
  // Determinar si es formato nuevo o antiguo
  const branding = currentTheme && 'branding' in currentTheme 
    ? currentTheme.branding 
    : {
        primaryColor: (currentTheme as any)?.mainColor || '#0a7ea4',
        secondaryColor: (currentTheme as any)?.secondaryColor || '#2196F3',
        accentColor: (currentTheme as any)?.accentColor || '#FF9800',
        textOnPrimary: (currentTheme as any)?.textOnPrimary || '#FFFFFF',
        textOnSecondary: (currentTheme as any)?.textOnSecondary || '#FFFFFF',
        gradientColors: (currentTheme as any)?.gradientColors || ['#0a7ea4', '#2196F3'],
      };
  
  return {
    primary: branding.primaryColor,
    secondary: branding.secondaryColor,
    accent: branding.accentColor,
    background: colorScheme === 'dark' ? '#151718' : '#fff',
    text: colorScheme === 'dark' ? '#ECEDEE' : '#11181C',
    textOnPrimary: branding.textOnPrimary,
    textOnSecondary: branding.textOnSecondary,
    border: colorScheme === 'dark' ? '#333' : '#e0e0e0',
    card: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
    gradientColors: branding.gradientColors,
  };
}
