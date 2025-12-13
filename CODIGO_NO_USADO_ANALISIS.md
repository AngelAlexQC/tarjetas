# 📊 Análisis de Código No Usado

**Fecha:** 12 de diciembre de 2025  
**Herramienta:** Knip (Dead Code Detection)

## 🎯 Resumen Ejecutivo

El análisis encontró **código potencialmente no usado** que podríamos eliminar para mantener el proyecto más limpio:

### Categorías Encontradas:
- ✅ **Archivos sin usar**: 1
- ⚠️ **Dependencias no usadas**: 1  
- 🔧 **Dev Dependencies no usadas**: 4
- 📦 **Dependencias no listadas**: 14
- 🚫 **Exports no usados**: 73 funciones/constantes
- 📝 **Tipos no usados**: 51 interfaces/types

---

## 📁 1. Archivos Sin Usar

### `repositories/interfaces/index.ts`
**Estado:** ❌ No usado  
**Acción recomendada:** Eliminar - Este archivo parece ser un barrel export vacío o redundante

---

## 📦 2. Dependencias No Usadas

### `expo-font` (package.json:43:6)
**Estado:** ⚠️ No detectado en código  
**Acción recomendada:** 
- Verificar si se usa en configuración de Expo
- Si no, eliminar con: `npm uninstall expo-font`

---

## 🔧 3. Dev Dependencies No Usadas

### Herramientas de análisis recién instaladas:
1. **`depcheck`** - Solo para análisis
2. **`ts-prune`** - Solo para análisis  
3. **`sonarqube-scanner`** - Se usa vía npx
4. **`expo-dev-client`** - Verificar si es necesario

**Acción recomendada:**
```bash
npm uninstall --save-dev depcheck ts-prune
```

---

## 📚 4. Dependencias No Listadas en package.json

### `@expo/vector-icons` (14 archivos lo usan)
**Estado:** ⚠️ CRÍTICO - Se usa pero no está en dependencies  
**Ubicaciones:**
- `app/faq.tsx`, `app/profile.tsx`
- `components/email-login-screen.tsx`
- `components/forgot-password-screen.tsx`
- `components/login-screen.tsx`
- `components/register-screen.tsx`
- `components/institution-selector-header.tsx`
- `components/cards/insurance/*` (varios archivos)
- Y más...

**Acción recomendada:**
```bash
npm install @expo/vector-icons
```
O verificar si está incluido en expo (suele venir por defecto)

---

## 🚫 5. Exports No Usados (Top 20 más importantes)

### API / SSL Pinning
- `sslPinningManager` - api/ssl-pinning.ts
- `HTTPS_ONLY_DOMAINS` - api/ssl-pinning.config.ts
- `PINNING_EXEMPT_DOMAINS` - api/ssl-pinning.config.ts
- `generateCertificatePin()` - api/ssl-pinning.config.ts

**Análisis:** Código de seguridad SSL que puede ser necesario en el futuro. **MANTENER por seguridad**.

### Schemas/Validators (36 items)
- `TenantBrandingSchema`, `TenantCardFeaturesSchema`, etc.
- `CardTypeSchema`, `CardBrandSchema`, `CardStatusSchema`, etc.
- `TransactionSchema`, `AccountSchema`, `StatementTransactionSchema`, etc.
- `LoginRequestSchema`, `RegisterRequestSchema`, etc.

**Análisis:** Schemas de Zod para validación. Algunos se usan indirectamente via inferencia. **REVISAR caso por caso**.

### Componentes UI
- `CreditCardIcon`, `WalletIcon`, `TransferIcon`, etc. (10 iconos)
- `InsuranceIcon()` - components/cards/insurance/

**Análisis:** Iconos que pueden usarse dinámicamente. **VERIFICAR si se usan via mappings**.

### Constants/Config
- `AUTH_CONFIG`, `RATE_LIMIT_CONFIG`, `VALIDATION_PATTERNS`
- `SENSITIVE_FIELDS`, `SANITIZED_ERROR_MESSAGES`
- `BREAKPOINTS`, `NUMBER_THRESHOLDS`, etc.

**Análisis:** Re-exportados desde constants/index.ts. **MANTENER - son configuración central**.

### Hooks
- `useTenants`, `useFeatures`, `useLoginRateLimit`, `useSessionTimeout`

**Análisis:** Re-exportados desde hooks/index.ts. **VERIFICAR si se usan directamente**.

---

## 📝 6. Tipos/Interfaces No Usados (Top 15)

### Tipos de Contexto/Props
- `User` - contexts/auth-context.tsx
- `ColorMode`, `GlassIntensity`, `TextVariant` - hooks/use-app-theme.ts
- `ThemedTextProps`, `ThemedViewProps`
- `ErrorFallbackProps`

**Análisis:** Props de componentes. Si el componente se usa, los tipos están implícitos. **MANTENER**.

### Tipos de API/Repository
- `ApiResponse`, `ApiError`, `RequestOptions`
- `IAuthRepository`, `ICardRepository`
- `PinningType`, `CertificateValidationResult`

**Análisis:** Interfaces para contratos. **MANTENER para type safety**.

### Tipos de Schemas
- `CardType`, `CardBrand`, `CardStatus`, `BlockReason`, etc.
- `TransactionType`, `AccountType`, `SubscriptionStatus`
- `RefreshTokenRequest`, `RefreshTokenResponse`, etc.

**Análisis:** Tipos inferidos de Zod schemas. **MANTENER**.

---

## ✅ Acciones Recomendadas

### 🔴 ALTA PRIORIDAD

1. **Agregar @expo/vector-icons a package.json** (si no está incluido por Expo)
   ```bash
   npm install @expo/vector-icons
   ```

2. **Eliminar archivo vacío**
   ```bash
   rm repositories/interfaces/index.ts
   ```

3. **Desinstalar herramientas de análisis temporales**
   ```bash
   npm uninstall --save-dev depcheck ts-prune
   ```

### 🟡 MEDIA PRIORIDAD

4. **Revisar expo-font**
   - Buscar uso en app.config.js o _layout.tsx
   - Si no se usa, eliminar

5. **Revisar exports de schemas**
   - Muchos schemas se usan via type inference
   - Verificar cuáles realmente no se necesitan exportar

6. **Revisar iconos de financial-icons.tsx**
   - Verificar si se usan dinámicamente
   - Considerar lazy loading o tree-shaking

### 🟢 BAJA PRIORIDAD

7. **Revisar constants re-exports**
   - Simplificar constants/index.ts si hay duplicación

8. **Revisar hooks re-exports**
   - Ver si hooks/index.ts aporta valor o solo añade complejidad

9. **Documentar código "legacy" o "futuro"**
   - Si hay código para features futuras, documentar con comentarios
   - Considerar mover a carpeta `/future` o similar

---

## 📊 Estadísticas Finales

- **Total items analizados:** 140
- **Código que definitivamente eliminar:** 2-5%
- **Código a revisar:** 40-50%
- **Código que mantener (type safety, config):** 45-55%

### Impacto Potencial:
- **Reducción estimada de líneas:** ~500-1000 líneas
- **Mejora en bundle size:** Mínima (tree-shaking ya funciona)
- **Mejora en mantenibilidad:** Media-Alta

---

## 🛠️ Scripts Útiles

Agregar a `package.json`:

```json
{
  "scripts": {
    "analyze:unused": "knip",
    "analyze:deps": "depcheck",
    "clean:unused": "knip --fix"
  }
}
```

---

## 💡 Conclusiones

El proyecto está **bastante limpio** considerando su tamaño. La mayoría del "código no usado" son:

1. **Type definitions** - Necesarios para TypeScript
2. **Schemas** - Usados indirectamente  
3. **Re-exports** - Arquitectura válida
4. **Config/Constants** - Preparación para futuro

### Recomendación:
✅ **Hacer limpieza selectiva** en lugar de eliminar todo masivamente  
✅ **Priorizar eliminación de archivos vacíos y deps temporales**  
✅ **Mantener types y schemas por seguridad de tipos**

