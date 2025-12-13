# Investigación de Issues de SonarQube Restantes

**Fecha**: 13 de Diciembre 2025
**Issues Totales Restantes**: 65 (reducidos de 118 originales - 45% de mejora)

## Resumen de Issues por Tipo

| Regla | Cantidad | Prioridad | Severidad | Tipo |
|-------|----------|-----------|-----------|------|
| S1874 | 20 | 🔴 Alta | Minor | APIs Deprecadas |
| S6478 | 9 | 🟠 Alta | Minor | Componentes Anidados |
| S6759 | 4 | 🟡 Media | Minor | React Props Read-only |
| S1135 | 4 | 🟢 Baja | Info | TODOs |
| S4323 | 3 | 🟡 Media | Minor | Type Aliases Duplicados |
| S6479 | 3 | 🟠 Media | Minor | Array Index como Key |
| S3358 | 3 | 🟡 Media | Minor | Ternarios Anidados |
| S2301 | 2 | 🟡 Media | Minor | Parámetros Boolean |
| S6754 | 2 | 🟡 Media | Minor | useState sin Destructurar |
| Otros | 15 | 🟢 Variable | Minor | Varios |

---

## 1. S1874 - APIs Deprecadas (20 issues) 🔴 PRIORIDAD ALTA

### ¿Qué es?
Uso de APIs o funciones que han sido marcadas como obsoletas (deprecated) y que serán eliminadas en versiones futuras.

### Ejemplos Encontrados:
1. **`rotation` y `origin` en `circular-progress.tsx`** (líneas 81-82)
   - APIs deprecadas de React Native Reanimated
   
2. **`runOnJS` en `info-tooltip.tsx`** (línea 19)
   - API deprecada de React Native Reanimated

### ¿Por qué es importante?
- **Mantenibilidad**: Las APIs deprecadas pueden ser eliminadas en futuras versiones
- **Actualizaciones**: Dificulta actualizar dependencias
- **Bugs potenciales**: Las APIs deprecadas pueden tener comportamientos no esperados

### Solución Recomendada:

#### Para React Native Reanimated:
```typescript
// ❌ ANTES (deprecated)
import { runOnJS } from 'react-native-reanimated';

const handlePress = () => {
  runOnJS(onPress)();
};

// ✅ DESPUÉS (recomendado)
import { useCallback } from 'react';
import { runOnUI, useSharedValue } from 'react-native-reanimated';

const handlePress = useCallback(() => {
  'worklet';
  onPress();
}, [onPress]);
```

#### Para propiedades `rotation` y `origin`:
```typescript
// ❌ ANTES (deprecated)
style={{
  rotation: animatedRotation,
  origin: { x: 50, y: 50 }
}}

// ✅ DESPUÉS (usar transform)
style={{
  transform: [
    { rotate: `${animatedRotation}deg` },
    { translateX: 50 },
    { translateY: 50 }
  ]
}}
```

### Acción Requerida:
1. Revisar documentación de React Native Reanimated actualizada
2. Identificar todas las APIs deprecadas en uso
3. Refactorizar usando las APIs actuales recomendadas
4. Probar exhaustivamente después de los cambios

---

## 2. S6478 - Componentes Anidados (9 issues) 🟠 PRIORIDAD ALTA

### ¿Qué es?
Componentes definidos dentro de otros componentes que se recrean en cada render.

### ¿Por qué es importante?
- **Performance**: Recreación innecesaria en cada render
- **Estado perdido**: Los componentes anidados pierden estado
- **Hooks inestables**: Los hooks pueden comportarse incorrectamente

### Ejemplos que aún quedan:
Probablemente hay más instancias similares a las que ya corregimos.

### Solución (ya aplicada):
```typescript
// ❌ MAL - Componente anidado
function ParentComponent() {
  const NestedButton = () => <Button />;
  return <NestedButton />;
}

// ✅ BIEN - Componente extraído
const NestedButton = () => <Button />;

function ParentComponent() {
  return <NestedButton />;
}
```

### Acción Requerida:
1. Buscar patrones de componentes definidos dentro de funciones
2. Extraer a nivel de módulo o usar `useMemo` si depende de props
3. Verificar que no hay pérdida de estado

---

## 3. S6759 - React Props Read-only (4 issues) 🟡 PRIORIDAD MEDIA

### ¿Qué es?
Modificación directa de props en componentes React, violando el principio de inmutabilidad.

### ¿Por qué es importante?
- **Inmutabilidad**: Las props deben ser read-only
- **Flujo de datos**: Viola el flujo unidireccional de React
- **Debugging**: Dificulta rastrear cambios de estado

### Solución:
```typescript
// ❌ MAL - Modificando props directamente
function MyComponent({ items }: Props) {
  items.push(newItem); // ❌ Modifica las props
  return <List items={items} />;
}

// ✅ BIEN - Crear nueva instancia
function MyComponent({ items }: Props) {
  const newItems = [...items, newItem]; // ✅ Crea nuevo array
  return <List items={newItems} />;
}

// ✅ ALTERNATIVA - Usar estado local
function MyComponent({ items }: Props) {
  const [localItems, setLocalItems] = useState(items);
  
  const addItem = () => {
    setLocalItems(prev => [...prev, newItem]);
  };
  
  return <List items={localItems} />;
}
```

### Acción Requerida:
1. Buscar modificaciones directas de props (push, pop, sort, etc.)
2. Reemplazar con operaciones inmutables
3. Considerar usar estado local si se necesita modificar

---

## 4. S1135 - Track TODO Comments (4 issues) 🟢 PRIORIDAD BAJA

### ¿Qué es?
Comentarios TODO que marcan trabajo pendiente.

### ¿Por qué es importante?
- **Deuda técnica**: Indica trabajo incompleto
- **Planificación**: Ayuda a rastrear pendientes

### Solución:
```typescript
// ❌ TODO: Implementar validación
// TODO: Optimizar este código

// ✅ Mejor: Crear ticket en sistema de seguimiento y referenciar
// JIRA-123: Pendiente implementar validación completa
// O simplemente implementar el TODO y eliminarlo
```

### Acción Requerida:
1. Revisar cada TODO
2. Decidir: ¿Implementar ahora o crear ticket?
3. Si se crea ticket, referenciar número
4. Si no es necesario, eliminar comentario

---

## 5. S4323 - Type Aliases Duplicados (3 issues) 🟡 PRIORIDAD MEDIA

### ¿Qué es?
Tipos repetidos en union types que hacen el código redundante.

### Ejemplo:
```typescript
// ❌ MAL - Tipos duplicados en union
type Status = 'active' | 'inactive' | 'pending' | 'active'; // 'active' está duplicado

// ✅ BIEN - Sin duplicados
type Status = 'active' | 'inactive' | 'pending';
```

### Acción Requerida:
1. Buscar definiciones de tipos con unions
2. Eliminar duplicados
3. Considerar usar enums para tipos complejos

---

## 6. S2301 - Boolean Parameters (2 issues) 🟡 PRIORIDAD MEDIA

### ¿Qué es?
Funciones con parámetros booleanos que deberían tener valores por defecto.

### ¿Por qué es importante?
- **Legibilidad**: Hace el código más claro
- **API**: Mejora la experiencia del desarrollador
- **Mantenibilidad**: Reduce bugs por parámetros olvidados

### Solución:
```typescript
// ❌ MAL - Sin valor por defecto
function fetchData(includeMetadata: boolean) {
  // Si se olvida pasar el parámetro, puede causar bugs
}

// ✅ BIEN - Con valor por defecto
function fetchData(includeMetadata: boolean = false) {
  // Comportamiento predecible si no se pasa
}

// ✅ ALTERNATIVA - Usar objeto de opciones
interface FetchOptions {
  includeMetadata?: boolean;
}

function fetchData(options: FetchOptions = {}) {
  const { includeMetadata = false } = options;
  // Más escalable para múltiples opciones
}
```

### Acción Requerida:
1. Identificar funciones con parámetros boolean opcionales
2. Agregar valores por defecto apropiados
3. Considerar refactor a objeto de opciones si hay múltiples parámetros

---

## 7. S6754 - useState sin Destructurar (2 issues) 🟡 PRIORIDAD MEDIA

### ¿Qué es?
Llamadas a `useState` que no se destructuran correctamente o no siguen convención.

### Solución:
```typescript
// ❌ MAL - No destructurado o mal nombrado
const state = useState(0);
const [value, updateValue] = useState(0);

// ✅ BIEN - Destructurado con nombres simétricos
const [count, setCount] = useState(0);
const [isVisible, setIsVisible] = useState(false);
const [userData, setUserData] = useState<User | null>(null);
```

### Acción Requerida:
1. Buscar useState que no sigue convención
2. Renombrar para seguir patrón [value, setValue]
3. Asegurar nombres descriptivos

---

## Otros Issues (15 restantes)

### S6479 - Array Index como Key (3)
Ya corregimos 8, quedan 3 probablemente en código nuevo o no detectado.

### S3358 - Ternarios Anidados (3)
Ya corregimos algunos, buscar más patrones complejos.

### Resto (9)
Issues menores de estilo y formato que pueden ser abordados gradualmente.

---

## Plan de Acción Recomendado

### Fase 1 - Crítico (Esta semana)
1. ✅ **S1874 - APIs Deprecadas (20)**: Revisar documentación y actualizar
2. ✅ **S6478 - Componentes Anidados (9)**: Extraer componentes restantes

### Fase 2 - Importante (Próxima semana)
3. **S6759 - Props Read-only (4)**: Corregir mutaciones de props
4. **S4323 - Type Aliases (3)**: Limpiar tipos duplicados
5. **S6479 - Array Keys (3)**: Usar keys apropiadas

### Fase 3 - Mejoras (Cuando haya tiempo)
6. **S2301 - Boolean Params (2)**: Agregar defaults
7. **S6754 - useState (2)**: Renombrar consistentemente
8. **S3358 - Ternarios (3)**: Simplificar lógica compleja
9. **S1135 - TODOs (4)**: Resolver o crear tickets

### Fase 4 - Mantenimiento (Continuo)
10. **Otros (9)**: Ir abordando gradualmente

---

## Comandos Útiles para Investigación

### Ver issues por regla:
```bash
curl -s -u "TOKEN:" "http://localhost:9000/api/issues/search?componentKeys=LibelulaSoft_Tarjetas&resolved=false&rules=typescript:S1874&ps=10"
```

### Obtener resumen:
```bash
curl -s -u "TOKEN:" "http://localhost:9000/api/issues/search?componentKeys=LibelulaSoft_Tarjetas&resolved=false&ps=1&facets=rules"
```

### Ver ubicaciones específicas:
Reemplazar S1874 con la regla que quieres investigar.

---

## Referencias

- [SonarSource TypeScript Rules](https://rules.sonarsource.com/typescript/)
- [React Native Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## Notas Adicionales

- Los issues de tipo "Code Smell" (Minor) no bloquean pero mejoran calidad
- Priorizar según impacto en mantenibilidad y performance
- Algunos issues pueden ser falsos positivos - revisar caso por caso
- Mantener tests pasando después de cada corrección (actualmente 1229/1229 ✅)
