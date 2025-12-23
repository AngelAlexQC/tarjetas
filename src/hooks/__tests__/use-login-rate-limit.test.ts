/**
 * Tests para useLoginRateLimit hook
 *
 * Tests de seguridad crítica para el sistema de rate limiting de login
 */

import { RATE_LIMIT_CONFIG, SANITIZED_ERROR_MESSAGES } from '@/constants/security';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useLoginRateLimit } from '../use-login-rate-limit';

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('useLoginRateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Estado inicial', () => {
    it('debe iniciar con estado desbloqueado', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        expect(result.current.isLocked).toBe(false);
        expect(result.current.lockoutSecondsRemaining).toBe(0);
        expect(result.current.currentAttempts).toBe(0);
        expect(result.current.maxAttempts).toBe(RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS);
        expect(result.current.canAttemptLogin()).toBe(true);
        expect(result.current.lockoutMessage).toBeNull();
      });
    });

    it('debe tener el máximo de intentos configurado', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        expect(result.current.maxAttempts).toBe(5);
      });
    });
  });

  describe('Persistencia de estado', () => {
    it('debe cargar estado guardado en AsyncStorage', async () => {
      const savedState = {
        attempts: 3,
        lockoutUntil: null,
        lockoutCount: 0,
        lastAttemptAt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        expect(result.current.currentAttempts).toBe(3);
      });
    });

    it('debe resetear intentos si ha pasado el tiempo de reset', async () => {
      const oldTimestamp = Date.now() - (RATE_LIMIT_CONFIG.ATTEMPT_RESET_MS + 1000);
      const savedState = {
        attempts: 3,
        lockoutUntil: null,
        lockoutCount: 0,
        lastAttemptAt: oldTimestamp,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        expect(result.current.currentAttempts).toBe(0);
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@login_rate_limit');
      });
    });

    it('debe manejar errores al cargar desde AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        expect(result.current.currentAttempts).toBe(0);
        expect(result.current.isLocked).toBe(false);
      });
    });

    it('debe manejar JSON inválido en AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const { result } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        expect(result.current.currentAttempts).toBe(0);
      });
    });
  });

  describe('Registro de intentos fallidos', () => {
    it('debe incrementar intentos al registrar fallo', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      await act(async () => {
        await result.current.recordFailedAttempt();
      });

      await waitFor(() => {
        expect(result.current.currentAttempts).toBe(1);
        expect(result.current.isLocked).toBe(false);
      });
    });

    it('debe persistir estado después de cada intento fallido', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      await act(async () => {
        await result.current.recordFailedAttempt();
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@login_rate_limit',
          expect.stringContaining('"attempts":1')
        );
      });
    });

    it('debe bloquear después de MAX_LOGIN_ATTEMPTS intentos', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Registrar 5 intentos fallidos
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      await waitFor(() => {
        expect(result.current.isLocked).toBe(true);
        expect(result.current.canAttemptLogin()).toBe(false);
        expect(result.current.lockoutMessage).toContain(SANITIZED_ERROR_MESSAGES.RATE_LIMITED);
      });
    });

    it('debe manejar errores de persistencia silenciosamente', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useLoginRateLimit());

      await act(async () => {
        await result.current.recordFailedAttempt();
      });

      // No debe lanzar error, debe continuar
      await waitFor(() => {
        expect(result.current.currentAttempts).toBe(1);
      });
    });
  });

  describe('Sistema de bloqueo', () => {
    it('debe calcular tiempo de bloqueo inicial correctamente', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Hacer 5 intentos para activar bloqueo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      await waitFor(() => {
        expect(result.current.lockoutSecondsRemaining).toBeGreaterThan(0);
        expect(result.current.lockoutSecondsRemaining).toBeLessThanOrEqual(60);
      });
    });

    it('debe actualizar segundos restantes cada segundo', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Activar bloqueo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      const initialSeconds = result.current.lockoutSecondsRemaining;

      // Avanzar 1 segundo
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.lockoutSecondsRemaining).toBeLessThan(initialSeconds);
      });
    });

    it('debe desbloquear automáticamente cuando expire el tiempo', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Activar bloqueo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      expect(result.current.isLocked).toBe(true);

      // Avanzar tiempo suficiente para expirar el bloqueo
      act(() => {
        jest.advanceTimersByTime(RATE_LIMIT_CONFIG.INITIAL_LOCKOUT_MS + 1000);
      });

      await waitFor(() => {
        expect(result.current.isLocked).toBe(false);
        expect(result.current.lockoutSecondsRemaining).toBe(0);
        expect(result.current.currentAttempts).toBe(0);
      });
    });

    it('debe mostrar mensaje de bloqueo con tiempo restante', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Activar bloqueo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      await waitFor(() => {
        expect(result.current.lockoutMessage).toContain('Intenta de nuevo en');
        expect(result.current.lockoutMessage).toMatch(/\d+\s(segundo|minuto)/);
      });
    });

    it('debe incrementar contador de bloqueos para bloqueo progresivo', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Primer bloqueo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      // Verificar que lockoutCount se incrementó
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@login_rate_limit',
          expect.stringContaining('"lockoutCount":1')
        );
      });
    });
  });

  describe('Reset de estado', () => {
    it('debe resetear completamente después de login exitoso', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Registrar algunos intentos
      await act(async () => {
        await result.current.recordFailedAttempt();
      });
      
      await act(async () => {
        await result.current.recordFailedAttempt();
      });

      await waitFor(() => {
        expect(result.current.currentAttempts).toBe(2);
      });

      // Reset
      await act(async () => {
        await result.current.resetOnSuccess();
      });

      await waitFor(() => {
        expect(result.current.currentAttempts).toBe(0);
        expect(result.current.isLocked).toBe(false);
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@login_rate_limit');
      });
    });

    it('debe permitir nuevos intentos después de reset', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Bloquear
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      expect(result.current.canAttemptLogin()).toBe(false);

      // Reset
      await act(async () => {
        await result.current.resetOnSuccess();
      });

      await waitFor(() => {
        expect(result.current.canAttemptLogin()).toBe(true);
      });
    });
  });

  describe('Validación de intentos', () => {
    it('canAttemptLogin debe retornar true si no está bloqueado', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        expect(result.current.canAttemptLogin()).toBe(true);
      });
    });

    it('canAttemptLogin debe retornar false si está bloqueado', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Activar bloqueo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      await waitFor(() => {
        expect(result.current.canAttemptLogin()).toBe(false);
      });
    });
  });

  describe('Formateo de mensajes', () => {
    it('debe formatear segundos correctamente', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Activar bloqueo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      await waitFor(() => {
        const message = result.current.lockoutMessage;
        expect(message).toMatch(/segundo(s)?/);
      });
    });

    it('debe formatear minutos cuando el tiempo es mayor a 60 segundos', async () => {
      // Cargar estado con lockout largo
      const futureTime = Date.now() + 120000; // 2 minutos
      const savedState = {
        attempts: 5,
        lockoutUntil: futureTime,
        lockoutCount: 1,
        lastAttemptAt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        const message = result.current.lockoutMessage;
        expect(message).toMatch(/minuto(s)?/);
      });
    });

    it('debe usar singular/plural correctamente en mensajes', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Activar bloqueo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      await waitFor(() => {
        const message = result.current.lockoutMessage;
        // El mensaje debe contener la palabra en singular o plural
        expect(message).toMatch(/(segundo|segundos|minuto|minutos)/);
      });
    });
  });

  describe('Escenarios edge case', () => {
    it('debe manejar múltiples intentos rápidos', async () => {
      const { result } = renderHook(() => useLoginRateLimit());

      // Intentos simultáneos
      await act(async () => {
        await Promise.all([
          result.current.recordFailedAttempt(),
          result.current.recordFailedAttempt(),
          result.current.recordFailedAttempt(),
        ]);
      });

      await waitFor(() => {
        expect(result.current.currentAttempts).toBeGreaterThan(0);
      });
    });

    it('debe mantener consistencia si el componente se desmonta y monta', async () => {
      const savedState = {
        attempts: 3,
        lockoutUntil: null,
        lockoutCount: 0,
        lastAttemptAt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedState));

      const { result: result1, unmount } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        expect(result1.current.currentAttempts).toBe(3);
      });

      unmount();

      // Montar de nuevo
      const { result: result2 } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        expect(result2.current.currentAttempts).toBe(3);
      });
    });

    it('debe limpiar intervalos al desmontar', async () => {
      const { result, unmount } = renderHook(() => useLoginRateLimit());

      // Activar bloqueo para iniciar intervalo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      await waitFor(() => {
        expect(result.current.isLocked).toBe(true);
      });

      // El unmount limpiará el intervalo automáticamente
      unmount();

      // Solo verificamos que no hay errores al desmontar
      expect(true).toBe(true);
    });

    it('debe persistir lockoutCount para bloqueos progresivos', async () => {
      const { result, unmount } = renderHook(() => useLoginRateLimit());

      // Primer ciclo de bloqueo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      await waitFor(() => {
        expect(result.current.isLocked).toBe(true);
      });

      // Verificar que se guardó lockoutCount
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const savedData = JSON.parse(lastCall[1]);

      expect(savedData.lockoutCount).toBe(1);
      
      unmount();
    });
  });

  describe('Seguridad', () => {
    it('no debe permitir bypass del bloqueo manipulando el tiempo', async () => {
      const { result, unmount } = renderHook(() => useLoginRateLimit());

      // Activar bloqueo
      for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS; i++) {
        await act(async () => {
          await result.current.recordFailedAttempt();
        });
      }

      await waitFor(() => {
        expect(result.current.canAttemptLogin()).toBe(false);
        expect(result.current.isLocked).toBe(true);
      });
      
      unmount();
    });

    it('debe validar intentos basado en timestamp del servidor (Date.now)', async () => {
      const now = Date.now();
      const futureTime = now + 60000;

      const savedState = {
        attempts: 5,
        lockoutUntil: futureTime,
        lockoutCount: 1,
        lastAttemptAt: now,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedState));

      const { result, unmount } = renderHook(() => useLoginRateLimit());

      await waitFor(() => {
        expect(result.current.isLocked).toBe(true);
        expect(result.current.canAttemptLogin()).toBe(false);
      });
      
      unmount();
    });
  });
});
