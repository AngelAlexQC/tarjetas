import { authRepository$ } from '@/repositories';
import { act, renderHook } from '@testing-library/react-native';
import { useUserRecovery } from '../use-user-recovery';

// Mock dependencies
jest.mock('@/repositories', () => ({
  authRepository$: jest.fn()
}));

describe('useUserRecovery', () => {
  const mockRecoverUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authRepository$ as jest.Mock).mockReturnValue({
      recoverUser: mockRecoverUser
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUserRecovery());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful user recovery', async () => {
    const mockResponse = {
      success: true,
      username: 'testuser',
      maskedEmail: 't***@example.com'
    };
    mockRecoverUser.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUserRecovery());

    let response;
    await act(async () => {
      response = await result.current.recoverUser({
        documentType: 'CC',
        documentId: '123456789',
        birthDate: '1990-01-01'
      });
    });

    expect(response).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockRecoverUser).toHaveBeenCalledWith({
        documentType: 'CC',
        documentId: '123456789',
        birthDate: '1990-01-01'
    });
  });

  it('should handle recovery error with message', async () => {
    mockRecoverUser.mockRejectedValue(new Error('User not found'));

    const { result } = renderHook(() => useUserRecovery());

    let response;
    await act(async () => {
      response = await result.current.recoverUser({
        documentType: 'CC',
        documentId: '123456789',
        pin: '1234'
      });
    });

    expect(response).toEqual({ success: false, username: '', maskedEmail: '' });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('User not found');
  });

  it('should handle recovery error without message', async () => {
    mockRecoverUser.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useUserRecovery());

    await act(async () => {
      await result.current.recoverUser({
        documentType: 'CC',
        documentId: '1234567890',
        pin: '1234'
      });
    });

    expect(result.current.error).toBe('No se pudo recuperar el usuario');
  });

  it('should clear error on new attempt', async () => {
    mockRecoverUser.mockRejectedValueOnce(new Error('First error'));
    
    const { result } = renderHook(() => useUserRecovery());

    // First attempt (fails)
    await act(async () => {
      await result.current.recoverUser({ documentType: 'CC', documentId: '1' });
    });
    expect(result.current.error).toBe('First error');

    // Setup success for second attempt
    mockRecoverUser.mockResolvedValueOnce({ success: true });

    // Second attempt
    await act(async () => {
      await result.current.recoverUser({ documentType: 'CC', documentId: '1' });
    });
    
    expect(result.current.error).toBeNull();
  });
});
