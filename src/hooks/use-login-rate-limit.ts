/**
 * useLoginRateLimit Hook
 *
 * Hook para implementar rate limiting en intentos de login.
 * Previene ataques de fuerza bruta limitando intentos fallidos.
 *
 * SEGURIDAD:
 * - Bloqueo progresivo después de intentos fallidos
 * - Persistencia del estado de bloqueo
 * - Reset automático después de tiempo de espera
 */

import { RATE_LIMIT_CONFIG, SANITIZED_ERROR_MESSAGES } from '@/constants/security';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '@login_rate_limit';

interface RateLimitState {
  attempts: number;
  lockoutUntil: number | null;
  lockoutCount: number;
  lastAttemptAt: number | null;
}

interface UseLoginRateLimitReturn {
  /** Si el login está actualmente bloqueado */
  isLocked: boolean;
  /** Segundos restantes de bloqueo */
  lockoutSecondsRemaining: number;
  /** Intentos fallidos actuales */
  currentAttempts: number;
  /** Máximo de intentos permitidos */
  maxAttempts: number;
  /** Registra un intento fallido */
  recordFailedAttempt: () => Promise<void>;
  /** Resetea el contador después de login exitoso */
  resetOnSuccess: () => Promise<void>;
  /** Verifica si se puede intentar login */
  canAttemptLogin: () => boolean;
  /** Mensaje de error para mostrar al usuario */
  lockoutMessage: string | null;
}

const DEFAULT_STATE: RateLimitState = {
  attempts: 0,
  lockoutUntil: null,
  lockoutCount: 0,
  lastAttemptAt: null,
};

/**
 * Calcula el tiempo de bloqueo basado en el número de bloqueos previos
 */
function calculateLockoutTime(lockoutCount: number): number {
  const lockoutTime =
    RATE_LIMIT_CONFIG.INITIAL_LOCKOUT_MS *
    Math.pow(RATE_LIMIT_CONFIG.LOCKOUT_MULTIPLIER, lockoutCount);
  return Math.min(lockoutTime, RATE_LIMIT_CONFIG.MAX_LOCKOUT_MS);
}

/**
 * Formatea segundos a texto legible
 */
function formatLockoutTime(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
  return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
}

export function useLoginRateLimit(): UseLoginRateLimitReturn {
  const [state, setState] = useState<RateLimitState>(DEFAULT_STATE);
  const [lockoutSecondsRemaining, setLockoutSecondsRemaining] = useState(0);

  // Cargar estado persistido al montar
  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: RateLimitState = JSON.parse(stored);

          // Verificar si el tiempo de reset de intentos ha pasado
          const now = Date.now();
          if (
            parsed.lastAttemptAt &&
            now - parsed.lastAttemptAt > RATE_LIMIT_CONFIG.ATTEMPT_RESET_MS
          ) {
            // Resetear intentos si ha pasado suficiente tiempo
            await AsyncStorage.removeItem(STORAGE_KEY);
            setState(DEFAULT_STATE);
          } else {
            setState(parsed);
          }
        }
      } catch {
        // Error al cargar, usar estado por defecto
        setState(DEFAULT_STATE);
      }
    };

    loadState();
  }, []);

  // Actualizar contador de tiempo restante
  useEffect(() => {
    if (!state.lockoutUntil) {
      setLockoutSecondsRemaining(0);
      return;
    }

    const lockoutUntil = state.lockoutUntil;

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutSecondsRemaining(remaining);

      // Si el bloqueo expiró, limpiar estado
      if (remaining === 0) {
        setState((prev) => ({
          ...prev,
          lockoutUntil: null,
          attempts: 0, // Resetear intentos después del bloqueo
        }));
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [state.lockoutUntil]);

  const persistState = async (newState: RateLimitState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // Error al persistir, continuar sin guardar
    }
  };

  const recordFailedAttempt = useCallback(async () => {
    const now = Date.now();
    const newAttempts = state.attempts + 1;

    let newState: RateLimitState;

    if (newAttempts >= RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS) {
      // Activar bloqueo
      const lockoutTime = calculateLockoutTime(state.lockoutCount);
      newState = {
        attempts: newAttempts,
        lockoutUntil: now + lockoutTime,
        lockoutCount: state.lockoutCount + 1,
        lastAttemptAt: now,
      };
    } else {
      newState = {
        ...state,
        attempts: newAttempts,
        lastAttemptAt: now,
      };
    }

    setState(newState);
    await persistState(newState);
  }, [state]);

  const resetOnSuccess = useCallback(async () => {
    setState(DEFAULT_STATE);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const canAttemptLogin = useCallback((): boolean => {
    if (state.lockoutUntil && Date.now() < state.lockoutUntil) {
      return false;
    }
    return true;
  }, [state.lockoutUntil]);

  const isLocked = state.lockoutUntil !== null && Date.now() < state.lockoutUntil;

  const lockoutMessage = isLocked
    ? `${SANITIZED_ERROR_MESSAGES.RATE_LIMITED} Intenta de nuevo en ${formatLockoutTime(lockoutSecondsRemaining)}.`
    : null;

  return {
    isLocked,
    lockoutSecondsRemaining,
    currentAttempts: state.attempts,
    maxAttempts: RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS,
    recordFailedAttempt,
    resetOnSuccess,
    canAttemptLogin,
    lockoutMessage,
  };
}
