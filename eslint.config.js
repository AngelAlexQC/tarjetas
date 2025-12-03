// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  // Spread the expo config array
  ...expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'coverage/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Complexity (ayuda a mantener código limpio)
      // Límites relajados para screens y componentes complejos de UI
      'max-lines-per-function': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 4],
      'complexity': ['warn', 20],
    },
  },
  {
    // Reglas más relajadas para archivos de test
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
