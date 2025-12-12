/**
 * Tests para useAuthFlow Hook
 *
 * Tests de seguridad crítica para el flujo de autenticación
 * 
 * Cobertura:
 * 1. Flujo de onboarding
 * 2. Flujo de login tradicional
 * 3. Flujo de autenticación biométrica
 * 4. Navegación post-autenticación
 * 5. Bloqueo biométrico al volver de background
 * 6. Modal de habilitación biométrica
 * 7. Estados de carga
 * 8. Edge cases
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthFlow } from '../use-auth-flow';
import { authStorage } from '@/utils/auth-storage';
import { TIMING } from '@/constants/app';
import { AppState } from 'react-native';

// Mocks
const mockRouterReplace = jest.fn();
const mockSetAppReady = jest.fn();
const mockPauseTour = jest.fn();
const mockResumeTour = jest.fn();
const mockEnableBiometric = jest.fn();

// Mock de expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
  }),
}));

// Mock de auth-context
const mockAuthContext = {
  isAuthenticated: false,
  isLoading: false,
  isBiometricEnabled: false,
  isBiometricAvailable: false,
  enableBiometric: mockEnableBiometric,
};

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock de tenant-theme-context
const mockTenantTheme = {
  currentTheme: null,
  isLoading: false,
};

jest.mock('@/contexts/tenant-theme-context', () => ({
  useTenantTheme: () => mockTenantTheme,
}));

// Mock de tour-context
jest.mock('@/contexts/tour-context', () => ({
  useTour: () => ({
    setAppReady: mockSetAppReady,
    pauseTour: mockPauseTour,
    resumeTour: mockResumeTour,
  }),
}));

// Mock de authStorage
jest.mock('@/utils/auth-storage', () => ({
  authStorage: {
    getOnboardingStatus: jest.fn(),
    setOnboardingCompleted: jest.fn(),
  },
}));

// Mock de AppState
const mockAddEventListener = jest.fn((_event, _handler) => ({
  remove: jest.fn(),
}));

jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: mockAddEventListener,
  },
}));

describe('useAuthFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset mocks con valores por defecto
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.isLoading = false;
    mockAuthContext.isBiometricEnabled = false;
    mockAuthContext.isBiometricAvailable = false;
    mockTenantTheme.currentTheme = null;
    mockTenantTheme.isLoading = false;
    
    (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(false);
    (authStorage.setOnboardingCompleted as jest.Mock).mockResolvedValue(undefined);
    mockEnableBiometric.mockResolvedValue(undefined);
    
    // Mock de AppState
    Object.defineProperty(AppState, 'currentState', {
      value: 'active',
      writable: true,
      configurable: true,
    });
    
    Object.defineProperty(AppState, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
      configurable: true,
    });
    
    mockAddEventListener.mockReturnValue({ remove: jest.fn() });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Estado inicial y carga', () => {
    it('debe mostrar pantalla de loading mientras carga onboarding status', () => {
      const { result } = renderHook(() => useAuthFlow());

      expect(result.current.currentScreen).toBe('loading');
    });

    it('debe mostrar loading mientras auth está cargando', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isLoading = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('loading');
      });
    });

    it('debe mostrar loading mientras tenant está cargando', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockTenantTheme.isLoading = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('loading');
      });
    });
  });

  describe('Flujo de onboarding', () => {
    it('debe mostrar onboarding si no está completado', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('onboarding');
      });
    });

    it('debe marcar onboarding como completado y mostrar login', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('onboarding');
      });

      await act(async () => {
        await result.current.handleOnboardingFinish();
      });

      await waitFor(() => {
        expect(authStorage.setOnboardingCompleted).toHaveBeenCalled();
        expect(result.current.currentScreen).toBe('login');
      });
    });

    it('no debe mostrar onboarding si ya está completado', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).not.toBe('onboarding');
      });
    });
  });

  describe('Flujo de login tradicional', () => {
    it('debe mostrar pantalla de login si no está autenticado', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = false;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('login');
      });
    });

    it('debe navegar a main después de login exitoso sin biométrica disponible', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isBiometricAvailable = false;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('login');
      });

      act(() => {
        result.current.handleLoginSuccess();
      });

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('debe mostrar modal biométrico después de login si está disponible', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isBiometricAvailable = true;
      mockAuthContext.isBiometricEnabled = false;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('login');
      });

      act(() => {
        result.current.handleLoginSuccess();
      });

      await waitFor(() => {
        expect(result.current.showBiometricModal).toBe(true);
      });
    });

    it('no debe mostrar modal biométrico si ya está habilitado', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isBiometricAvailable = true;
      mockAuthContext.isBiometricEnabled = true;
      mockAuthContext.isAuthenticated = false;

      const { result } = renderHook(() => useAuthFlow());

      // Cuando biométrica está habilitada pero no autenticado, muestra biometric-access
      await waitFor(() => {
        expect(result.current.currentScreen).toBe('biometric-access');
      });

      // Autenticar con biométrica
      act(() => {
        result.current.handleBiometricSuccess();
      });

      // Luego de éxito biométrico, el flujo continúa sin modal
      await waitFor(() => {
        expect(result.current.showBiometricModal).toBe(false);
        expect(mockResumeTour).toHaveBeenCalled();
      });
    });
  });

  describe('Flujo de autenticación biométrica', () => {
    it('debe mostrar pantalla biométrica si está habilitada y hay sesión', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isBiometricEnabled = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('biometric-access');
        expect(mockPauseTour).toHaveBeenCalled();
      });
    });

    it('debe permitir continuar después de autenticación biométrica exitosa', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isBiometricEnabled = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('biometric-access');
      });

      act(() => {
        result.current.handleBiometricSuccess();
      });

      await waitFor(() => {
        expect(mockResumeTour).toHaveBeenCalled();
        expect(result.current.currentScreen).not.toBe('biometric-access');
      });
    });

    it('debe mostrar login al elegir usar contraseña desde biométrica', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isBiometricEnabled = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('biometric-access');
      });

      act(() => {
        result.current.handleBiometricUsePassword();
      });

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('login');
      });
    });

    it('debe mostrar biométrica después de onboarding si está habilitada', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(false);
      mockAuthContext.isBiometricEnabled = true;
      mockAuthContext.isBiometricAvailable = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('onboarding');
      });

      await act(async () => {
        await result.current.handleOnboardingFinish();
      });

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('biometric-access');
      });
    });
  });

  describe('Navegación post-autenticación', () => {
    it('debe navegar a /(tabs) si no hay tenant', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockTenantTheme.currentTheme = null;

      renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)');
      });

      act(() => {
        jest.advanceTimersByTime(TIMING.APP_READY_DELAY_WITHOUT_TENANT);
      });

      expect(mockSetAppReady).toHaveBeenCalled();
    });

    it('debe navegar a /(tabs)/cards si hay tenant', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockTenantTheme.currentTheme = { slug: 'test-tenant', name: 'Test' } as any;

      renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/cards');
      });

      act(() => {
        jest.advanceTimersByTime(TIMING.APP_READY_DELAY_WITH_TENANT);
      });

      expect(mockSetAppReady).toHaveBeenCalled();
    });

    it('no debe navegar si tenant está cargando', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockTenantTheme.isLoading = true;

      renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(mockRouterReplace).not.toHaveBeenCalled();
      });
    });
  });

  describe('Bloqueo biométrico al volver de background', () => {
    it('debe mostrar bloqueo biométrico al volver de background', async () => {
      let appStateHandler: (state: any) => void = () => {};
      mockAddEventListener.mockImplementation((event, handler) => {
        appStateHandler = handler;
        return { remove: jest.fn() };
      });

      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isBiometricEnabled = true;

      const { result } = renderHook(() => useAuthFlow());

      // Simular autenticación biométrica exitosa inicial
      await waitFor(() => {
        expect(result.current.currentScreen).toBe('biometric-access');
      });

      act(() => {
        result.current.handleBiometricSuccess();
      });

      // Simular app yendo a background
      act(() => {
        appStateHandler('background');
      });

      // Avanzar el tiempo más allá del grace period
      act(() => {
        jest.advanceTimersByTime(TIMING.BIOMETRIC_GRACE_PERIOD + 1000);
      });

      // Simular app volviendo al foreground
      act(() => {
        appStateHandler('active');
      });

      await waitFor(() => {
        expect(mockPauseTour).toHaveBeenCalled();
        expect(result.current.currentScreen).toBe('biometric-access');
      });
    });

    it('no debe bloquear si está dentro del grace period', async () => {
      let appStateHandler: (state: any) => void = () => {};
      mockAddEventListener.mockImplementation((event, handler) => {
        appStateHandler = handler;
        return { remove: jest.fn() };
      });

      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isBiometricEnabled = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('biometric-access');
      });

      act(() => {
        result.current.handleBiometricSuccess();
      });

      act(() => {
        appStateHandler('background');
      });

      // Avanzar el tiempo menos que el grace period
      act(() => {
        jest.advanceTimersByTime(TIMING.BIOMETRIC_GRACE_PERIOD - 1000);
      });

      act(() => {
        appStateHandler('active');
      });

      // No debe cambiar a biometric-access
      expect(result.current.currentScreen).not.toBe('biometric-access');
    });

    it('no debe bloquear si biométrica no está habilitada', async () => {
      let appStateHandler: (state: any) => void = () => {};
      mockAddEventListener.mockImplementation((event, handler) => {
        appStateHandler = handler;
        return { remove: jest.fn() };
      });

      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isBiometricEnabled = false;

      renderHook(() => useAuthFlow());

      act(() => {
        appStateHandler('background');
      });

      act(() => {
        jest.advanceTimersByTime(TIMING.BIOMETRIC_GRACE_PERIOD + 1000);
      });

      act(() => {
        appStateHandler('active');
      });

      expect(mockPauseTour).not.toHaveBeenCalled();
    });

    it('debe limpiar suscripción de AppState al desmontar', async () => {
      const removeMock = jest.fn();
      mockAddEventListener.mockReturnValue({ remove: removeMock });

      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);

      const { unmount } = renderHook(() => useAuthFlow());

      unmount();

      expect(removeMock).toHaveBeenCalled();
    });
  });

  describe('Modal de habilitación biométrica', () => {
    it('debe habilitar biométrica y navegar al presionar habilitar', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isBiometricAvailable = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('login');
      });

      act(() => {
        result.current.handleLoginSuccess();
      });

      await waitFor(() => {
        expect(result.current.showBiometricModal).toBe(true);
      });

      await act(async () => {
        await result.current.handleEnableBiometric();
      });

      await waitFor(() => {
        expect(mockEnableBiometric).toHaveBeenCalled();
        expect(result.current.showBiometricModal).toBe(false);
        expect(mockRouterReplace).toHaveBeenCalled();
      });
    });

    it('debe navegar sin habilitar al presionar omitir', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isBiometricAvailable = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('login');
      });

      act(() => {
        result.current.handleLoginSuccess();
      });

      await waitFor(() => {
        expect(result.current.showBiometricModal).toBe(true);
      });

      act(() => {
        result.current.handleSkipBiometric();
      });

      await waitFor(() => {
        expect(mockEnableBiometric).not.toHaveBeenCalled();
        expect(result.current.showBiometricModal).toBe(false);
        expect(mockRouterReplace).toHaveBeenCalled();
      });
    });

    it('debe navegar correctamente con tenant al habilitar biométrica', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isBiometricAvailable = true;
      mockTenantTheme.currentTheme = { slug: 'test', name: 'Test' } as any;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('login');
      });

      act(() => {
        result.current.handleLoginSuccess();
      });

      await act(async () => {
        await result.current.handleEnableBiometric();
      });

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/cards');
      });
    });
  });

  describe('Edge cases y estados complejos', () => {
    it('debe manejar múltiples transiciones de AppState correctamente', async () => {
      let appStateHandler: (state: any) => void = () => {};
      mockAddEventListener.mockImplementation((event, handler) => {
        appStateHandler = handler;
        return { remove: jest.fn() };
      });

      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isBiometricEnabled = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('biometric-access');
      });

      act(() => {
        result.current.handleBiometricSuccess();
      });

      // Múltiples transiciones
      act(() => {
        appStateHandler('inactive');
      });
      
      act(() => {
        appStateHandler('background');
      });
      
      act(() => {
        jest.advanceTimersByTime(TIMING.BIOMETRIC_GRACE_PERIOD + 1000);
      });
      
      act(() => {
        appStateHandler('inactive');
      });
      
      act(() => {
        appStateHandler('active');
      });

      // Debe pausar dos veces: una al inicio, otra al volver de background
      await waitFor(() => {
        expect(mockPauseTour).toHaveBeenCalledTimes(2);
        expect(result.current.currentScreen).toBe('biometric-access');
      });
    });

    it('debe manejar cambio de autenticación durante el flujo', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = false;

      const { result, rerender } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('login');
      });

      // Simular autenticación
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isBiometricEnabled = false;

      rerender(undefined);

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalled();
      });
    });

    it('debe mantener estado correcto si tenant cambia después de login', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = true;
      mockTenantTheme.currentTheme = null;

      const { rerender } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)');
      });

      mockRouterReplace.mockClear();

      // Cambiar tenant después
      mockTenantTheme.currentTheme = { slug: 'new-tenant', name: 'New' } as any;
      rerender(undefined);

      // No debe navegar de nuevo (initialCheckDone ya es true)
      await waitFor(() => {
        expect(mockRouterReplace).not.toHaveBeenCalled();
      });
    });

    it('debe manejar transición de loading a onboarding correctamente', async () => {
      let resolveOnboarding: (value: boolean) => void;
      const onboardingPromise = new Promise<boolean>(resolve => {
        resolveOnboarding = resolve;
      });
      (authStorage.getOnboardingStatus as jest.Mock).mockReturnValue(onboardingPromise);

      const { result } = renderHook(() => useAuthFlow());

      expect(result.current.currentScreen).toBe('loading');

      await act(async () => {
        resolveOnboarding!(false);
        await onboardingPromise;
      });

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('onboarding');
      });
    });

    it('no debe mostrar modal biométrico si hay error en login', async () => {
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isBiometricAvailable = true;

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('login');
      });

      // No llamar handleLoginSuccess, simular que login falló
      await waitFor(() => {
        expect(result.current.showBiometricModal).toBe(false);
      });
    });

    it('debe manejar usuario no autenticado al volver de background', async () => {
      let appStateHandler: (state: any) => void = () => {};
      mockAddEventListener.mockImplementation((event, handler) => {
        appStateHandler = handler;
        return { remove: jest.fn() };
      });

      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true);
      mockAuthContext.isAuthenticated = false;

      renderHook(() => useAuthFlow());

      act(() => {
        appStateHandler('background');
        appStateHandler('active');
      });

      // No debe intentar mostrar bloqueo biométrico
      expect(mockPauseTour).not.toHaveBeenCalled();
    });
  });
});
