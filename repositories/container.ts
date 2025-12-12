/**
 * Repository Container
 * 
 * Fábrica que crea los repositorios según la configuración.
 * Si USE_MOCK_API es true, retorna los repositorios mock.
 * Si es false, retorna los repositorios que hacen llamadas HTTP reales.
 * 
 * SEGURIDAD: USE_MOCK_API solo puede ser true en desarrollo (__DEV__).
 * En producción, siempre se usan los repositorios reales.
 */

import { API_CONFIG } from '@/api/config';
import { loggers } from '@/utils/logger';
import { IAuthRepository } from './interfaces/auth.repository.interface';
import { ICardRepository } from './interfaces/card.repository.interface';
import { ITenantRepository } from './interfaces/tenant.repository.interface';
import { MockAuthRepository } from './mock/auth.repository.mock';
import { MockCardRepository } from './mock/card.repository.mock';
import { MockTenantRepository } from './mock/tenant.repository.mock';
import { RealAuthRepository } from './real/auth.repository.real';
import { RealCardRepository } from './real/card.repository.real';
import { RealTenantRepository } from './real/tenant.repository.real';

const log = loggers.api;

/**
 * Verificación de seguridad: detecta si mock se habilitó incorrectamente en producción.
 * Esto no debería ocurrir nunca dado que API_CONFIG.USE_MOCK_API requiere __DEV__.
 */
const validateMockSafety = (): boolean => {
  const useMock = API_CONFIG.USE_MOCK_API;
  
  // Protección redundante: si de alguna manera mock está activo fuera de __DEV__, forzar real
  if (useMock && !__DEV__) {
    log.error(
      '[SECURITY] Mock API was enabled in production build. ' +
      'This should never happen. Forcing real API mode.'
    );
    return false;
  }
  
  return useMock;
};

// Cache del resultado de validación para evitar re-evaluaciones
const shouldUseMock = validateMockSafety();

// Instancias singleton de los repositorios
let cardRepository: ICardRepository | null = null;
let authRepository: IAuthRepository | null = null;
let tenantRepository: ITenantRepository | null = null;

/**
 * Container de repositorios
 * 
 * Proporciona acceso a los repositorios según la configuración.
 * Los repositorios se crean como singletons para evitar crear
 * múltiples instancias innecesarias.
 */
export const RepositoryContainer = {
  /**
   * Obtiene el repositorio de tarjetas
   */
  getCardRepository(): ICardRepository {
    if (!cardRepository) {
      cardRepository = shouldUseMock 
        ? new MockCardRepository() 
        : new RealCardRepository();
    }
    return cardRepository;
  },

  /**
   * Obtiene el repositorio de autenticación
   */
  getAuthRepository(): IAuthRepository {
    if (!authRepository) {
      authRepository = shouldUseMock 
        ? new MockAuthRepository() 
        : new RealAuthRepository();
    }
    return authRepository;
  },

  /**
   * Obtiene el repositorio de tenants
   */
  getTenantRepository(): ITenantRepository {
    if (!tenantRepository) {
      tenantRepository = shouldUseMock
        ? new MockTenantRepository()
        : new RealTenantRepository();
    }
    return tenantRepository;
  },

  /**
   * Limpia todas las instancias de repositorios.
   * Útil para testing o cuando se cambia la configuración en runtime.
   */
  reset(): void {
    cardRepository = null;
    authRepository = null;
    tenantRepository = null;
  },

  /**
   * Indica si estamos usando datos mock.
   * NOTA: En producción esto siempre retorna false.
   */
  isMockMode(): boolean {
    return shouldUseMock;
  },
};

// Acceso directo a los repositorios (shortcuts convenientes)
export const cardRepository$ = () => RepositoryContainer.getCardRepository();
export const authRepository$ = () => RepositoryContainer.getAuthRepository();
