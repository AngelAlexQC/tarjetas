# Aplicación Financiera Marca Blanca (Multi-Tenant)

Aplicación móvil desarrollada en **React Native + Expo** diseñada para operar bajo un modelo de marca blanca, permitiendo a múltiples instituciones financieras ofrecer sus servicios con una experiencia de usuario personalizada y segura.

## 📊 Estado del Proyecto

**Avance Actual (Frontend): 90%**
*Período de desarrollo: 19 - 25 Noviembre 2025*

La aplicación cuenta con la arquitectura base completa y la mayoría de los flujos de usuario implementados en el frontend, listos para integración con backend.

Para detalles sobre la planificación y tiempos de finalización, consultar:
- [Estimación Detallada y Cronograma](docs/ESTIMACION_TIEMPOS.md)
- [Resumen de Avance y Proyección](docs/TIEMPOS_RAPIDO.md)

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

- **Core**: React Native, Expo SDK 52.
- **Lenguaje**: TypeScript.
- **Navegación**: Expo Router.
- **UI/UX**: Reanimated 3, Skia (Gráficos), SVG nativos.
- **Arquitectura**: Repositorios (Clean Architecture), Context API.

## 📂 Estructura del Proyecto

```
app/              # Rutas y Pantallas (Expo Router)
components/       # Componentes UI reutilizables
constants/        # Configuración de temas y tenants
contexts/         # Gestión de estado global
features/         # Lógica de negocio modular
hooks/            # Custom Hooks
repositories/     # Capa de datos (Interfaces y Mock)
docs/             # Documentación del proyecto
```

## 🏁 Comenzar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```
