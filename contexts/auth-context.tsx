import { authRepository$, User } from '@/repositories';
import { authStorage } from '@/utils/auth-storage';
import { loggers } from '@/utils/logger';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

const log = loggers.auth;

// Re-exportar User desde schemas para que los consumidores puedan importarlo desde aquí
export type { User } from '@/repositories';

/**
 * Sanitiza mensajes de error de autenticación para no exponer detalles técnicos.
 * Los errores técnicos se loguean internamente pero al usuario se le muestra un mensaje genérico.
 */
function sanitizeAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  
  // Errores de credenciales - mensaje específico seguro
  if (message.includes('credential') || message.includes('password') || message.includes('username') || message.includes('invalid')) {
    return 'Usuario o contraseña incorrectos';
  }
  
  // Errores de red
  if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
    return 'Error de conexión. Verifica tu internet e intenta de nuevo.';
  }
  
  // Errores de servidor
  if (message.includes('server') || message.includes('500') || message.includes('503')) {
    return 'El servicio no está disponible. Intenta más tarde.';
  }
  
  // Mensaje genérico para cualquier otro error
  return 'Error al iniciar sesión. Intenta de nuevo.';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBiometricEnabled: boolean;
  isBiometricAvailable: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<{ success: boolean; error?: string }>;
  rememberUsername: (username: string) => Promise<void>;
  getRememberedUsername: () => Promise<string | null>;
  clearRememberedUsername: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [biometricAvailable, session] = await Promise.all([
        authStorage.checkBiometricAvailability(),
        authStorage.loadSession(),
      ]);
      
      setIsBiometricAvailable(biometricAvailable);
      setUser(session.user);
      setIsBiometricEnabled(session.isBiometricEnabled);
      setIsLoading(false);
    };
    
    init();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const authRepo = authRepository$();
      const response = await authRepo.login({ username, password });

      await authStorage.saveToken(response.token);
      
      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        name: response.user.name,
      };
      await authStorage.saveUser(userData);
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      log.error('Login error:', error);
      // Sanitizar mensaje de error - no exponer detalles técnicos
      const errorMessage = sanitizeAuthError(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const authRepo = authRepository$();
      await authRepo.logout();
      await authStorage.clearSession();
      setUser(null);
      setIsBiometricEnabled(false);
    } catch (error) {
      log.error('Logout error:', error);
    }
  }, []);

  const enableBiometric = useCallback(async () => {
    if (!isBiometricAvailable) {
      log.warn('Biometric authentication not available');
      return;
    }
    await authStorage.enableBiometric();
    setIsBiometricEnabled(true);
  }, [isBiometricAvailable]);

  const disableBiometric = useCallback(async () => {
    await authStorage.disableBiometric();
    setIsBiometricEnabled(false);
  }, []);

  const authenticateWithBiometric = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isBiometricAvailable) {
      return { success: false, error: 'Autenticación biométrica no disponible' };
    }

    const session = await authStorage.loadSession();
    if (!session.user) {
      return { success: false, error: 'No hay sesión guardada' };
    }

    const result = await authStorage.authenticate();

    if (result.success) {
      setUser(session.user);
      return { success: true };
    }
    
    return { 
      success: false, 
      error: result.error === 'user_cancel' ? 'Cancelado por el usuario' : 'Autenticación fallida' 
    };
  }, [isBiometricAvailable]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isBiometricEnabled,
    isBiometricAvailable,
    login,
    logout,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    rememberUsername: authStorage.rememberUsername,
    getRememberedUsername: authStorage.getRememberedUsername,
    clearRememberedUsername: authStorage.clearRememberedUsername,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
