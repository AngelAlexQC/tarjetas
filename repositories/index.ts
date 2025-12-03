/**
 * Repositories Module Index
 * 
 * Punto de entrada principal para el sistema de repositorios.
 * 
 * USO:
 * ```typescript
 * import { cardRepository$, authRepository$ } from '@/repositories';
 * 
 * // Obtener tarjetas
 * const cards = await cardRepository$().getCards();
 * 
 * // Login
 * const result = await authRepository$().login({ username, password });
 * ```
 * 
 * CONFIGURACIÓN:
 * Edita `api/config.ts` y cambia `USE_MOCK_API` a `false` para
 * usar el backend real en lugar de datos mock.
 */

// Container y accesos directos
export { RepositoryContainer, authRepository$, cardRepository$ } from './container';

// Interfaces (para typing)
export type { IAuthRepository } from './interfaces/auth.repository.interface';
export type { ICardRepository } from './interfaces/card.repository.interface';

// Tipos legacy (del código existente - se mantienen por compatibilidad)
export * from './types/card.types';
export * from './types/auth.types';
