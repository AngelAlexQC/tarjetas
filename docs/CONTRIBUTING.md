# Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto! Esta guía te ayudará a entender cómo trabajamos.

## 🚀 Comenzando

### 1. Setup del Proyecto

```bash
# Fork y clonar el repositorio
git clone https://github.com/tu-usuario/financiero.git
cd financiero

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm start
```

### 2. Estructura de Branches

- `main`: Código de producción estable
- `release/beta`: Código en fase de pruebas
- `feature/*`: Nuevas funcionalidades
- `fix/*`: Corrección de bugs
- `refactor/*`: Refactorización de código

## 📝 Convenciones de Código

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: agregar nueva funcionalidad
fix: corregir bug en autenticación
refactor: reorganizar estructura de carpetas
docs: actualizar README
test: agregar tests para repositorios
chore: actualizar dependencias
style: formatear código según ESLint
perf: mejorar rendimiento de animaciones
```

### TypeScript

- **Tipado estricto**: Siempre tipar variables, funciones y props
- **Evitar `any`**: Usar tipos específicos o `unknown`
- **Interfaces vs Types**: Usar `interface` para objetos públicos, `type` para uniones

```typescript
// ✅ Bien
interface UserProps {
  id: string;
  name: string;
}

// ❌ Evitar
const user: any = { id: 1 };
```

### Naming Conventions

- **Archivos**: `kebab-case.tsx` (ej: `card-carousel.tsx`)
- **Componentes**: `PascalCase` (ej: `CardCarousel`)
- **Hooks**: `camelCase` con prefijo `use` (ej: `useCardQueries`)
- **Constantes**: `SCREAMING_SNAKE_CASE` (ej: `API_BASE_URL`)
- **Variables/Funciones**: `camelCase` (ej: `getUserData`)

### Estructura de Componentes

```typescript
import { StyleSheet, View } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress: () => void;
}

export function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View style={styles.container}>
      {/* JSX aquí */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

## 🧪 Testing

### Escribir Tests

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Generar cobertura
npm run test:coverage
```

### Requisitos de Cobertura

- Branches: > 50%
- Functions: > 50%
- Lines: > 50%
- Statements: > 50%

### Ejemplo de Test

```typescript
import { render, screen } from '@test-utils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" onPress={() => {}} />);
    expect(screen.getByText('Test')).toBeTruthy();
  });
});
```

## 🎨 UI/UX Guidelines

### Colores

Usar siempre tokens del tema activo:

```typescript
import { useAppTheme } from '@/hooks';

function MyComponent() {
  const { theme } = useAppTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.primary }}>
      {/* ... */}
    </View>
  );
}
```

### Accesibilidad

- Agregar `accessibilityLabel` a elementos interactivos
- Usar `accessibilityRole` apropiado
- Asegurar contraste de colores adecuado

```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Cerrar sesión"
>
  <Text>Salir</Text>
</TouchableOpacity>
```

## 📦 Pull Requests

### Checklist antes de PR

- [ ] Código pasa lint (`npm run lint`)
- [ ] Código pasa typecheck (`npm run typecheck`)
- [ ] Tests pasan (`npm test`)
- [ ] Actualizar documentación si es necesario
- [ ] Commit messages siguen Conventional Commits
- [ ] PR tiene descripción clara

### Plantilla de PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Testing
Describe cómo probaste los cambios

## Screenshots
Si aplica, agrega capturas de pantalla
```

## 🔍 Code Review

### Criterios de Aprobación

1. **Funcionalidad**: El código hace lo que debe hacer
2. **Calidad**: Sigue las convenciones del proyecto
3. **Tests**: Tiene cobertura adecuada
4. **Performance**: No introduce problemas de rendimiento
5. **Documentación**: Cambios documentados apropiadamente

## 🆘 Ayuda

Si tienes preguntas:

1. Revisa la documentación en `/docs`
2. Busca en issues existentes
3. Crea un nuevo issue con la etiqueta `question`

## 📚 Recursos

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

¡Gracias por contribuir! 🎉
