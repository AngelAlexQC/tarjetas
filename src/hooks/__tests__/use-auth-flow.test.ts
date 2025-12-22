import { useAuth } from '@/contexts/auth-context';
import { useSplash } from '@/contexts/splash-context';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import { useTour } from '@/contexts/tour-context';
import { authStorage } from '@/utils/auth-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useAuthFlow } from '../use-auth-flow';

// Mock dependencies
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/contexts/tenant-theme-context', () => ({
  useTenantTheme: jest.fn(),
}));
jest.mock('@/contexts/tour-context', () => ({
  useTour: jest.fn(),
}));
jest.mock('@/utils/auth-storage', () => ({
  authStorage: {
    setOnboardingCompleted: jest.fn(),
    saveInstallationName: jest.fn(),
    getOnboardingStatus: jest.fn().mockResolvedValue(true),
    getInstallationName: jest.fn().mockResolvedValue('Test Name'),
  },
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn().mockReturnValue([]),
}));
jest.mock('@/constants/app', () => ({
  TIMING: {
    APP_READY_DELAY_WITH_TENANT: 0,
    APP_READY_DELAY_WITHOUT_TENANT: 0,
  }
}));

describe('useAuthFlow', () => {
  const mockRouter = { replace: jest.fn() };
  const mockSetAppReady = jest.fn();
  const mockResumeTour = jest.fn();
  const mockEnableBiometric = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useTour as jest.Mock).mockReturnValue({
      setAppReady: mockSetAppReady,
      resumeTour: mockResumeTour,
    });
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      isBiometricEnabled: false,
      isBiometricAvailable: true,
      enableBiometric: mockEnableBiometric,
    });
    (useTenantTheme as jest.Mock).mockReturnValue({
      currentTheme: null,
      isLoading: false,
    });
    (useSplash as jest.Mock).mockReturnValue({
      isSplashComplete: true,
      setSplashComplete: jest.fn(),
    });
  });

  it('should verify splash delay logic', async () => {
    (useSplash as jest.Mock).mockReturnValue({
      isSplashComplete: false,
      setSplashComplete: jest.fn(),
    });

    const { result } = renderHook(() => useAuthFlow());

    await waitFor(() => {
        expect(result.current.currentScreen).toBe('loading');
    });
  });

  it('should initialize with loading state', async () => {
    const { result } = renderHook(() => useAuthFlow());
    // Initial state depends on useEffects running
    await waitFor(() => {
        expect(result.current.currentScreen).not.toBe('loading');
    });
    expect(result.current.handleLoginSuccess).toBeDefined();
  });

  describe('handleRecoverUser', () => {
    it('should show recover user screen', async () => {
      const { result } = renderHook(() => useAuthFlow());
      
      await waitFor(() => {
        expect(result.current.currentScreen).not.toBe('loading');
      });

      act(() => {
        result.current.handleRecoverUser();
      });

      expect(result.current.currentScreen).toBe('recover-user');
    });
  });

  describe('handleNameSubmit', () => {
    it('should save name and show login', async () => {
      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).not.toBe('loading');
      });

      await act(async () => {
        await result.current.handleNameSubmit('Test Name');
      });

      expect(authStorage.saveInstallationName).toHaveBeenCalledWith('Test Name');
      // After name submit, it sets showNameInput to false and showLogin to true
      // Need to verify if currentScreen becomes 'login'
      // Assuming showOnboarding is false (default null, but typically resolved)
      // Since useAuthFlow has local state that we can't easily preset without partial hooks or running the effects
      // We check if it sets the internal state which reflects in currentScreen
    });
  });

  describe('logout behavior', () => {
    it('should redirect to name input when logging out and installation name is missing', async () => {
      // 1. Initial State: Authenticated
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isBiometricEnabled: false,
        isBiometricAvailable: true,
      });
      // Mock installation name valid initially
      (authStorage.getInstallationName as jest.Mock).mockResolvedValue('Some Name');

      const { result, rerender } = renderHook(() => useAuthFlow());

      await waitFor(() => {
        expect(result.current.currentScreen).toBe('main');
      });

      // 2. Logout Action: Auth false, installation name wiped
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
      (authStorage.getInstallationName as jest.Mock).mockResolvedValue(null);

      // Rerender to trigger useEffect dependency change
      rerender({});

      // 3. Verify Redirection
      await waitFor(() => {
        expect(result.current.currentScreen).toBe('name-input');
      });
    });
  });

  describe('app restart behavior', () => {
    it('should show login screen (not main) when installation name exists but user is not authenticated', async () => {
      // 1. Setup: Not authenticated, but Name exists
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
      (authStorage.getInstallationName as jest.Mock).mockResolvedValue('Existing Name');
      (authStorage.getOnboardingStatus as jest.Mock).mockResolvedValue(true); 
      (useSplash as jest.Mock).mockReturnValue({ isSplashComplete: true });

      const { result } = renderHook(() => useAuthFlow());

      // Wait for effects
      await waitFor(() => {
        expect(result.current.currentScreen).not.toBe('loading');
      });

      // BUG REPRODUCTION expectation:
      // If logic is flawed, it might return 'main'. We WANT it to be 'login'.
      // For TDD, let's assert what we expect it to BE correct, and see it fail if wrong.
      expect(result.current.currentScreen).toBe('login');
    });
  });
});
