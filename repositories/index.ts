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
export type { IAuthRepository, ICardRepository } from './interfaces';

// Tipos
export * from './types';
