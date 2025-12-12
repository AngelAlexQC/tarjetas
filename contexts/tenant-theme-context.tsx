import { STORAGE_KEYS } from '@/constants/app';
import { defaultTenant, getBrandingFromTenant } from '@/constants/tenant-themes';
import { RepositoryContainer } from '@/repositories';
import type { Tenant } from '@/repositories/schemas/tenant.schema';
import { loggers } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const log = loggers.theme;

interface TenantThemeContextType {
  currentTheme: Tenant;
  colorScheme: 'light' | 'dark';
  setTenant: (tenant: Tenant) => Promise<void>;
  clearTenant: () => Promise<void>;
  isLoading: boolean;
}

const TenantThemeContext = createContext<TenantThemeContextType | undefined>(undefined);

export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Tenant>(defaultTenant);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useRNColorScheme() ?? 'light';

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.TENANT_THEME);
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme) as Tenant;
        
        // Validar que el tenant guardado aún existe en el backend
        const isValidTenant = parsed.branding && parsed.features;
        if (!isValidTenant) {
          return;
        }

        try {
          const repo = RepositoryContainer.getTenantRepository();
          const current = await repo.getTenantById(parsed.id);
          
          if (current) {
            setCurrentTheme(current);
            log.info(`Loaded tenant: ${current.name}`);
          } else {
            log.warn('Saved tenant no longer exists, clearing');
            await AsyncStorage.removeItem(STORAGE_KEYS.TENANT_THEME);
          }
        } catch {
          log.warn('Could not verify tenant, using cached version');
          setCurrentTheme(parsed);
        }
      }
    } catch (error) {
      log.error('Error loading saved theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTenant = async (tenant: Tenant) => {
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
      setCurrentTheme(defaultTenant);
      log.info('Tenant cleared');
    } catch (error) {
      log.error('Error clearing theme:', error);
    }
  };

  return (
    <TenantThemeContext.Provider
      value={{
        currentTheme,
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

export function useThemedColors() {
  const { currentTheme, colorScheme } = useTenantTheme();
  
  const branding = getBrandingFromTenant(currentTheme);
  
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
