# Sistema de Repositorios - Documentación

## Descripción General

Este proyecto implementa el **patrón Repository** con **inyección de dependencias** para manejar todas las operaciones HTTP. Esto permite alternar fácilmente entre datos mock (para desarrollo) y llamadas reales al backend (para producción).

## Estructura de Archivos

```
├── api/
│   ├── config.ts          # Configuración central (USE_MOCK_API, endpoints)
│   ├── http-client.ts     # Cliente HTTP para llamadas reales
│   └── index.ts           # Exportaciones del módulo API
│
├── repositories/
│   ├── types/             # Tipos TypeScript compartidos
│   │   ├── card.types.ts
│   │   ├── auth.types.ts
│   │   └── index.ts
│   │
│   ├── interfaces/        # Contratos/Interfaces de repositorios
│   │   ├── card.repository.interface.ts
│   │   ├── auth.repository.interface.ts
│   │   └── index.ts
│   │
│   ├── mock/              # Implementaciones con datos mock
│   │   ├── card.repository.mock.ts
│   │   ├── auth.repository.mock.ts
│   │   └── index.ts
│   │
│   ├── real/              # Implementaciones con HTTP real
│   │   ├── card.repository.real.ts
│   │   ├── auth.repository.real.ts
│   │   └── index.ts
│   │
│   ├── container.ts       # Fábrica que decide qué implementación usar
│   └── index.ts           # Exportaciones principales
│
└── hooks/
    └── use-cards.ts       # Hook React para operaciones de tarjetas
```

## Configuración

### Cambiar entre Mock y Real

Edita `api/config.ts`:

```typescript
export const API_CONFIG = {
  // Cambia a false para usar el backend real
  USE_MOCK_API: true,
  
  // URL del backend
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://api.production.com/api',
  
  // Delay para simular latencia en mock
  MOCK_DELAY: 800,
};
```

## Uso

### Opción 1: Usar el Hook (Recomendado para componentes React)

```typescript
import { useCards } from '@/hooks/use-cards';

function MyComponent() {
  const { 
    cards, 
    isLoading, 
    error,
    fetchCards,
    blockCard,
    getLimits,
    // ... más funciones
  } = useCards();

  useEffect(() => {
    fetchCards();
  }, []);

  const handleBlock = async () => {
    const result = await blockCard({ 
      cardId: '123', 
      type: 'temporary' 
    });
    if (result.success) {
      console.log('Tarjeta bloqueada');
    }
  };

  return (
    // tu JSX
  );
}
```

### Opción 2: Acceso Directo al Repositorio

```typescript
import { cardRepository$ } from '@/repositories';

// En cualquier lugar de tu código
async function someFunction() {
  const repository = cardRepository$();
  
  const cards = await repository.getCards();
  const limits = await repository.getLimits('card-123');
}
```

### ~~Opción 3: Compatibilidad Legacy (cardService)~~ DEPRECADA

> ⚠️ **DEPRECADO**: `cardService` está en proceso de eliminación. Usa `useCards()` o `cardRepository$()` en su lugar.

```typescript
// ❌ NO USAR - Será eliminado
import { cardService } from '@/features/cards/services/card-service';
const cards = cardService.getCards();

// ✅ USAR ESTO
import { useCards } from '@/hooks/use-cards';
const { cards, fetchCards } = useCards({ autoFetch: true });
```

## Agregar Nuevos Endpoints

### 1. Agregar el endpoint en `api/config.ts`:

```typescript
export const API_ENDPOINTS = {
  // ...existentes
  NUEVO: {
    LISTA: '/nuevo/lista',
    DETALLE: (id: string) => `/nuevo/${id}`,
  },
};
```

### 2. Crear tipos en `repositories/types/`:

```typescript
// repositories/types/nuevo.types.ts
export interface NuevoItem {
  id: string;
  nombre: string;
}
```

### 3. Crear la interfaz del repositorio:

```typescript
// repositories/interfaces/nuevo.repository.interface.ts
export interface INuevoRepository {
  getItems(): Promise<NuevoItem[]>;
  getById(id: string): Promise<NuevoItem>;
}
```

### 4. Implementar Mock y Real:

```typescript
// repositories/mock/nuevo.repository.mock.ts
export class MockNuevoRepository implements INuevoRepository {
  async getItems() {
    await delay();
    return MOCK_DATA;
  }
}

// repositories/real/nuevo.repository.real.ts
export class RealNuevoRepository implements INuevoRepository {
  async getItems() {
    const response = await httpClient.get(API_ENDPOINTS.NUEVO.LISTA);
    return response.data;
  }
}
```

### 5. Registrar en el Container:

```typescript
// repositories/container.ts
export const RepositoryContainer = {
  // ...existentes
  getNuevoRepository(): INuevoRepository {
    return API_CONFIG.USE_MOCK_API 
      ? new MockNuevoRepository() 
      : new RealNuevoRepository();
  },
};
```

## Ventajas de Esta Arquitectura

1. **Desarrollo Independiente**: Puedes desarrollar features sin esperar al backend
2. **Testing Fácil**: Mock data lista para pruebas
3. **Cambio Simple**: Una sola configuración para cambiar de mock a real
4. **Type Safety**: TypeScript en toda la cadena
5. **Separación de Responsabilidades**: UI ↔ Hooks ↔ Repository ↔ API
6. **Mantenibilidad**: Código organizado y fácil de encontrar

## Buenas Prácticas

1. **Nunca hacer fetch directo en componentes** - Usa los hooks o repositorios
2. **Mantener sincronizados Mock y Real** - Mismos tipos y estructura de respuesta
3. **Mock realista** - Incluir delays y errores simulados
4. **Tipos compartidos** - Usar los tipos de `repositories/types/`
