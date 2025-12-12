/**
 * Tests para useSessionTimeout y useActivityTracker hooks
 *
 * Tests de seguridad crítica para el sistema de timeout de sesión
 */

import { AUTH_CONFIG, SANITIZED_ERROR_MESSAGES } from '@/constants/security';
import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useActivityTracker, useSessionTimeout } from '../use-session-timeout';

// Crear mocks antes de los tests
const mockAddEventListener = jest.fn((_event, _handler) => ({
  remove: jest.fn(),
}));

describe('useSessionTimeout', () => {
  let onTimeoutMock: jest.Mock;
  let onWarningMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    onTimeoutMock = jest.fn();
    onWarningMock = jest.fn();
    
    // Mock de AppState para cada test
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
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Estado inicial', () => {
    it('debe inicializar con valores por defecto', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
        })
      );

      expect(result.current.secondsRemaining).toBeNull();
      expect(result.current.isWarning).toBe(false);
      expect(result.current.expiredMessage).toBe(SANITIZED_ERROR_MESSAGES.SESSION_EXPIRED);
      expect(typeof result.current.resetTimer).toBe('function');
    });

    it('debe usar timeout configurado por defecto', () => {
      renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
        })
      );

      // Avanzar hasta justo antes del warning
      act(() => {
        jest.advanceTimersByTime(AUTH_CONFIG.SESSION_TIMEOUT_MS - 61000);
      });

      expect(onTimeoutMock).not.toHaveBeenCalled();
    });

    it('debe aceptar timeout personalizado', () => {
      const customTimeout = 5000; // 5 segundos
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: customTimeout,
          warningThresholdSeconds: 2,
        })
      );

      // Avanzar hasta el warning
      act(() => {
        jest.advanceTimersByTime(customTimeout - 2000);
      });

      expect(result.current.isWarning).toBe(true);
    });

    it('debe poder inicializarse deshabilitado', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          enabled: false,
        })
      );

      // Avanzar tiempo más allá del timeout
      act(() => {
        jest.advanceTimersByTime(AUTH_CONFIG.SESSION_TIMEOUT_MS + 1000);
      });

      expect(onTimeoutMock).not.toHaveBeenCalled();
      expect(result.current.isWarning).toBe(false);
    });
  });

  describe('Sistema de advertencia', () => {
    it('debe mostrar advertencia al acercarse al timeout', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          onWarning: onWarningMock,
          timeoutMs: 120000, // 2 minutos
          warningThresholdSeconds: 30,
        })
      );

      // Avanzar hasta el período de advertencia
      act(() => {
        jest.advanceTimersByTime(90000); // 1.5 minutos
      });

      expect(result.current.isWarning).toBe(true);
      expect(onWarningMock).toHaveBeenCalled();
    });

    it('debe actualizar segundos restantes durante advertencia', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 120000,
          warningThresholdSeconds: 30,
        })
      );

      // Avanzar hasta advertencia
      act(() => {
        jest.advanceTimersByTime(90000);
      });

      const initialSeconds = result.current.secondsRemaining;
      expect(initialSeconds).toBeGreaterThan(0);

      // Avanzar 1 segundo
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.secondsRemaining).toBeLessThan(initialSeconds!);
    });

    it('debe llamar onWarning con segundos restantes', () => {
      renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          onWarning: onWarningMock,
          timeoutMs: 60000,
          warningThresholdSeconds: 10,
        })
      );

      // Avanzar hasta advertencia
      act(() => {
        jest.advanceTimersByTime(50000);
      });

      expect(onWarningMock).toHaveBeenCalled();
      const callArg = onWarningMock.mock.calls[0][0];
      expect(callArg).toBeGreaterThan(0);
      expect(callArg).toBeLessThanOrEqual(10);
    });

    it('debe mantener isWarning true durante todo el período de advertencia', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
          warningThresholdSeconds: 10,
        })
      );

      // Avanzar hasta advertencia
      act(() => {
        jest.advanceTimersByTime(50000);
      });

      expect(result.current.isWarning).toBe(true);

      // Avanzar más tiempo dentro de la advertencia
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.isWarning).toBe(true);
    });
  });

  describe('Expiración de sesión', () => {
    it('debe llamar onTimeout cuando expire el tiempo', () => {
      renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
          warningThresholdSeconds: 10,
        })
      );

      // Avanzar hasta expiración
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(onTimeoutMock).toHaveBeenCalledTimes(1);
    });

    it('debe exponer mensaje de sesión expirada', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
        })
      );

      expect(result.current.expiredMessage).toBe(SANITIZED_ERROR_MESSAGES.SESSION_EXPIRED);
    });

    it('no debe llamar onTimeout si está deshabilitado', () => {
      renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          enabled: false,
          timeoutMs: 60000,
        })
      );

      act(() => {
        jest.advanceTimersByTime(70000);
      });

      expect(onTimeoutMock).not.toHaveBeenCalled();
    });
  });

  describe('Reset de timer', () => {
    it('debe reiniciar el timer al llamar resetTimer', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
          warningThresholdSeconds: 10,
        })
      );

      // Avanzar hasta casi el warning
      act(() => {
        jest.advanceTimersByTime(45000);
      });

      // Reset
      act(() => {
        result.current.resetTimer();
      });

      // Avanzar el mismo tiempo que antes
      act(() => {
        jest.advanceTimersByTime(45000);
      });

      // No debería haber expirado
      expect(onTimeoutMock).not.toHaveBeenCalled();
      expect(result.current.isWarning).toBe(false);
    });

    it('debe limpiar advertencia al resetear', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
          warningThresholdSeconds: 10,
        })
      );

      // Activar advertencia
      act(() => {
        jest.advanceTimersByTime(50000);
      });

      expect(result.current.isWarning).toBe(true);

      // Reset
      act(() => {
        result.current.resetTimer();
      });

      expect(result.current.isWarning).toBe(false);
      expect(result.current.secondsRemaining).toBeNull();
    });

    it('debe poder resetear múltiples veces', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
        })
      );

      for (let i = 0; i < 5; i++) {
        act(() => {
          jest.advanceTimersByTime(30000);
          result.current.resetTimer();
        });
      }

      expect(onTimeoutMock).not.toHaveBeenCalled();
    });

    it('no debe hacer nada si está deshabilitado', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          enabled: false,
          timeoutMs: 60000,
        })
      );

      act(() => {
        result.current.resetTimer();
      });

      // Avanzar tiempo
      act(() => {
        jest.advanceTimersByTime(70000);
      });

      expect(onTimeoutMock).not.toHaveBeenCalled();
    });
  });

  describe('Manejo de AppState', () => {
    it('debe suscribirse a cambios de AppState', () => {
      renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
        })
      );

      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('debe limpiar suscripción al desmontar', () => {
      const removeMock = jest.fn();
      mockAddEventListener.mockReturnValue({
        remove: removeMock,
      });

      const { unmount } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
        })
      );

      unmount();

      expect(removeMock).toHaveBeenCalled();
    });

    it('debe pausar timers cuando la app va a background', () => {
      let appStateHandler: (state: any) => void = () => {};
      mockAddEventListener.mockImplementation((event, handler) => {
        appStateHandler = handler;
        return { remove: jest.fn() };
      });

      renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
          warningThresholdSeconds: 10,
        })
      );

      // Simular app yendo a background
      act(() => {
        appStateHandler('background');
      });

      // Avanzar tiempo mientras está en background
      act(() => {
        jest.advanceTimersByTime(70000);
      });

      // No debería expirar mientras está en background
      expect(onTimeoutMock).not.toHaveBeenCalled();
    });

    it('debe verificar expiración al volver de background', () => {
      let appStateHandler: (state: any) => void = () => {};
      mockAddEventListener.mockImplementation((event, handler) => {
        appStateHandler = handler;
        return { remove: jest.fn() };
      });

      renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
        })
      );

      // Simular paso de tiempo y background
      act(() => {
        jest.advanceTimersByTime(30000);
        appStateHandler('background');
        jest.advanceTimersByTime(40000);
      });

      // Volver al foreground
      act(() => {
        appStateHandler('active');
      });

      // Debería haber expirado
      expect(onTimeoutMock).toHaveBeenCalled();
    });

    it('debe reiniciar timer si no expiró durante background', () => {
      let appStateHandler: (state: any) => void = () => {};
      mockAddEventListener.mockImplementation((event, handler) => {
        appStateHandler = handler;
        return { remove: jest.fn() };
      });

      renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
        })
      );

      // Simular background por poco tiempo
      act(() => {
        jest.advanceTimersByTime(20000);
        appStateHandler('background');
        jest.advanceTimersByTime(10000);
        appStateHandler('active');
      });

      // No debería haber expirado
      expect(onTimeoutMock).not.toHaveBeenCalled();
    });
  });

  describe('Habilitación dinámica', () => {
    it('debe poder deshabilitarse dinámicamente', () => {
      const { result, rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) =>
          useSessionTimeout({
            onTimeout: onTimeoutMock,
            enabled,
            timeoutMs: 60000,
          }),
        { initialProps: { enabled: true } }
      );

      // Deshabilitar
      rerender({ enabled: false });

      act(() => {
        jest.advanceTimersByTime(70000);
      });

      expect(onTimeoutMock).not.toHaveBeenCalled();
      expect(result.current.isWarning).toBe(false);
      expect(result.current.secondsRemaining).toBeNull();
    });

    it('debe poder habilitarse dinámicamente', () => {
      const { rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) =>
          useSessionTimeout({
            onTimeout: onTimeoutMock,
            enabled,
            timeoutMs: 60000,
          }),
        { initialProps: { enabled: false } }
      );

      // Habilitar
      rerender({ enabled: true });

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(onTimeoutMock).toHaveBeenCalled();
    });

    it('debe limpiar timers al deshabilitar', () => {
      const { result, rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) =>
          useSessionTimeout({
            onTimeout: onTimeoutMock,
            enabled,
            timeoutMs: 60000,
            warningThresholdSeconds: 10,
          }),
        { initialProps: { enabled: true } }
      );

      // Activar advertencia
      act(() => {
        jest.advanceTimersByTime(50000);
      });

      expect(result.current.isWarning).toBe(true);

      // Deshabilitar
      rerender({ enabled: false });

      expect(result.current.isWarning).toBe(false);
      expect(result.current.secondsRemaining).toBeNull();
    });
  });

  describe('Limpieza de recursos', () => {
    it('debe limpiar todos los timers al desmontar', () => {
      const { unmount } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
          warningThresholdSeconds: 10,
        })
      );

      // Activar advertencia para iniciar intervalos
      act(() => {
        jest.advanceTimersByTime(50000);
      });

      unmount();

      // Avanzar tiempo después de desmontar
      act(() => {
        jest.advanceTimersByTime(20000);
      });

      // No debería llamarse después de desmontar
      expect(onTimeoutMock).not.toHaveBeenCalled();
    });

    it('debe manejar desmontaje durante advertencia', () => {
      const { unmount } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          onWarning: onWarningMock,
          timeoutMs: 60000,
          warningThresholdSeconds: 10,
        })
      );

      act(() => {
        jest.advanceTimersByTime(50000);
      });

      // Desmontar durante advertencia
      unmount();

      // No debe haber errores
      expect(true).toBe(true);
    });
  });

  describe('Escenarios edge case', () => {
    it('debe manejar threshold de advertencia mayor que timeout', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 30000,
          warningThresholdSeconds: 60,
        })
      );

      // Debería entrar en advertencia inmediatamente (o casi)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.isWarning).toBe(true);
    });

    it('debe manejar timeouts muy cortos', () => {
      renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 1000,
          warningThresholdSeconds: 1,
        })
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onTimeoutMock).toHaveBeenCalled();
    });

    it('debe manejar múltiples resets rápidos', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
        })
      );

      // Múltiples resets
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.resetTimer();
        });
      }

      expect(onTimeoutMock).not.toHaveBeenCalled();
    });

    it('debe manejar warning threshold de 0 segundos', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          onTimeout: onTimeoutMock,
          timeoutMs: 60000,
          warningThresholdSeconds: 0,
        })
      );

      act(() => {
        jest.advanceTimersByTime(59000);
      });

      // No debería entrar en warning mode
      expect(result.current.isWarning).toBe(false);
    });
  });
});

describe('useActivityTracker', () => {
  let resetTimerMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    resetTimerMock = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debe devolver función trackActivity', () => {
    const { result } = renderHook(() => useActivityTracker(resetTimerMock));

    expect(typeof result.current.trackActivity).toBe('function');
  });

  it('debe llamar resetTimer cuando se rastrea actividad', () => {
    const { result } = renderHook(() => useActivityTracker(resetTimerMock));

    act(() => {
      result.current.trackActivity();
    });

    expect(resetTimerMock).toHaveBeenCalledTimes(1);
  });

  it('debe hacer throttle de llamadas rápidas', () => {
    const { result } = renderHook(() => useActivityTracker(resetTimerMock));

    // Llamadas rápidas (menos de 1 segundo)
    act(() => {
      result.current.trackActivity();
      result.current.trackActivity();
      result.current.trackActivity();
    });

    // Solo debería llamar una vez debido al throttle
    expect(resetTimerMock).toHaveBeenCalledTimes(1);
  });

  it('debe permitir llamadas después de 1 segundo', () => {
    const { result } = renderHook(() => useActivityTracker(resetTimerMock));

    act(() => {
      result.current.trackActivity();
    });

    expect(resetTimerMock).toHaveBeenCalledTimes(1);

    // Avanzar 1 segundo
    act(() => {
      jest.advanceTimersByTime(1001);
    });

    act(() => {
      result.current.trackActivity();
    });

    expect(resetTimerMock).toHaveBeenCalledTimes(2);
  });

  it('debe manejar muchas llamadas con throttle correcto', () => {
    const { result } = renderHook(() => useActivityTracker(resetTimerMock));

    // Simular actividad durante 5 segundos
    for (let i = 0; i < 5; i++) {
      act(() => {
        // Múltiples llamadas por segundo
        result.current.trackActivity();
        result.current.trackActivity();
        result.current.trackActivity();
        jest.advanceTimersByTime(1001);
      });
    }

    // Debería ser 5 (una por segundo)
    expect(resetTimerMock).toHaveBeenCalledTimes(5);
  });

  it('debe funcionar con diferentes funciones resetTimer', () => {
    const resetTimer1 = jest.fn();
    const resetTimer2 = jest.fn();

    const { result: result1 } = renderHook(() => useActivityTracker(resetTimer1));
    const { result: result2 } = renderHook(() => useActivityTracker(resetTimer2));

    act(() => {
      result1.current.trackActivity();
      jest.advanceTimersByTime(1001);
      result2.current.trackActivity();
    });

    expect(resetTimer1).toHaveBeenCalledTimes(1);
    expect(resetTimer2).toHaveBeenCalledTimes(1);
  });

  it('debe mantener throttle independiente por instancia', () => {
    const resetTimer1 = jest.fn();
    const resetTimer2 = jest.fn();

    const { result: result1 } = renderHook(() => useActivityTracker(resetTimer1));
    const { result: result2 } = renderHook(() => useActivityTracker(resetTimer2));

    // Llamar ambos al mismo tiempo
    act(() => {
      result1.current.trackActivity();
      result2.current.trackActivity();
    });

    // Ambos deberían llamarse (throttle independiente)
    expect(resetTimer1).toHaveBeenCalledTimes(1);
    expect(resetTimer2).toHaveBeenCalledTimes(1);
  });
});
