# 🏦 Aplicación Financiera Marca Blanca (Multi-Tenant)

Aplicación móvil desarrollada en **React Native + Expo** diseñada para operar bajo un modelo de marca blanca, permitiendo a múltiples instituciones financieras ofrecer sus servicios con una experiencia de usuario personalizada y segura.

## 📊 Estado del Proyecto

**Avance Actual (Frontend): 90%**

La aplicación cuenta con la arquitectura base completa y la mayoría de los flujos de usuario implementados en el frontend, listos para integración con backend.

Para detalles sobre la planificación, consultar [Estimación Detallada](docs/ESTIMACION_TIEMPOS.md).

> 🆕 **Diciembre 2025**: Proyecto reorganizado siguiendo las mejores prácticas de Expo 2025 con estructura `src/`.

## 🚀 Funcionalidades Implementadas

### 🔐 Autenticación y Seguridad
- Registro y Login seguro.
- **Biometría**: Acceso con Face ID / Touch ID.
- Recuperación de contraseña y gestión de sesiones.

### 🏦 Sistema Multi-Tenant
- Soporte para múltiples instituciones (Banco Pichincha, Diners Club, Bancolombia, etc.).
- **Theming Dinámico**: Adaptación de colores, logos y estilos según la institución seleccionada.

### 💳 Gestión de Productos
- **Tarjetas**: Crédito, Débito y Virtuales.
- **Operaciones**:
  - Bloqueo y desbloqueo temporal.
  - Cambio de PIN.
  - Configuración de límites y canales.
  - Generación de CVV dinámico.
  - Solicitud de reemplazo y avisos de viaje.
- **Financiero**:
  - Simulador de diferidos.
  - Solicitud de avances de efectivo.
  - Visualización de estados de cuenta (PDF).

### 🛡️ Marketplace de Seguros
- Contratación OneClick de seguros.
- Carrusel de ofertas personalizadas.
- Gestión de pólizas y comprobantes.

## 🛠️ Stack Tecnológico

- **Core**: React Native 0.81, Expo SDK 54
- **Lenguaje**: TypeScript 5.9
- **Navegación**: Expo Router 6
- **UI/UX**: Reanimated 4, SVG nativos
- **Validación**: Zod
- **Arquitectura**: Repository Pattern, Context API

## 📂 Estructura del Proyecto

```
financiero/
├── src/                    # Código fuente de la aplicación
│   ├── app/                # Rutas y Pantallas (Expo Router)
│   │   ├── (tabs)/         # Navegación por pestañas
│   │   ├── cards/[id]/     # Pantallas dinámicas de tarjetas
│   │   └── _layout.tsx     # Layout raíz
│   ├── api/                # Configuración HTTP y endpoints
│   │   ├── config.ts       # Configuración de API
│   │   └── http-client.ts  # Cliente HTTP con interceptores
│   ├── components/         # Componentes UI reutilizables
│   │   ├── cards/          # Componentes de tarjetas
│   │   ├── navigation/     # Componentes de navegación
│   │   └── ui/             # Componentes UI base
│   ├── constants/          # Configuración de temas y tokens
│   │   ├── tenant-themes.ts # Temas de instituciones
│   │   └── design-tokens.ts # Tokens de diseño
│   ├── contexts/           # Gestión de estado global
│   │   ├── auth-context.tsx
│   │   └── tenant-theme-context.tsx
│   ├── hooks/              # Custom Hooks
│   │   └── cards/          # Hooks específicos de tarjetas
│   ├── repositories/       # Capa de datos (Repository Pattern)
│   │   ├── interfaces/     # Interfaces de repositorios
│   │   ├── mock/           # Implementaciones mock
│   │   ├── real/           # Implementaciones reales
│   │   └── schemas/        # Schemas de validación (Zod)
│   ├── utils/              # Utilidades y helpers
│   │   └── formatters/     # Formateadores (fecha, moneda)
│   └── types/              # Tipos TypeScript compartidos
├── assets/                 # Recursos estáticos (imágenes, fuentes)
├── test-utils/             # Helpers para testing
├── docs/                   # Documentación del proyecto
└── scripts/                # Scripts de automatización
```

### 🏗️ Arquitectura

- **Repository Pattern**: Abstracción de la capa de datos con soporte para implementaciones mock y reales
- **Context API**: Gestión de estado global (Auth, Theme, Tour)
- **Expo Router**: Navegación file-based con soporte para rutas dinámicas
- **TypeScript First**: Tipado estricto en todo el proyecto
- **Testing**: Jest + React Testing Library con cobertura > 50%

## 🏁 Comenzar

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Expo CLI (se instala automáticamente)
- Para iOS: macOS con Xcode
- Para Android: Android Studio

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/AngelAlexQC/financiero.git
cd financiero

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# Iniciar en plataforma específica
npm run android    # Android
npm run ios        # iOS
npm run web        # Web

# Limpiar cache y reiniciar
npx expo start --clear
```

### Scripts Disponibles

```bash
npm run lint          # Ejecutar ESLint
npm run lint:fix      # Arreglar problemas de lint automáticamente
npm run typecheck     # Verificar tipos TypeScript
npm test              # Ejecutar tests
npm run test:watch    # Tests en modo watch
npm run test:coverage # Tests con reporte de cobertura
npm run validate      # Ejecutar typecheck + lint + tests
```

### Estructura de Carpetas `src/`

El proyecto sigue las [mejores prácticas de Expo 2025](https://expo.dev/blog/expo-app-folder-structure-best-practices):

- **`src/app/`**: Expo Router detecta automáticamente esta carpeta
- **`src/`**: Separa el código de aplicación de los archivos de configuración
- **Path Aliases**: Usa `@/` para imports absolutos (ej: `@/components/Button`)

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# API Configuration
EXPO_PUBLIC_API_URL_DEV=https://api-dev.ejemplo.com
EXPO_PUBLIC_API_URL_PROD=https://api.ejemplo.com

# App Configuration
APP_NAME=Tarjetas
APP_SLUG=tarjetas
APP_BUNDLE_ID_IOS=com.libelulasoft.tarjetas
APP_BUNDLE_ID_ANDROID=com.libelulasoft.tarjetas
APP_SCHEME=tarjetas
```

### Modo Mock vs Real

El proyecto soporta dos modos de operación configurables en `src/api/config.ts`:

```typescript
// Modo Mock: Usa datos simulados (sin backend)
USE_MOCK_API: true

// Modo Real: Conecta con backend real
USE_MOCK_API: false
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

### Cobertura Actual

- **Branches**: > 50%
- **Functions**: > 50%
- **Lines**: > 50%
- **Statements**: > 50%

## 📱 Builds y Deployment

### EAS Build (Expo Application Services)

```bash
# Build de desarrollo
eas build --profile development --platform ios
eas build --profile development --platform android

# Build de producción
eas build --profile production --platform all
```

### Configuración de Perfiles

Los perfiles de build están definidos en `eas.json` con soporte para múltiples ambientes.

## 🎨 Theming

El sistema de theming permite personalizar la aplicación por institución:

```typescript
// src/constants/tenant-themes.ts
export const tenantThemes = {
  pichincha: {
    primary: '#FFD700',
    secondary: '#003A70',
    // ...
  },
  diners: {
    primary: '#0033A0',
    secondary: '#FFA500',
    // ...
  }
}
```

## 📖 Documentación Adicional

- [Estimación de Tiempos](docs/ESTIMACION_TIEMPOS.md)
- [Guía de Iconos](docs/ICONS.md)
- [Repositorios](docs/REPOSITORIES.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- **ESLint**: El proyecto usa ESLint con reglas estrictas
- **TypeScript**: Tipado estricto habilitado
- **Commits**: Seguir [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` Nueva funcionalidad
  - `fix:` Corrección de bug
  - `refactor:` Refactorización de código
  - `docs:` Cambios en documentación
  - `test:` Agregar o actualizar tests

## 📄 Licencia

Este proyecto es propiedad de Libélula Soft y está protegido por derechos de autor.

## 👥 Equipo

- **Desarrollo**: Libélula Soft
- **Repositorio**: [github.com/AngelAlexQC/financiero](https://github.com/AngelAlexQC/financiero)

---

Hecho con ❤️ por Libélula Soft
