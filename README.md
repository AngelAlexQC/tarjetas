# Aplicación Financiera Marca Blanca (Multi-Tenant)

Aplicación móvil desarrollada en **React Native + Expo** diseñada para operar bajo un modelo de marca blanca, permitiendo a múltiples instituciones financieras ofrecer sus servicios con una experiencia de usuario personalizada y segura.

## 📊 Estado del Proyecto

**Avance Actual (Frontend): 90%**

La aplicación cuenta con la arquitectura base completa y la mayoría de los flujos de usuario implementados en el frontend, listos para integración con backend.

Para detalles sobre la planificación, consultar [Estimación Detallada](docs/ESTIMACION_TIEMPOS.md).

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
app/              # Rutas y Pantallas (Expo Router)
api/              # Configuración HTTP y endpoints
components/       # Componentes UI reutilizables
constants/        # Configuración de temas y tokens
contexts/         # Gestión de estado global (React Context)
hooks/            # Custom Hooks
repositories/     # Capa de datos (Interfaces, Mock y Real)
utils/            # Utilidades y helpers
types/            # Tipos TypeScript compartidos
test-utils/       # Helpers para testing
docs/             # Documentación del proyecto
```

## 🏁 Comenzar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```
