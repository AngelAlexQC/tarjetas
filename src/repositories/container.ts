/**
 * Repository Container
 * 
 * Fábrica que crea los repositorios según la configuración.
 * Si USE_MOCK_API es true, retorna los repositorios mock.
 * Si es false, retorna los repositorios que hacen llamadas HTTP reales.
 */

import { API_CONFIG } from '@/api/config';
import { IAuthRepository } from './interfaces/auth.repository.interface';
import { ICardActionRepository } from './interfaces/card-action.repository.interface';
import { ICardRepository } from './interfaces/card.repository.interface';
import { ITenantRepository } from './interfaces/tenant.repository.interface';
import { MockAuthRepository } from './mock/auth.repository.mock';
import { MockCardActionRepository } from './mock/card-action.repository.mock';
import { MockCardRepository } from './mock/card.repository.mock';
import { MockTenantRepository } from './mock/tenant.repository.mock';
import { RealAuthRepository } from './real/auth.repository.real';
import { RealCardActionRepository } from './real/card-action.repository.real';
import { RealCardRepository } from './real/card.repository.real';
import { RealTenantRepository } from './real/tenant.repository.real';

// Instancias singleton de los repositorios
let cardRepository: ICardRepository | null = null;
let authRepository: IAuthRepository | null = null;
let tenantRepository: ITenantRepository | null = null;
let cardActionRepository: ICardActionRepository | null = null;

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
      cardRepository = API_CONFIG.USE_MOCK_API 
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
      authRepository = API_CONFIG.USE_MOCK_API 
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
      tenantRepository = API_CONFIG.USE_MOCK_API
        ? new MockTenantRepository()
        : new RealTenantRepository();
    }
    return tenantRepository;
  },

  /**
   * Obtiene el repositorio de acciones de tarjeta
   */
  getCardActionRepository(): ICardActionRepository {
    if (!cardActionRepository) {
      cardActionRepository = API_CONFIG.USE_MOCK_API
        ? new MockCardActionRepository()
        : new RealCardActionRepository();
    }
    return cardActionRepository!;
  },

  /**
   * Limpia todas las instancias de repositorios.
   * Útil para testing o cuando se cambia la configuración en runtime.
   */
  reset(): void {
    cardRepository = null;
    authRepository = null;
    tenantRepository = null;
    cardActionRepository = null;
  },

  /**
   * Indica si estamos usando datos mock
   */
  isMockMode(): boolean {
    return API_CONFIG.USE_MOCK_API;
  },
};

// Acceso directo a los repositorios (shortcuts convenientes)
export const cardRepository$ = () => RepositoryContainer.getCardRepository();
export const authRepository$ = () => RepositoryContainer.getAuthRepository();
