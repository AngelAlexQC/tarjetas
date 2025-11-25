# Configuración de Bundle Identifiers

Este proyecto está configurado para usar diferentes bundle identifiers según el entorno:

## Entornos

### Desarrollo Local
- **iOS Bundle ID**: `com.aquirozdev.tarjetas.dev`
- **Android Package**: `com.aquirozdev.tarjetas.dev`
- **Nombre de la App**: `Financiero Dev`
- **Scheme**: `financiero-dev`

### Producción/CI
- **iOS Bundle ID**: `com.aquirozdev.tarjetas`
- **Android Package**: `com.aquirozdev.tarjetas`
- **Nombre de la App**: `financiero`
- **Scheme**: `financiero`

## Cómo funciona

El archivo `app.config.js` detecta automáticamente el entorno basándose en:
- Variable `EAS_BUILD=true` (se establece automáticamente en builds de EAS)
- Variable `CI=true` (común en entornos de CI/CD)

Si ninguna de estas variables está presente, usa la configuración de desarrollo.

## Comandos útiles

### Desarrollo local
```bash
# Iniciar en desarrollo (usa bundle .dev)
npx expo start

# Build local (usa bundle .dev)
npx expo run:ios
npx expo run:android
```

### Builds de producción con EAS
```bash
# Build de preview (usa bundle de producción)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Build de producción (usa bundle de producción)
eas build --profile production --platform ios
eas build --profile production --platform android
```

## Beneficios

✅ Puedes tener ambas versiones instaladas simultáneamente en tu dispositivo
✅ Desarrollo local usa bundle `.dev` automáticamente
✅ Builds de EAS usan el bundle de producción
✅ No hay conflictos entre versiones

## Notas

- El archivo `app.json` ya no se usa (reemplazado por `app.config.js`)
- No borres `app.json` si tienes procesos que aún lo requieran
- Las variables de entorno se pueden ver en `extra.isProduction` dentro de la app
