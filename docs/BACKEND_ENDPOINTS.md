# Endpoints Requeridos para el Backend

## Resumen Ejecutivo

Este documento detalla todos los endpoints que el backend debe implementar para que la aplicación financiera multi-tenant funcione completamente. La aplicación actualmente usa datos mock (configurado en `api/config.ts` con `USE_MOCK_API: true`).

> **Nota**: Los tipos TypeScript aquí documentados corresponden exactamente a los esquemas Zod definidos en `repositories/schemas/`. Cualquier cambio en los endpoints debe reflejarse también en dichos esquemas.

## Configuración Base

**Base URL**: Configurable mediante variables de entorno
- Desarrollo: `EXPO_PUBLIC_API_URL_DEV` (default: `http://localhost:3000/api`)
- Producción: `EXPO_PUBLIC_API_URL`

**Headers por defecto**:
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Timeout**: 30 segundos (configurable en `API_CONFIG.TIMEOUT`)

## Formato de Respuesta Estándar

Todas las respuestas de la API deben seguir este formato:

```typescript
// Respuesta exitosa
{
  success: true;
  data: T; // Los datos solicitados
  message?: string;
}

// Respuesta de error
{
  success: false;
  error: string;
  statusCode: number;
}
```

El cliente HTTP extrae automáticamente `response.data` o `response` completo si no hay `data`.

---

## 1. Autenticación y Usuario

### 1.1 Login
**Endpoint**: `POST /auth/login`  
**Headers**: Sin autenticación (`skipAuth: true`)  
**Body**:
```typescript
{
  username: string; // Mínimo 1 carácter
  password: string; // Mínimo 1 carácter
}
```
**Response** (data extraído):
```typescript
{
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    username: string;
    email?: string; // Debe ser email válido si se proporciona
    name?: string;
    fullName?: string;
    phone?: string;
    avatar?: string; // Debe ser URL válida si se proporciona
    clientNumber?: string;
    documentId?: string;
  };
  expiresAt?: string; // ISO 8601 datetime
}
```

> **Validación Zod**: Ver `LoginResponseSchema` en `repositories/schemas/auth.schema.ts`

### 1.2 Logout
**Endpoint**: `POST /auth/logout`  
**Headers**: Requiere autenticación  
**Response**: HTTP 204 (sin contenido) o:
```typescript
{
  success: boolean;
  message?: string;
}
```

### 1.3 Refresh Token
**Endpoint**: `POST /auth/refresh`  
**Headers**: Requiere autenticación  
**Response** (data extraído):
```typescript
{
  token: string;
  refreshToken?: string;
}
```

> **Validación Zod**: Ver `RefreshTokenResponseSchema`

### 1.4 Obtener Usuario Actual
**Endpoint**: `GET /auth/me`  
**Headers**: Requiere autenticación  
**Response** (data extraído):
```typescript
{
  id: string;
  username: string;
  email?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  avatar?: string; // URL válida
  clientNumber?: string;
  documentId?: string;
}
```

> **Nota**: Retorna `null` si no hay usuario autenticado.

### 1.5 Actualizar Perfil
**Endpoint**: `PUT /user/profile`  
**Headers**: Requiere autenticación  
**Body** (campos opcionales):
```typescript
{
  name?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}
```
**Response** (data extraído): Objeto `User` completo actualizado.

---

## 2. Tarjetas - Operaciones Básicas

### 2.1 Listar Tarjetas
**Endpoint**: `GET /cards`  
**Headers**: Requiere autenticación  
**Response** (data extraído):
```typescript
Array<{
  id: string; // Requerido, mínimo 1 carácter
  cardNumber: string; // Formato recomendado: "4532 1234 5678 9010"
  cardHolder: string; // Requerido, mínimo 1 carácter
  expiryDate: string; // Formato OBLIGATORIO: "MM/YY" (regex: /^\d{2}\/\d{2}$/)
  balance: number;
  cardType: 'credit' | 'debit' | 'virtual';
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'maestro' | 'unionpay';
  status: 'active' | 'blocked' | 'expired' | 'pending';
  creditLimit?: number; // Solo positivos
  availableCredit?: number;
  lastTransactionDate?: string; // ISO 8601 datetime
}>
```

> **Validación Zod**: Ver `CardSchema` y `CardArraySchema` en `repositories/schemas/card.schema.ts`

### 2.2 Obtener Tarjeta por ID
**Endpoint**: `GET /cards/:id`  
**Headers**: Requiere autenticación  
**Response** (data extraído): Objeto `Card` o `undefined` si no existe.

---

## 3. Bloqueo y Desbloqueo

### 3.1 Bloquear Tarjeta
**Endpoint**: `POST /cards/:id/block`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  cardId: string; // Requerido, mínimo 1 carácter
  type: 'temporary' | 'permanent';
  reason?: 'lost' | 'stolen' | 'damaged' | 'fraud' | 'temporary';
  comments?: string;
}
```
**Response** (data extraído):
```typescript
{
  success: boolean;
  message: string;
  data?: unknown;
}
```

> **Validación Zod**: Ver `BlockCardRequestSchema` y `CardActionResultSchema`

### 3.2 Desbloquear Tarjeta
**Endpoint**: `POST /cards/:id/unblock`  
**Headers**: Requiere autenticación  
**Response**: Mismo formato `CardActionResult`.

---

## 4. Diferimiento de Pagos

### 4.1 Obtener Transacciones Diferibles
**Endpoint**: `GET /cards/:id/defer/transactions`  
**Headers**: Requiere autenticación  
**Response** (data extraído):
```typescript
Array<{
  id: string; // Requerido
  date: string;
  description: string;
  amount: number;
  currency: string; // Exactamente 3 caracteres (ISO 4217)
  category: string;
  type?: 'purchase' | 'payment' | 'transfer' | 'fee';
  canDefer?: boolean;
}>
```

> **Validación Zod**: Ver `TransactionSchema` y `TransactionArraySchema`

### 4.2 Simular Diferimiento
**Endpoint**: `POST /cards/:id/defer/simulate`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  amount: number; // Positivo
  months: number; // Entero positivo
}
```
**Response** (data extraído):
```typescript
{
  originalAmount: number; // Positivo
  months: number; // Entero positivo
  interestRate: number; // >= 0
  monthlyFee: number; // Positivo
  totalWithInterest: number; // Positivo
  firstPaymentDate: string;
}
```

> **Validación Zod**: Ver `DeferSimulationSchema`

### 4.3 Diferir Pago
**Endpoint**: `POST /cards/:id/defer`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  cardId: string;
  transactionIds: string[]; // Mínimo 1 elemento
  months: number; // Entero positivo
}
```
**Response**: Formato `CardActionResult`.

---

## 5. Avances de Efectivo

### 5.1 Obtener Cuentas de Destino
**Endpoint**: `GET /accounts`  
**Headers**: Requiere autenticación  
**Response** (data extraído):
```typescript
Array<{
  id: string;
  type: 'savings' | 'checking';
  number: string;
  alias: string;
  bankName: string;
}>
```

> **Validación Zod**: Ver `AccountSchema` y `AccountArraySchema`
> 
> **Nota**: Este endpoint NO está definido en `API_ENDPOINTS` pero se usa directamente como `/accounts` en `RealCardRepository`.

### 5.2 Solicitar Avance de Efectivo
**Endpoint**: `POST /cards/:id/advance`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  cardId: string;
  amount: number; // Positivo
  months: number; // Entero positivo
  destinationAccountId: string;
}
```
**Response**: Formato `CardActionResult`. Puede incluir data adicional:
```typescript
{
  success: boolean;
  message: string;
  data?: {
    fee: string;
    total: string;
    transactionId: string;
  };
}
```

> **Validación Zod**: Ver `CashAdvanceRequestSchema` y `CashAdvanceResultSchema`

---

## 6. Límites de Transacciones

### 6.1 Obtener Límites
**Endpoint**: `GET /cards/:id/limits`  
**Headers**: Requiere autenticación  
**Response** (data extraído):
```typescript
{
  // Límites actuales (todos >= 0)
  dailyPurchase: number;
  dailyAtm: number;
  dailyOnline: number;
  monthlyPurchase: number;
  onlinePurchase: number;
  internationalPurchase: number;
  perTransaction?: number;
  
  // Límites máximos para UI (positivos, opcionales)
  maxDailyPurchase?: number;
  maxDailyAtm?: number;
  maxDailyOnline?: number;
  maxMonthlyPurchase?: number;
  maxOnlinePurchase?: number;
  maxInternationalPurchase?: number;
  
  // Específicos para tarjetas de crédito
  creditLimit?: number; // Positivo
  availableCredit?: number;
  cashAdvanceLimit?: number; // Positivo
  availableCashAdvance?: number;
}
```

> **Validación Zod**: Ver `CardLimitsSchema`
> 
> **Nota**: Los nombres de campos difieren de versiones anteriores. Usar `dailyPurchase` en lugar de `dailyPos`.

### 6.2 Actualizar Límites
**Endpoint**: `PUT /cards/:id/limits`  
**Headers**: Requiere autenticación  
**Body** (campos parciales permitidos):
```typescript
{
  dailyPurchase?: number;
  dailyAtm?: number;
  dailyOnline?: number;
  monthlyPurchase?: number;
  onlinePurchase?: number;
  internationalPurchase?: number;
  perTransaction?: number;
}
```
**Response**: Formato `CardActionResult`.

---

## 7. Cambio de PIN

### 7.1 Cambiar PIN
**Endpoint**: `POST /cards/:id/pin`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  cardId: string;
  newPin: string; // Exactamente 4 dígitos (regex: /^\d{4}$/)
  currentPin?: string; // 4 dígitos si se requiere verificación
  confirmPin?: string; // Debe coincidir con newPin si se proporciona
}
```
**Response**: Formato `CardActionResult`.

> **Validación Zod**: Ver `ChangePinRequestSchema` - incluye validación de que `newPin === confirmPin`

---

## 8. Estado de Cuenta

### 8.1 Obtener Estado de Cuenta
**Endpoint**: `GET /cards/:id/statement?month={month}&year={year}`  
**Headers**: Requiere autenticación  
**Query Params**:
- `month` (opcional): Número del mes (1-12)
- `year` (opcional): Año (YYYY)

**Response** (data extraído):
```typescript
{
  id?: string;
  period?: string;
  periodStart?: string;
  periodEnd?: string;
  dueDate: string; // Requerido
  minimumPayment?: number; // >= 0
  totalPayment?: number; // >= 0
  previousBalance?: number;
  payments?: number;
  purchases?: number;
  fees?: number;
  interest?: number;
  newBalance?: number;
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
  }>;
  pdfUrl?: string; // URL válida para descargar PDF
}
```

> **Validación Zod**: Ver `StatementSchema` y `StatementTransactionSchema`

---

## 9. Aviso de Viaje

### 9.1 Crear Aviso de Viaje
**Endpoint**: `POST /cards/:id/travel-notice`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  cardId: string;
  destination?: string; // Un destino único
  destinations?: string[]; // O múltiples destinos (mínimo 1)
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  contactPhone?: string;
}
```
**Response**: Formato `CardActionResult`.

> **Validación Zod**: Ver `TravelNoticeSchema` - soporta `destination` (string) o `destinations` (array)

---

## 10. Reemplazo de Tarjeta

### 10.1 Solicitar Reemplazo
**Endpoint**: `POST /cards/:id/replace`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  cardId: string;
  reason: 'damaged' | 'lost' | 'stolen' | 'expired';
  deliveryAddress?: string | {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}
```
**Response**: Formato `CardActionResult`.

> **Validación Zod**: Ver `ReplaceCardRequestSchema` - `deliveryAddress` puede ser string o objeto estructurado

---

## 11. Suscripciones

### 11.1 Obtener Suscripciones
**Endpoint**: `GET /cards/:id/subscriptions`  
**Headers**: Requiere autenticación  
**Response** (data extraído):
```typescript
Array<{
  id: string;
  name: string;
  merchant?: string;
  plan?: string;
  amount: number; // Positivo
  currency: string;
  frequency?: 'weekly' | 'monthly' | 'yearly';
  nextBillingDate?: string;
  status?: 'active' | 'paused' | 'cancelled';
  category: 'entertainment' | 'software' | 'shopping' | 'utilities' | 'other';
  logoUrl?: string; // URL válida
}>
```

> **Validación Zod**: Ver `SubscriptionSchema` y `SubscriptionArraySchema`

### 11.2 Activar/Pausar Suscripción
**Endpoint**: `POST /cards/:id/subscriptions/:subscriptionId/toggle`  
**Headers**: Requiere autenticación  
**Response**: Formato `CardActionResult`.

---

## 12. Recompensas

### 12.1 Obtener Recompensas
**Endpoint**: `GET /cards/:id/rewards`  
**Headers**: Requiere autenticación  
**Response** (data extraído):
```typescript
{
  totalPoints: number; // >= 0
  pendingPoints?: number; // >= 0
  redeemedPoints?: number; // >= 0
  expiringPoints?: number; // >= 0
  expirationDate?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextTierPoints?: number; // Positivo
  history?: Array<{
    id: string | number;
    description: string;
    points: number;
    date: string;
  }>;
}
```

> **Validación Zod**: Ver `RewardsSchema` y `RewardHistorySchema`

---

## 13. CVV Dinámico

### 13.1 Generar CVV Dinámico
**Endpoint**: `POST /cards/:id/cvv`  
**Headers**: Requiere autenticación  
**Response** (data extraído):
```typescript
{
  cvv: string; // 3 o 4 dígitos (regex: /^\d{3,4}$/)
  expiresAt?: string; // ISO 8601 datetime
  expiresIn?: number; // Segundos hasta expiración (entero positivo)
  remainingSeconds?: number; // Segundos restantes (entero positivo)
}
```

> **Validación Zod**: Ver `DynamicCvvSchema`
> 
> **Recomendación**: Incluir al menos uno de `expiresAt`, `expiresIn` o `remainingSeconds` para que el cliente pueda mostrar countdown.

---

## 14. Configuración de Notificaciones

### 14.1 Actualizar Configuración de Notificaciones
**Endpoint**: `PUT /cards/:id/notifications`  
**Headers**: Requiere autenticación  
**Body** (todos los campos opcionales):
```typescript
{
  purchases?: boolean;
  payments?: boolean;
  lowBalance?: boolean;
  security?: boolean;
  marketing?: boolean;
  transactionAlerts?: boolean;
  paymentReminders?: boolean;
  securityAlerts?: boolean;
  threshold?: number; // >= 0, para alertas de saldo bajo
}
```
**Response**: Formato `CardActionResult`.

> **Validación Zod**: Ver `NotificationSettingsSchema`

---

## 15. Funcionalidades Pendientes de Implementación

Las siguientes funcionalidades están presentes en la interfaz de usuario pero **NO tienen repositorio/endpoints implementados** actualmente. Deberán ser agregadas:

### 15.1 Pago de Tarjeta
**Endpoint propuesto**: `POST /cards/:id/payment`  
**Descripción**: Permite pagar la tarjeta desde una cuenta bancaria vinculada
**Body**:
```typescript
{
  cardId: string;
  amount: number;
  sourceAccountId: string;
  paymentType: 'total' | 'minimum' | 'other';
}
```
**Response**: Formato `CardActionResult` con data de confirmación.

### 15.2 Retiro sin Tarjeta (Cardless ATM)
**Endpoint propuesto**: `POST /cards/:id/cardless-withdrawal`  
**Descripción**: Genera un código temporal para retiro en cajero sin tarjeta física
**Body**:
```typescript
{
  cardId: string;
  amount: number;
}
```
**Response**:
```typescript
{
  success: boolean;
  message: string;
  data: {
    code: string; // Código de 6-8 dígitos
    expiresIn: number; // Segundos (típicamente 1800 = 30 min)
    expiresAt: string; // ISO 8601
  };
}
```

### 15.3 Configuración de Canales
**Endpoint propuesto**: `PUT /cards/:id/channels`  
**Descripción**: Habilitar/deshabilitar canales de uso (online, internacional, ATM, contactless)
**Body**:
```typescript
{
  online?: boolean;
  international?: boolean;
  atm?: boolean;
  contactless?: boolean;
}
```
**Response**: Formato `CardActionResult`.

### 15.4 Seguros
**Endpoints propuestos**:
- `GET /cards/:id/insurance/available` - Listar seguros disponibles
- `POST /cards/:id/insurance` - Contratar un seguro
- `GET /cards/:id/insurance` - Obtener seguros contratados
- `DELETE /cards/:id/insurance/:insuranceId` - Cancelar seguro

**Tipos de seguros sugeridos**:
- Seguro de Vida de Crédito
- Seguro contra Fraude
- Seguro de Desempleo
- Seguro de Accidentes en Viajes
- Seguro de Incapacidad
- Seguro de Protección de Compras
- Seguro contra Robo
- Asistencia en Viajes

> **Nota**: Estos endpoints deberán tener sus propios esquemas Zod cuando se implementen.

---

## Consideraciones de Implementación

### Autenticación
- Todos los endpoints (excepto `/auth/login`) requieren un token JWT válido
- El token debe enviarse en el header `Authorization: Bearer {token}`
- Los tokens son almacenados de forma segura por el cliente:
  - **iOS/Android**: `expo-secure-store` (ver `utils/auth-storage.ts`)
  - **Web**: `AsyncStorage` como fallback

### Formato de Respuesta HTTP

El cliente HTTP (`api/http-client.ts`) procesa las respuestas así:

```typescript
// Si response.ok (2xx):
{
  success: true,
  data: response.data ?? response, // Extrae .data si existe
  message: response.message,
  statusCode: number
}

// Si error:
{
  success: false,
  error: response.message || response.error || 'Error del servidor',
  statusCode: number
}

// HTTP 204:
{ success: true, statusCode: 204 }
```

### Manejo de Errores
Todos los endpoints deben retornar errores en el siguiente formato:
```typescript
{
  success: false;
  error: string; // Mensaje descriptivo del error
  message?: string; // Alternativa a error
  statusCode?: number;
}
```

### Códigos HTTP Comunes
- `200`: Operación exitosa
- `201`: Recurso creado
- `204`: Sin contenido (logout exitoso, eliminaciones)
- `400`: Solicitud incorrecta (validación fallida)
- `401`: No autenticado (token inválido o expirado)
- `403`: No autorizado (sin permisos)
- `404`: Recurso no encontrado
- `408`: Timeout de solicitud
- `422`: Error de validación (datos inválidos)
- `500`: Error interno del servidor

### Multi-Tenant
La aplicación soporta múltiples instituciones financieras (tenants):
- Banco Pichincha
- Cooperativa Chone
- Diners Club
- Bancolombia
- Davivienda
- BBVA

El backend debe identificar el tenant mediante uno de estos métodos:
1. **Subdomain** (recomendado): `pichincha.app.com`
2. **Header personalizado**: `X-Tenant-ID: pichincha`
3. **Claim en JWT**: `{ "tenantId": "pichincha", ... }`

> Ver `constants/tenant-themes.ts` para la lista completa de tenants y sus configuraciones visuales.

### Seguridad
1. **Operaciones sensibles** (bloqueo, cambio PIN, pagos) deben requerir confirmación adicional del cliente (biometría o PIN)
2. **Rate limiting** para prevenir abuso (sugerido: 100 req/min por usuario)
3. **Cifrado** de datos sensibles (PINs, CVVs) - nunca almacenar en texto plano
4. **Logs de auditoría** para todas las operaciones críticas
5. **Validación** de todos los inputs con los esquemas Zod correspondientes

### Validación con Zod
El frontend valida todas las respuestas con Zod (`utils/api-validation.ts`). Esto significa:
- Si faltan campos requeridos, el frontend lanzará error
- Si los tipos no coinciden, el frontend lanzará error
- Los campos opcionales pueden omitirse sin problema

Ejemplo de error de validación Zod:
```
API Validation Error (lista de tarjetas): [
  { path: ["0", "expiryDate"], message: "Format must be MM/YY" }
]
```

### Testing
Se recomienda:
1. Crear un ambiente de sandbox con datos de prueba
2. Usar el modo mock de la app (`USE_MOCK_API: true`) durante desarrollo
3. Implementar endpoints de testing solo disponibles en desarrollo
4. Revisar los mocks en `repositories/mock/` como referencia de datos esperados

---

## Cómo Cambiar a Backend Real

En `api/config.ts`, cambiar:
```typescript
USE_MOCK_API: false
```

Y configurar las variables de entorno en `.env`:
```env
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000/api
EXPO_PUBLIC_API_URL=https://api.produccion.com/api
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción | Sección |
|--------|----------|-------------|---------|
| POST | `/auth/login` | Iniciar sesión | 1.1 |
| POST | `/auth/logout` | Cerrar sesión | 1.2 |
| POST | `/auth/refresh` | Refrescar token | 1.3 |
| GET | `/auth/me` | Obtener usuario actual | 1.4 |
| PUT | `/user/profile` | Actualizar perfil | 1.5 |
| GET | `/cards` | Listar tarjetas | 2.1 |
| GET | `/cards/:id` | Obtener tarjeta | 2.2 |
| POST | `/cards/:id/block` | Bloquear tarjeta | 3.1 |
| POST | `/cards/:id/unblock` | Desbloquear tarjeta | 3.2 |
| GET | `/cards/:id/defer/transactions` | Transacciones diferibles | 4.1 |
| POST | `/cards/:id/defer/simulate` | Simular diferimiento | 4.2 |
| POST | `/cards/:id/defer` | Diferir pago | 4.3 |
| GET | `/accounts` | Cuentas destino | 5.1 |
| POST | `/cards/:id/advance` | Avance efectivo | 5.2 |
| GET | `/cards/:id/limits` | Obtener límites | 6.1 |
| PUT | `/cards/:id/limits` | Actualizar límites | 6.2 |
| POST | `/cards/:id/pin` | Cambiar PIN | 7.1 |
| GET | `/cards/:id/statement` | Estado de cuenta | 8.1 |
| POST | `/cards/:id/travel-notice` | Aviso de viaje | 9.1 |
| POST | `/cards/:id/replace` | Reemplazo tarjeta | 10.1 |
| GET | `/cards/:id/subscriptions` | Listar suscripciones | 11.1 |
| POST | `/cards/:id/subscriptions/:id/toggle` | Toggle suscripción | 11.2 |
| GET | `/cards/:id/rewards` | Obtener recompensas | 12.1 |
| POST | `/cards/:id/cvv` | CVV dinámico | 13.1 |
| PUT | `/cards/:id/notifications` | Config notificaciones | 14.1 |

---

## Priorización Sugerida

### Fase 1 - Funcionalidad Básica (MVP)
1. ✅ Autenticación (Login, Logout, Refresh Token, Get User)
2. ✅ Listar Tarjetas
3. ✅ Obtener Tarjeta por ID
4. ✅ Bloquear/Desbloquear Tarjeta

### Fase 2 - Operaciones Principales
5. ✅ Estado de Cuenta
6. ✅ Límites (Get/Update)
7. ✅ Cambio de PIN
8. ✅ Avance de Efectivo

### Fase 3 - Funcionalidades Avanzadas
9. ✅ Diferimiento de Pagos
10. ✅ Suscripciones
11. ✅ Aviso de Viaje
12. ✅ Recompensas

### Fase 4 - Funcionalidades Premium
13. ✅ CVV Dinámico
14. ✅ Reemplazo de Tarjeta
15. ✅ Configuración de Notificaciones
16. ⏳ Pago de Tarjeta (pendiente)
17. ⏳ Retiro sin Tarjeta (pendiente)
18. ⏳ Configuración de Canales (pendiente)
19. ⏳ Seguros (pendiente)

> ✅ = Interfaz de repositorio definida | ⏳ = Solo propuesta, sin implementar

---

## Archivos de Referencia

Para implementar el backend correctamente, revisar:

| Archivo | Descripción |
|---------|-------------|
| `repositories/interfaces/auth.repository.interface.ts` | Contrato de autenticación |
| `repositories/interfaces/card.repository.interface.ts` | Contrato de tarjetas |
| `repositories/schemas/auth.schema.ts` | Esquemas Zod de autenticación |
| `repositories/schemas/card.schema.ts` | Esquemas Zod de tarjetas |
| `repositories/real/auth.repository.real.ts` | Implementación HTTP de auth |
| `repositories/real/card.repository.real.ts` | Implementación HTTP de cards |
| `repositories/mock/auth.repository.mock.ts` | Datos mock de auth |
| `repositories/mock/card.repository.mock.ts` | Datos mock de cards |
| `api/http-client.ts` | Cliente HTTP centralizado |
| `api/config.ts` | Configuración de API y endpoints |
| `utils/api-validation.ts` | Utilidades de validación Zod |

---

*Última actualización: Diciembre 2025*
