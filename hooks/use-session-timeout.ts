/**
 * useSessionTimeout Hook
 *
 * Hook para manejar la expiración de sesión por inactividad.
 * Cierra la sesión automáticamente después de un período sin actividad.
 *
 * SEGURIDAD:
 * - Timeout configurable (default: 15 minutos)
 * - Reset automático con actividad del usuario
 * - Callback para notificar expiración
 */

import { AUTH_CONFIG, SANITIZED_ERROR_MESSAGES } from '@/constants/security';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseSessionTimeoutOptions {
  /** Tiempo de inactividad antes de expirar (ms) */
  timeoutMs?: number;
  /** Callback cuando la sesión expira */
  onTimeout: () => void;
  /** Si el timeout está habilitado */
  enabled?: boolean;
  /** Callback de advertencia antes de expirar */
  onWarning?: (secondsRemaining: number) => void;
  /** Segundos antes de expirar para mostrar advertencia */
  warningThresholdSeconds?: number;
}

interface UseSessionTimeoutReturn {
  /** Resetea el timer de inactividad */
  resetTimer: () => void;
  /** Segundos restantes antes de expiración */
  secondsRemaining: number | null;
  /** Si está en período de advertencia */
  isWarning: boolean;
  /** Mensaje de sesión expirada */
  expiredMessage: string;
}

export function useSessionTimeout({
  timeoutMs = AUTH_CONFIG.SESSION_TIMEOUT_MS,
  onTimeout,
  enabled = true,
  onWarning,
  warningThresholdSeconds = 60,
}: UseSessionTimeoutOptions): UseSessionTimeoutReturn {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isWarning, setIsWarning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  }, []);

  const startWarningCountdown = useCallback(() => {
    if (warningIntervalRef.current) return;

    const updateCountdown = () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));

      setSecondsRemaining(remaining);

      if (remaining <= warningThresholdSeconds && remaining > 0) {
        setIsWarning(true);
        onWarning?.(remaining);
      }

      if (remaining <= 0) {
        clearTimers();
        onTimeout();
      }
    };

    warningIntervalRef.current = setInterval(updateCountdown, 1000);
    updateCountdown();
  }, [timeoutMs, warningThresholdSeconds, onWarning, onTimeout, clearTimers]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();
    setIsWarning(false);
    setSecondsRemaining(null);
    clearTimers();

    // Iniciar nuevo timeout
    timeoutRef.current = setTimeout(() => {
      // Iniciar countdown de advertencia
      startWarningCountdown();
    }, timeoutMs - warningThresholdSeconds * 1000);
  }, [enabled, timeoutMs, warningThresholdSeconds, clearTimers, startWarningCountdown]);

  // Manejar cambios de estado de la app (background/foreground)
  useEffect(() => {
    if (!enabled) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current === 'background' && nextAppState === 'active') {
        // App volvió al foreground, verificar si expiró
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= timeoutMs) {
          onTimeout();
        } else {
          // Reiniciar timer con tiempo restante
          resetTimer();
        }
      } else if (nextAppState === 'background') {
        // App fue a background, pausar timers pero mantener lastActivity
        clearTimers();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [enabled, timeoutMs, onTimeout, resetTimer, clearTimers]);

  // Inicializar timer cuando se habilita
  useEffect(() => {
    if (enabled) {
      resetTimer();
    } else {
      clearTimers();
      setSecondsRemaining(null);
      setIsWarning(false);
    }

    return () => {
      clearTimers();
    };
  }, [enabled, resetTimer, clearTimers]);

  return {
    resetTimer,
    secondsRemaining,
    isWarning,
    expiredMessage: SANITIZED_ERROR_MESSAGES.SESSION_EXPIRED,
  };
}

/**
 * Hook simplificado para registrar actividad del usuario
 * Útil para componentes que necesitan resetear el timer
 */
export function useActivityTracker(resetTimer: () => void) {
  const lastResetRef = useRef<number>(0);

  const trackActivity = useCallback(() => {
    const now = Date.now();
    // Throttle: solo resetear cada segundo como máximo
    if (now - lastResetRef.current > 1000) {
      lastResetRef.current = now;
      resetTimer();
    }
  }, [resetTimer]);

  return { trackActivity };
}
