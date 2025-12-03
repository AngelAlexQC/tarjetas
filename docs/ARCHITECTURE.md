# Arquitectura y Mejores Prácticas

Este documento describe la arquitectura y patrones utilizados en el proyecto después de la refactorización.

## Estructura del Proyecto

```
financiero/
├── app/                        # Expo Router - Pantallas y navegación
│   ├── (tabs)/                 # Tab navigation
│   │   ├── index.tsx           # Selector de instituciones
│   │   └── cards.tsx           # Lista de tarjetas
│   └── cards/[id]/             # Operaciones de tarjeta (modal)
│       ├── block.tsx
│       ├── defer.tsx
│       └── ...
├── components/                 # Componentes reutilizables
│   ├── cards/                  # Componentes de tarjetas
│   │   ├── operations/         # Componentes de operaciones
│   │   └── insurance/          # Componentes de seguros
│   └── ui/                     # Componentes UI genéricos
├── hooks/                      # Custom hooks
│   ├── cards/                  # Hooks especializados de tarjetas
│   │   ├── use-card-queries.ts     # Lectura de datos
│   │   ├── use-card-mutations.ts   # Escritura de datos
│   │   ├── use-card-defer.ts       # Diferimiento de pagos
│   │   ├── use-card-advance.ts     # Avance de efectivo
│   │   └── use-card-operation.ts   # Hook reutilizable para pantallas
│   └── index.ts
├── repositories/               # Capa de datos
│   ├── interfaces/             # Contratos
│   ├── mock/                   # Implementaciones mock
│   ├── real/                   # Implementaciones HTTP
│   ├── schemas/                # Validación con Zod
│   │   ├── card.schema.ts
│   │   └── auth.schema.ts
│   └── types/                  # Tipos TypeScript
├── contexts/                   # React Contexts
├── constants/                  # Constantes y configuración
├── utils/                      # Utilidades
│   ├── errors.ts               # Sistema de errores tipado
│   └── logger.ts               # Logger centralizado
└── test-utils/                 # Utilidades de testing
```

## Patrones y Principios

### 1. Separación de Responsabilidades (SRP)

Los hooks se dividen por responsabilidad:

```typescript
// ❌ Antes: Un hook gigante con todo
const { fetchCards, blockCard, updateLimits, ... } = useCards();

// ✅ Después: Hooks especializados
const { cards, fetchCards, getCardById } = useCardQueries();
const { blockCard, updateLimits } = useCardMutations();
const { simulateDefer, confirmDefer } = useCardDefer();
```

### 2. Validación con Zod

Los schemas de Zod proporcionan validación en runtime e inferencia de tipos:

```typescript
// repositories/schemas/card.schema.ts
export const CardSchema = z.object({
  id: z.string().min(1),
  cardNumber: z.string(),
  cardHolder: z.string().min(1),
  // ...
});

// El tipo se infiere automáticamente
export type Card = z.infer<typeof CardSchema>;

// Validación en runtime
const result = CardSchema.safeParse(apiResponse);
if (!result.success) {
  throw AppError.validation('Invalid card data', result.error);
}
```

### 3. Sistema de Errores Tipado

```typescript
// utils/errors.ts
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly originalError?: unknown;
  
  static network(message?: string): AppError;
  static validation(message: string, details?: Record<string, unknown>): AppError;
  static fromHttpStatus(status: number, message?: string): AppError;
}

// Uso
try {
  await repository.blockCard(request);
} catch (error) {
  throw AppError.from(error);
}
```

### 4. Hook de Operación Reutilizable

Para pantallas de operaciones de tarjeta:

```typescript
// ❌ Antes: Código repetido en cada pantalla
export default function BlockCardScreen() {
  const { id } = useLocalSearchParams();
  const [card, setCard] = useState();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    getCardById(id).then(setCard);
  }, [id]);
  // ... más boilerplate
}

// ✅ Después: Hook reutilizable
export default function BlockCardScreen() {
  const { 
    card, 
    isLoadingCard, 
    isProcessing, 
    result, 
    executeOperation 
  } = useCardOperation();
  
  const { blockCard } = useCardMutations();
  
  const handleBlock = () => {
    executeOperation(
      () => blockCard({ cardId, type }),
      'Tarjeta Bloqueada',
      { receiptPrefix: 'BLK' }
    );
  };
}
```

### 5. Patrón Repository

```typescript
// Interfaz del contrato
interface ICardRepository {
  getCards(): Promise<Card[]>;
  blockCard(request: BlockCardRequest): Promise<CardActionResult>;
}

// Implementación mock
class MockCardRepository implements ICardRepository {
  async getCards(): Promise<Card[]> {
    await delay(500);
    return MOCK_CARDS;
  }
}

// Implementación real
class RealCardRepository implements ICardRepository {
  async getCards(): Promise<Card[]> {
    return httpClient.get('/cards');
  }
}

// Container que decide cuál usar
const RepositoryContainer = {
  getCardRepository(): ICardRepository {
    return API_CONFIG.USE_MOCK_API 
      ? new MockCardRepository() 
      : new RealCardRepository();
  }
};
```

## Testing

### Estructura de Tests

```
__tests__/
├── card.schema.test.ts     # Tests de validación Zod
├── errors.test.ts          # Tests del sistema de errores
└── use-card-mutations.test.ts  # Tests de hooks
```

### Ejemplo de Test

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useCardMutations } from '../use-card-mutations';

jest.mock('@/repositories', () => ({
  cardRepository$: jest.fn(),
}));

describe('useCardMutations', () => {
  it('should block card successfully', async () => {
    mockRepository.blockCard.mockResolvedValue({
      success: true,
      message: 'Bloqueada',
    });

    const { result } = renderHook(() => useCardMutations());

    await act(async () => {
      await result.current.blockCard({ cardId: '1', type: 'temporary' });
    });

    expect(result.current.error).toBeNull();
  });
});
```

### Test Utilities

```typescript
import { render, createMockCard, createMockCardRepository } from '@test-utils';

// Render con providers
render(<MyComponent />);

// Crear datos mock
const card = createMockCard({ balance: 5000 });
const repo = createMockCardRepository();
```

## Scripts Disponibles

```bash
# Desarrollo
npm start                 # Inicia Expo
npm run android          # Android
npm run ios              # iOS

# Calidad de código
npm run lint             # ESLint
npm run lint:fix         # ESLint con auto-fix
npm run typecheck        # Verificar tipos TypeScript

# Testing
npm test                 # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con cobertura

# Validación completa
npm run validate         # typecheck + lint + test
```

## Próximos Pasos Recomendados

1. **Dividir `cards.tsx`**: El archivo principal de tarjetas sigue siendo grande (~900 líneas). Extraer:
   - `CardCarousel` component
   - `CardFinancialPanel` component
   - Mover estilos a archivo separado

2. **Dividir `_layout.tsx`**: El layout root tiene demasiadas responsabilidades. Crear:
   - `useAuthFlow` hook para manejo de autenticación
   - `NavigationContainer` component

3. **Aumentar cobertura de tests**: Objetivo 80%+
   - Tests de integración para flujos críticos
   - Tests de componentes UI

4. **Agregar Storybook**: Para desarrollo de componentes aislados

5. **Implementar E2E tests**: Con Maestro o Detox
