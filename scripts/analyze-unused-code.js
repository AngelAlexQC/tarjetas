#!/usr/bin/env node
/**
 * Script para analizar código potencialmente no usado
 */

const fs = require('fs');
const path = require('path');

// Directorios a analizar
const SRC_DIRS = ['app', 'components', 'hooks', 'utils', 'constants', 'contexts', 'repositories', 'api'];
const ROOT = path.join(__dirname, '..');

// Contadores
const stats = {
  totalFiles: 0,
  exportedFunctions: 0,
  exportedTypes: 0,
  exportedConstants: 0,
  unusedExports: [],
  largeFiles: [],
  emptyFiles: [],
  testFiles: 0
};

/**
 * Obtener todos los archivos TypeScript/TSX
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'coverage' && file !== '__tests__') {
        getAllFiles(filePath, fileList);
      }
    } else if (file.match(/\.(ts|tsx)$/) && !file.match(/\.test\.(ts|tsx)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extraer exports de un archivo
 */
function extractExports(content, filePath) {
  const exports = {
    functions: [],
    types: [],
    constants: [],
    interfaces: []
  };

  // Funciones exportadas
  const functionRegex = /export\s+(function|const)\s+(\w+)/g;
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    if (match[1] === 'function') {
      exports.functions.push(match[2]);
    } else {
      exports.constants.push(match[2]);
    }
  }

  // Tipos e interfaces exportadas
  const typeRegex = /export\s+(type|interface)\s+(\w+)/g;
  while ((match = typeRegex.exec(content)) !== null) {
    if (match[1] === 'type') {
      exports.types.push(match[2]);
    } else {
      exports.interfaces.push(match[2]);
    }
  }

  // Default exports
  if (content.includes('export default')) {
    exports.hasDefault = true;
  }

  return exports;
}

/**
 * Buscar uso de un símbolo en todos los archivos
 */
function findUsage(symbol, allFiles, excludePath) {
  let count = 0;
  const usedIn = [];

  for (const file of allFiles) {
    if (file === excludePath) continue;

    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Buscar imports del símbolo
      const importRegex = new RegExp(`import.*\\b${symbol}\\b.*from`, 'g');
      if (importRegex.test(content)) {
        count++;
        usedIn.push(path.relative(ROOT, file));
      }
    } catch (e) {
      // Ignorar errores de lectura
    }
  }

  return { count, usedIn };
}

/**
 * Analizar archivo
 */
function analyzeFile(filePath, allFiles) {
  stats.totalFiles++;

  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(ROOT, filePath);
  const lines = content.split('\n').length;

  // Detectar archivos vacíos o casi vacíos
  if (lines < 10 && !content.includes('export')) {
    stats.emptyFiles.push({ path: relativePath, lines });
  }

  // Detectar archivos muy grandes
  if (lines > 500) {
    stats.largeFiles.push({ path: relativePath, lines });
  }

  // Extraer exports
  const exports = extractExports(content, filePath);

  stats.exportedFunctions += exports.functions.length;
  stats.exportedTypes += exports.types.length;
  stats.exportedConstants += exports.constants.length;

  // Buscar exports no usados (sample - solo algunos para no tardar mucho)
  const allExports = [
    ...exports.functions,
    ...exports.types,
    ...exports.constants,
    ...exports.interfaces
  ];

  for (const symbol of allExports.slice(0, 3)) { // Solo primeros 3 por archivo para performance
    const usage = findUsage(symbol, allFiles, filePath);
    if (usage.count === 0) {
      stats.unusedExports.push({
        symbol,
        file: relativePath,
        type: exports.functions.includes(symbol) ? 'function' : 
              exports.types.includes(symbol) ? 'type' : 
              exports.constants.includes(symbol) ? 'constant' : 'interface'
      });
    }
  }
}

/**
 * Main
 */
function main() {
  console.log('🔍 Analizando código no usado...\n');

  // Recopilar todos los archivos
  let allFiles = [];
  for (const dir of SRC_DIRS) {
    const dirPath = path.join(ROOT, dir);
    if (fs.existsSync(dirPath)) {
      allFiles = allFiles.concat(getAllFiles(dirPath));
    }
  }

  console.log(`📁 Analizando ${allFiles.length} archivos...\n`);

  // Analizar cada archivo
  allFiles.forEach(file => {
    analyzeFile(file, allFiles);
  });

  // Reportar resultados
  console.log('📊 RESULTADOS DEL ANÁLISIS\n');
  console.log('═══════════════════════════════════════\n');

  console.log(`✅ Archivos analizados: ${stats.totalFiles}`);
  console.log(`📤 Funciones exportadas: ${stats.exportedFunctions}`);
  console.log(`📋 Tipos exportados: ${stats.exportedTypes}`);
  console.log(`🔢 Constantes exportadas: ${stats.exportedConstants}\n`);

  if (stats.unusedExports.length > 0) {
    console.log(`⚠️  EXPORTS POTENCIALMENTE NO USADOS (muestra):\n`);
    stats.unusedExports.slice(0, 20).forEach(item => {
      console.log(`   - ${item.symbol} (${item.type}) en ${item.file}`);
    });
    if (stats.unusedExports.length > 20) {
      console.log(`   ... y ${stats.unusedExports.length - 20} más\n`);
    }
  } else {
    console.log('✅ No se encontraron exports claramente sin usar\n');
  }

  if (stats.largeFiles.length > 0) {
    console.log(`📏 ARCHIVOS GRANDES (>500 líneas):\n`);
    stats.largeFiles.sort((a, b) => b.lines - a.lines).slice(0, 10).forEach(file => {
      console.log(`   - ${file.path} (${file.lines} líneas)`);
    });
    console.log();
  }

  if (stats.emptyFiles.length > 0) {
    console.log(`📄 ARCHIVOS PEQUEÑOS/VACÍOS (<10 líneas):\n`);
    stats.emptyFiles.forEach(file => {
      console.log(`   - ${file.path} (${file.lines} líneas)`);
    });
    console.log();
  }

  console.log('═══════════════════════════════════════\n');
  console.log('💡 Recomendaciones:');
  console.log('   1. Revisar exports no usados - pueden ser código muerto');
  console.log('   2. Considerar dividir archivos grandes en módulos más pequeños');
  console.log('   3. Eliminar archivos vacíos o integrarlos con otros');
  console.log('\n✨ Análisis completado!\n');
}

main();
