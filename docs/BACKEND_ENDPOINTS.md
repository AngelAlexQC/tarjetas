# Endpoints Requeridos para el Backend

## Resumen Ejecutivo

Este documento detalla todos los endpoints que el backend debe implementar para que la aplicación financiera multi-tenant funcione completamente. La aplicación actualmente usa datos mock (configurado en `api/config.ts` con `USE_MOCK_API: true`).

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

**Timeout**: 30 segundos

---

## 1. Autenticación y Usuario

### 1.1 Login
**Endpoint**: `POST /auth/login`  
**Headers**: Sin autenticación (`skipAuth: true`)  
**Body**:
```typescript
{
  username: string;
  password: string;
}
```
**Response**:
```typescript
{
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      name: string;
      fullName?: string;
      phone?: string;
      avatar?: string;
      clientNumber?: string;
      documentId?: string;
    };
    token: string;
    refreshToken?: string;
  };
}
```

### 1.2 Logout
**Endpoint**: `POST /auth/logout`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  message?: string;
}
```

### 1.3 Refresh Token
**Endpoint**: `POST /auth/refresh`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  data: {
    token: string;
    refreshToken?: string;
  };
}
```

### 1.4 Obtener Usuario Actual
**Endpoint**: `GET /auth/me`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    name: string;
    fullName?: string;
    phone?: string;
    avatar?: string;
    clientNumber?: string;
    documentId?: string;
  };
}
```

### 1.5 Actualizar Perfil
**Endpoint**: `PUT /user/profile`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  name?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}
```
**Response**:
```typescript
{
  success: boolean;
  data: User; // Usuario actualizado
}
```

---

## 2. Tarjetas - Operaciones Básicas

### 2.1 Listar Tarjetas
**Endpoint**: `GET /cards`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    cardNumber: string; // Formato: "4532 1234 5678 9010"
    cardHolder: string;
    expiryDate: string; // Formato: "MM/YY"
    balance: number;
    cardType: 'credit' | 'debit' | 'virtual';
    cardBrand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'maestro' | 'unionpay';
    status: 'active' | 'blocked' | 'expired' | 'pending';
    creditLimit?: number;
    availableCredit?: number;
    lastTransactionDate?: string;
  }>;
}
```

### 2.2 Obtener Tarjeta por ID
**Endpoint**: `GET /cards/:id`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  data: Card; // Objeto completo de tarjeta
}
```

---

## 3. Bloqueo y Desbloqueo

### 3.1 Bloquear Tarjeta
**Endpoint**: `POST /cards/:id/block`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  type: 'temporary' | 'permanent';
  reason?: 'lost' | 'stolen' | 'damaged' | 'fraud' | 'temporary';
  comments?: string;
}
```
**Response**:
```typescript
{
  success: boolean;
  message: string;
  data?: any;
}
```

### 3.2 Desbloquear Tarjeta
**Endpoint**: `POST /cards/:id/unblock`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 4. Diferimiento de Pagos

### 4.1 Obtener Transacciones Diferibles
**Endpoint**: `GET /cards/:id/defer/transactions`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    currency: string;
    category: string;
    type?: 'purchase' | 'payment' | 'transfer' | 'fee';
    canDefer?: boolean;
  }>;
}
```

### 4.2 Simular Diferimiento
**Endpoint**: `POST /cards/:id/defer/simulate`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  amount: number;
  months: number;
}
```
**Response**:
```typescript
{
  success: boolean;
  data: {
    originalAmount: number;
    months: number;
    interestRate: number;
    monthlyFee: number;
    totalWithInterest: number;
    firstPaymentDate: string;
  };
}
```

### 4.3 Diferir Pago
**Endpoint**: `POST /cards/:id/defer`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  transactionIds: string[];
  months: number;
}
```
**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 5. Avances de Efectivo

### 5.1 Obtener Cuentas de Destino
**Endpoint**: `GET /accounts`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    type: 'savings' | 'checking';
    number: string;
    alias: string;
    bankName: string;
  }>;
}
```

### 5.2 Solicitar Avance de Efectivo
**Endpoint**: `POST /cards/:id/advance`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  amount: number;
  months: number;
  destinationAccountId: string;
}
```
**Response**:
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

---

## 6. Límites de Transacciones

### 6.1 Obtener Límites
**Endpoint**: `GET /cards/:id/limits`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  data: {
    dailyAtm: number;
    dailyPos: number;
    dailyOnline: number;
    monthlyTotal: number;
    perTransaction: number;
    creditLimit?: number;
    availableCredit?: number;
    cashAdvanceLimit?: number;
    availableCashAdvance?: number;
  };
}
```

### 6.2 Actualizar Límites
**Endpoint**: `PUT /cards/:id/limits`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  dailyAtm?: number;
  dailyPos?: number;
  dailyOnline?: number;
  monthlyTotal?: number;
  perTransaction?: number;
}
```
**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 7. Cambio de PIN

### 7.1 Cambiar PIN
**Endpoint**: `POST /cards/:id/pin`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  newPin: string; // 4 dígitos
  currentPin?: string;
}
```
**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 8. Estado de Cuenta

### 8.1 Obtener Estado de Cuenta
**Endpoint**: `GET /cards/:id/statement?month={month}&year={year}`  
**Headers**: Requiere autenticación  
**Query Params**:
- `month` (opcional): Número del mes (1-12)
- `year` (opcional): Año (YYYY)

**Response**:
```typescript
{
  success: boolean;
  data: {
    transactions: Array<{
      date: string;
      description: string;
      amount: number;
    }>;
    totalSpent: number;
    minPayment: number;
    dueDate: string;
    periodStart: string;
    periodEnd: string;
  };
}
```

---

## 9. Aviso de Viaje

### 9.1 Crear Aviso de Viaje
**Endpoint**: `POST /cards/:id/travel-notice`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  destination: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
}
```
**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 10. Reemplazo de Tarjeta

### 10.1 Solicitar Reemplazo
**Endpoint**: `POST /cards/:id/replace`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  reason: 'damaged' | 'lost' | 'stolen';
  deliveryAddress?: string;
}
```
**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 11. Suscripciones

### 11.1 Obtener Suscripciones
**Endpoint**: `GET /cards/:id/subscriptions`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    plan: string;
    amount: number;
    currency: string;
    nextBilling: string;
    status: 'active' | 'paused';
    category: 'entertainment' | 'software' | 'shopping';
    merchantLogo?: string;
  }>;
}
```

### 11.2 Activar/Pausar Suscripción
**Endpoint**: `POST /cards/:id/subscriptions/:subscriptionId/toggle`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 12. Recompensas

### 12.1 Obtener Recompensas
**Endpoint**: `GET /cards/:id/rewards`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  data: {
    totalPoints: number;
    history: Array<{
      id: number;
      description: string;
      points: number;
      date: string;
    }>;
  };
}
```

---

## 13. CVV Dinámico

### 13.1 Generar CVV Dinámico
**Endpoint**: `POST /cards/:id/cvv`  
**Headers**: Requiere autenticación  
**Response**:
```typescript
{
  success: boolean;
  data: {
    cvv: string; // 3 o 4 dígitos
    expiresIn: number; // Segundos hasta expiración
  };
}
```

---

## 14. Configuración de Notificaciones

### 14.1 Actualizar Configuración de Notificaciones
**Endpoint**: `PUT /cards/:id/notifications`  
**Headers**: Requiere autenticación  
**Body**:
```typescript
{
  transactionAlerts?: boolean;
  paymentReminders?: boolean;
  securityAlerts?: boolean;
}
```
**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 15. Funcionalidades Adicionales (No implementadas en repositorio actual)

Las siguientes funcionalidades están presentes en la interfaz de usuario pero **NO tienen endpoints definidos** en el repositorio. Deberán ser implementadas:

### 15.1 Pago de Tarjeta
**Endpoint propuesto**: `POST /cards/:id/payment`  
**Descripción**: Permite pagar la tarjeta desde una cuenta bancaria vinculada
**Body**:
```typescript
{
  amount: number;
  sourceAccountId: string;
  paymentType: 'total' | 'minimum' | 'other';
}
```

### 15.2 Retiro sin Tarjeta (Cardless ATM)
**Endpoint propuesto**: `POST /cards/:id/cardless-withdrawal`  
**Descripción**: Genera un código temporal para retiro en cajero sin tarjeta física
**Body**:
```typescript
{
  amount: number;
}
```
**Response**:
```typescript
{
  success: boolean;
  data: {
    code: string; // Código de 6 dígitos
    expiresIn: number; // Segundos (típicamente 1800 = 30 min)
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

### 15.4 Seguros
**Endpoints propuestos**:
- `GET /cards/:id/insurance/available` - Listar seguros disponibles
- `POST /cards/:id/insurance` - Contratar un seguro
- `GET /cards/:id/insurance` - Obtener seguros contratados
- `DELETE /cards/:id/insurance/:insuranceId` - Cancelar seguro

**Tipos de seguros**:
- Seguro de Vida de Crédito
- Seguro contra Fraude
- Seguro de Desempleo
- Seguro de Accidentes en Viajes
- Seguro de Incapacidad
- Seguro de Protección de Compras
- Seguro contra Robo
- Asistencia en Viajes

---

## Consideraciones de Implementación

### Autenticación
- Todos los endpoints (excepto `/auth/login`) requieren un token JWT válido
- El token debe enviarse en el header `Authorization: Bearer {token}`
- Los tokens deben ser almacenados de forma segura:
  - **iOS/Android**: `expo-secure-store`
  - **Web**: `AsyncStorage` (considerar mejoras de seguridad)

### Manejo de Errores
Todos los endpoints deben retornar errores en el siguiente formato:
```typescript
{
  success: false;
  error: string; // Mensaje descriptivo del error
  statusCode: number; // Código HTTP
}
```

### Códigos HTTP Comunes
- `200`: Operación exitosa
- `201`: Recurso creado
- `204`: Sin contenido (logout exitoso)
- `400`: Solicitud incorrecta
- `401`: No autenticado
- `403`: No autorizado
- `404`: Recurso no encontrado
- `408`: Timeout de solicitud
- `422`: Error de validación
- `500`: Error interno del servidor

### Multi-Tenant
La aplicación soporta múltiples instituciones financieras (tenants):
- Banco Pichincha
- Cooperativa Chone
- Diners Club
- Bancolombia
- Davivienda
- BBVA

El backend debe identificar el tenant por:
1. Subdomain (ej: `pichincha.app.com`)
2. Header personalizado (ej: `X-Tenant-ID`)
3. Parte del token JWT

### Seguridad
1. **Operaciones sensibles** (bloqueo, cambio PIN, pagos, etc.) deben requerir autenticación biométrica o confirmación adicional del lado del cliente
2. **Rate limiting** para prevenir abuso
3. **Cifrado** de datos sensibles (PINs, CVVs)
4. **Logs de auditoría** para todas las operaciones críticas

### Testing
Se recomienda:
1. Crear un ambiente de sandbox con datos de prueba
2. Usar el modo mock de la app (`USE_MOCK_API: true`) durante desarrollo
3. Implementar endpoints de testing solo disponibles en desarrollo

---

## Cómo Cambiar a Backend Real

En `api/config.ts`, cambiar:
```typescript
USE_MOCK_API: false
```

Y configurar las variables de entorno:
```env
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000/api
EXPO_PUBLIC_API_URL=https://api.produccion.com/api
```

---

## Priorización Sugerida

### Fase 1 - Funcionalidad Básica (MVP)
1. Autenticación (Login, Logout, Refresh Token, Get User)
2. Listar Tarjetas
3. Obtener Tarjeta por ID
4. Bloquear/Desbloquear Tarjeta

### Fase 2 - Operaciones Principales
5. Estado de Cuenta
6. Límites (Get/Update)
7. Cambio de PIN
8. Avance de Efectivo

### Fase 3 - Funcionalidades Avanzadas
9. Diferimiento de Pagos
10. Suscripciones
11. Aviso de Viaje
12. Recompensas

### Fase 4 - Funcionalidades Premium
13. CVV Dinámico
14. Reemplazo de Tarjeta
15. Configuración de Notificaciones
16. Pago de Tarjeta
17. Retiro sin Tarjeta
18. Configuración de Canales
19. Seguros

---

## Contacto y Soporte

Para preguntas o aclaraciones sobre la implementación de estos endpoints, revisar:
- Interfaces de repositorio: `repositories/interfaces/`
- Implementaciones reales: `repositories/real/`
- Implementaciones mock: `repositories/mock/`
- Cliente HTTP: `api/http-client.ts`
- Configuración: `api/config.ts`
