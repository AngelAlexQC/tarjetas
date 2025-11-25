/**
 * Repository Container
 * 
 * Fábrica que crea los repositorios según la configuración.
 * Si USE_MOCK_API es true, retorna los repositorios mock.
 * Si es false, retorna los repositorios que hacen llamadas HTTP reales.
 */

import { API_CONFIG } from '@/api/config';
import { IAuthRepository, ICardRepository } from './interfaces';
import { MockAuthRepository, MockCardRepository } from './mock';
import { RealAuthRepository, RealCardRepository } from './real';

// Instancias singleton de los repositorios
let cardRepository: ICardRepository | null = null;
let authRepository: IAuthRepository | null = null;

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
   * Limpia todas las instancias de repositorios.
   * Útil para testing o cuando se cambia la configuración en runtime.
   */
  reset(): void {
    cardRepository = null;
    authRepository = null;
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
