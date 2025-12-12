# Quality Gate Strategy

## Current Status
- **Coverage**: ~38% (objetivo progresivo hacia 80%)
- **Quality Gate**: Configurado en SonarCloud
- **Tests**: 666 tests pasando

## Quality Metrics

### Coverage (Cobertura de código)
- **Actual**: 38%
- **Meta a corto plazo**: 50%
- **Meta a largo plazo**: 80%

#### Estrategia de incremento:
1. **Fase 1** (Completada - 38%): Tests básicos para:
   - Hooks críticos
   - Componentes UI reutilizables
   - Utilidades core
   - Contextos

2. **Fase 2** (Objetivo: 50%): 
   - Repositorios mock completos
   - Componentes de cards
   - Pantallas de autenticación

3. **Fase 3** (Objetivo: 65%):
   - Componentes de operations
   - Pantallas principales
   - Repositorios reales

4. **Fase 4** (Objetivo: 80%):
   - Edge cases
   - Escenarios de error
   - Integración completa

### Maintainability (Mantenibilidad)
- **Rating A**: Sin deuda técnica significativa
- **Code Smells**: < 50
- **Technical Debt**: < 1 día

### Reliability (Confiabilidad)
- **Rating A**: Sin bugs críticos o mayores
- **Bugs**: 0

### Security (Seguridad)
- **Rating A**: Sin vulnerabilidades
- **Security Hotspots**: 100% revisados

### Duplications (Duplicaciones)
- **Target**: ≤ 3% de código duplicado
- **Exclusiones**: Tests, mocks, utilities

## SonarCloud Configuration

### Quality Gate personalizado
El Quality Gate se configura directamente en SonarCloud console:
- https://sonarcloud.io/organizations/angelalexqc/quality_gates

### Conditions on New Code
Para código nuevo (cada PR):
- **Coverage**: ≥ 40% (progresivo)
- **Duplicated Lines**: ≤ 3%
- **Maintainability Rating**: A
- **Reliability Rating**: A
- **Security Rating**: A
- **Security Hotspots Reviewed**: 100%

## Test Strategy

### Prioridad de testing:
1. **Critical** (Alta prioridad):
   - Utilities (auth-storage, validators, error-sanitizer)
   - Core hooks (use-auth-flow, use-session-timeout)
   - Repositorios (interfaces con backend)

2. **High** (Prioridad media-alta):
   - Componentes reutilizables
   - Contextos
   - Formatters

3. **Medium** (Prioridad media):
   - Componentes de UI específicos
   - Pantallas completas
   - Hooks auxiliares

4. **Low** (Prioridad baja):
   - Componentes de presentación puros
   - Constantes y tipos
   - Configuración

### Tipos de tests:
- **Unit Tests**: Funciones, hooks, utilities
- **Component Tests**: Rendering, props, eventos
- **Integration Tests**: Contextos, providers, flows

## Best Practices

### Tests
- ✅ Usar `describe` y `it` descriptivos
- ✅ Mocks solo cuando sea necesario
- ✅ Tests independientes (no depender de orden)
- ✅ Limpiar después de cada test
- ✅ Probar casos felices y edge cases

### Code Quality
- ✅ TypeScript strict mode
- ✅ ESLint configurado
- ✅ Prettier para formateo
- ✅ Commits convencionales
- ✅ Pre-commit hooks con Husky

## Monitoring

### GitHub Actions
Cada push ejecuta:
1. TypeScript check
2. ESLint
3. Jest con coverage
4. SonarCloud análisis
5. OWASP Dependency Check
6. npm audit

### Dashboard
- SonarCloud: https://sonarcloud.io/dashboard?id=AngelAlexQC_financiero
- GitHub Actions: https://github.com/AngelAlexQC/financiero/actions

## Next Steps

1. ✅ Setup inicial de tests
2. ✅ Configuración de SonarCloud
3. ✅ Tests para hooks y utilities
4. 🔄 Llegar a 50% de cobertura
5. ⏳ Implementar tests para pantallas
6. ⏳ Alcanzar 80% de cobertura

## Notes

- El Quality Gate en SonarCloud se configura a nivel de organización
- Para cambiar umbrales, ir a: Organization Settings > Quality Gates
- La cobertura se mide solo en código nuevo de cada PR
- Los tests no cuentan para la cobertura (están excluidos)
