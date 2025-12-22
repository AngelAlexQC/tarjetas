import { STORAGE_KEYS } from '@/constants/app';
import { defaultTheme, TenantTheme } from '@/constants/tenant-themes';
import { RepositoryContainer } from '@/repositories';
import type { Tenant } from '@/repositories/schemas/tenant.schema';
import { loggers } from '@/core/logging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const log = loggers.theme;

// Tipo unificado que soporta tanto el formato antiguo como el nuevo
type TenantThemeType = TenantTheme | Tenant;

// Type guard para distinguir entre formatos
function isTenant(theme: TenantThemeType): theme is Tenant {
  return 'branding' in theme && 'features' in theme;
}

interface TenantThemeContextType {
  currentTheme: TenantThemeType | null;
  colorScheme: 'light' | 'dark';
  setTenant: (tenant: TenantThemeType) => Promise<void>;
  clearTenant: () => Promise<void>;
  isLoading: boolean;
}

const TenantThemeContext = createContext<TenantThemeContextType | undefined>(undefined);

let hasWarnedMissingProvider = false;

// Variables a nivel de módulo para persistir entre remounts
let hasLoadedTheme = false;
let cachedTheme: TenantThemeType | null = null;

export const resetThemeCacheForTesting = () => {
  hasLoadedTheme = false;
  cachedTheme = null;
};

export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<TenantThemeType | null>(cachedTheme);
  const [isLoading, setIsLoading] = useState(!hasLoadedTheme);
  const colorScheme = useRNColorScheme() ?? 'light';

  // Cargar tema guardado al iniciar
  useEffect(() => {
    // Guard para evitar ejecuciones múltiples (persiste entre remounts)
    if (hasLoadedTheme) {
      // Si ya cargamos antes, usar el tema cacheado
      if (cachedTheme && !currentTheme) {
        setCurrentTheme(cachedTheme);
      }
      return;
    }
    hasLoadedTheme = true;

    const validateAndLoadTenant = async (parsed: Tenant) => {
      try {
        const repo = RepositoryContainer.getTenantRepository();
        const current = await repo.getTenantById(parsed.id);
        
        if (current) {
          cachedTheme = current;
          setCurrentTheme(current);
          log.info(`Loaded tenant: ${current.name}`);
        } else {
          log.warn('Saved tenant no longer exists, clearing');
          await AsyncStorage.removeItem(STORAGE_KEYS.TENANT_THEME);
        }
      } catch {
        log.warn('Could not verify tenant, using cached version');
        cachedTheme = parsed;
        setCurrentTheme(parsed);
      }
    };

    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.TENANT_THEME);
        if (!savedTheme) {
          return;
        }

        const parsed = JSON.parse(savedTheme);
        
        if (!('branding' in parsed && 'features' in parsed)) {
          cachedTheme = parsed;
          setCurrentTheme(parsed);
          return;
        }

        await validateAndLoadTenant(parsed);
      } catch (error) {
        log.error('Error loading saved theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedTheme();
  }, [currentTheme]);

  const setTenant = useCallback(async (tenant: TenantThemeType) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TENANT_THEME, JSON.stringify(tenant));
      setCurrentTheme(tenant);
      log.info(`Tenant set: ${tenant.name}`);
    } catch (error) {
      log.error('Error saving theme:', error);
    }
  }, []);

  const clearTenant = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TENANT_THEME);
      setCurrentTheme(defaultTheme); // Reset to defaultTheme instead of null
      cachedTheme = null; // Clear cache
      log.info('Tenant cleared');
    } catch (error) {
      log.error('Error clearing theme:', error);
    }
  }, []);

  const contextValue = useMemo(() => ({
    currentTheme: currentTheme || defaultTheme,
    colorScheme,
    setTenant,
    clearTenant,
    isLoading,
  }), [currentTheme, colorScheme, setTenant, clearTenant, isLoading]);

  return (
    <TenantThemeContext.Provider value={contextValue}>
      {children}
    </TenantThemeContext.Provider>
  );
}

export function useTenantTheme() {
  const context = useContext(TenantThemeContext);
  const fallbackColorScheme = useRNColorScheme() ?? 'light';
  if (context === undefined) {
    if (!hasWarnedMissingProvider) {
      hasWarnedMissingProvider = true;
      log.warn('useTenantTheme used outside TenantThemeProvider; falling back to defaultTheme');
    }

    return {
      currentTheme: defaultTheme,
      colorScheme: fallbackColorScheme,
      setTenant: async () => {},
      clearTenant: async () => {},
      isLoading: false,
    };
  }
  return context;
}

// Hook para obtener colores basados en el tema actual
export function useThemedColors() {
  const { currentTheme, colorScheme } = useTenantTheme();
  
  // Determinar si es formato nuevo (Tenant) o antiguo (TenantTheme)
  const branding = (() => {
    if (!currentTheme) {
      return {
        primaryColor: '#0a7ea4',
        secondaryColor: '#2196F3',
        accentColor: '#FF9800',
        textOnPrimary: '#FFFFFF',
        textOnSecondary: '#FFFFFF',
        gradientColors: ['#0a7ea4', '#2196F3'],
      };
    }

    if (isTenant(currentTheme)) {
      // Formato nuevo (Tenant con branding)
      return currentTheme.branding;
    } else {
      // Formato antiguo (TenantTheme)
      return {
        primaryColor: currentTheme.mainColor,
        secondaryColor: currentTheme.secondaryColor,
        accentColor: currentTheme.accentColor,
        textOnPrimary: currentTheme.textOnPrimary,
        textOnSecondary: currentTheme.textOnSecondary,
        gradientColors: currentTheme.gradientColors,
      };
    }
  })();
  
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
