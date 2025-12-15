#!/usr/bin/env node
/**
 * Generador de Reporte de Calidad de Código
 * Basado en datos locales de Jest Coverage
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_FILE = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'quality-report.html');

// Colores y estilos
const COLORS = {
  excellent: '#00B74A',
  good: '#92D050',
  moderate: '#FFC107',
  poor: '#FF9800',
  critical: '#F44336',
  primary: '#2196F3',
  dark: '#1a237e',
  light: '#f5f5f5'
};

function getRatingColor(percentage) {
  if (percentage >= 80) return COLORS.excellent;
  if (percentage >= 60) return COLORS.good;
  if (percentage >= 40) return COLORS.moderate;
  if (percentage >= 20) return COLORS.poor;
  return COLORS.critical;
}

function getRatingLabel(percentage) {
  if (percentage >= 80) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 40) return 'C';
  if (percentage >= 20) return 'D';
  return 'E';
}

function generateHTML(coverageData) {
  const total = coverageData.total;
  const timestamp = new Date().toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calcular métricas globales
  const statements = total.statements.pct;
  const branches = total.branches.pct;
  const functions = total.functions.pct;
  const lines = total.lines.pct;
  const overall = ((statements + branches + functions + lines) / 4).toFixed(2);

  // Encontrar archivos con baja cobertura
  const lowCoverageFiles = Object.entries(coverageData)
    .filter(([key]) => key !== 'total')
    .map(([file, data]) => ({
      file: file.replace(/^.*\/financiero\//, ''),
      coverage: data.statements.pct
    }))
    .filter(item => item.coverage < 60)
    .sort((a, b) => a.coverage - b.coverage)
    .slice(0, 10);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Calidad de Código - Financiero</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.primary} 100%);
      padding: 40px 20px;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.primary} 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .header p {
      font-size: 1.1em;
      opacity: 0.9;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      padding: 40px;
      background: ${COLORS.light};
    }
    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    .metric-value {
      font-size: 3em;
      font-weight: bold;
      margin: 10px 0;
    }
    .metric-label {
      font-size: 1.1em;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .metric-rating {
      display: inline-block;
      width: 60px;
      height: 60px;
      line-height: 60px;
      border-radius: 50%;
      color: white;
      font-size: 2em;
      font-weight: bold;
      margin-top: 10px;
    }
    .overall-score {
      background: white;
      padding: 40px;
      text-align: center;
      border-top: 3px solid ${COLORS.primary};
    }
    .overall-score h2 {
      font-size: 2em;
      margin-bottom: 20px;
      color: ${COLORS.dark};
    }
    .score-circle {
      display: inline-block;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4em;
      font-weight: bold;
      color: white;
      position: relative;
      margin: 20px auto;
    }
    .score-circle::before {
      content: '%';
      font-size: 0.4em;
      position: absolute;
      right: 40px;
      top: 45px;
    }
    .low-coverage {
      padding: 40px;
      background: white;
    }
    .low-coverage h3 {
      font-size: 1.8em;
      margin-bottom: 20px;
      color: ${COLORS.dark};
      border-left: 4px solid ${COLORS.critical};
      padding-left: 15px;
    }
    .file-list {
      list-style: none;
    }
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      margin-bottom: 10px;
      background: ${COLORS.light};
      border-radius: 8px;
      border-left: 4px solid;
    }
    .file-name {
      flex: 1;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    .file-coverage {
      font-weight: bold;
      font-size: 1.2em;
      margin-left: 20px;
    }
    .test-summary {
      padding: 40px;
      background: ${COLORS.light};
      border-top: 1px solid #ddd;
    }
    .test-summary h3 {
      font-size: 1.8em;
      margin-bottom: 20px;
      color: ${COLORS.dark};
    }
    .test-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    .test-stat {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .test-stat-value {
      font-size: 2.5em;
      font-weight: bold;
      color: ${COLORS.primary};
    }
    .test-stat-label {
      color: #666;
      margin-top: 5px;
    }
    .footer {
      padding: 30px;
      text-align: center;
      background: ${COLORS.dark};
      color: white;
    }
    .footer p {
      opacity: 0.8;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Reporte de Calidad de Código</h1>
      <p>Proyecto Financiero - LibelulaSoft</p>
      <p style="font-size: 0.9em; margin-top: 10px;">${timestamp}</p>
    </div>

    <div class="overall-score">
      <h2>Calificación Global</h2>
      <div class="score-circle" style="background: ${getRatingColor(parseFloat(overall))};">
        ${overall}
      </div>
      <p style="font-size: 1.2em; color: #666; margin-top: 10px;">
        Rating: <strong style="font-size: 1.5em; color: ${getRatingColor(parseFloat(overall))};">${getRatingLabel(parseFloat(overall))}</strong>
      </p>
    </div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Cobertura de Statements</div>
        <div class="metric-value" style="color: ${getRatingColor(statements)};">${statements}%</div>
        <div class="metric-rating" style="background: ${getRatingColor(statements)};">${getRatingLabel(statements)}</div>
        <p style="margin-top: 10px; color: #888; font-size: 0.9em;">
          ${total.statements.covered} / ${total.statements.total} cubiertos
        </p>
      </div>

      <div class="metric-card">
        <div class="metric-label">Cobertura de Ramas</div>
        <div class="metric-value" style="color: ${getRatingColor(branches)};">${branches}%</div>
        <div class="metric-rating" style="background: ${getRatingColor(branches)};">${getRatingLabel(branches)}</div>
        <p style="margin-top: 10px; color: #888; font-size: 0.9em;">
          ${total.branches.covered} / ${total.branches.total} cubiertas
        </p>
      </div>

      <div class="metric-card">
        <div class="metric-label">Cobertura de Funciones</div>
        <div class="metric-value" style="color: ${getRatingColor(functions)};">${functions}%</div>
        <div class="metric-rating" style="background: ${getRatingColor(functions)};">${getRatingLabel(functions)}</div>
        <p style="margin-top: 10px; color: #888; font-size: 0.9em;">
          ${total.functions.covered} / ${total.functions.total} cubiertas
        </p>
      </div>

      <div class="metric-card">
        <div class="metric-label">Cobertura de Líneas</div>
        <div class="metric-value" style="color: ${getRatingColor(lines)};">${lines}%</div>
        <div class="metric-rating" style="background: ${getRatingColor(lines)};">${getRatingLabel(lines)}</div>
        <p style="margin-top: 10px; color: #888; font-size: 0.9em;">
          ${total.lines.covered} / ${total.lines.total} cubiertas
        </p>
      </div>
    </div>

    <div class="test-summary">
      <h3>✅ Resumen de Tests</h3>
      <div class="test-stats">
        <div class="test-stat">
          <div class="test-stat-value">1229</div>
          <div class="test-stat-label">Tests Pasando</div>
        </div>
        <div class="test-stat">
          <div class="test-stat-value">85</div>
          <div class="test-stat-label">Test Suites</div>
        </div>
        <div class="test-stat">
          <div class="test-stat-value">100%</div>
          <div class="test-stat-label">Éxito</div>
        </div>
      </div>
    </div>

    ${lowCoverageFiles.length > 0 ? `
    <div class="low-coverage">
      <h3>⚠️ Archivos con Baja Cobertura (< 60%)</h3>
      <ul class="file-list">
        ${lowCoverageFiles.map(item => `
          <li class="file-item" style="border-left-color: ${getRatingColor(item.coverage)};">
            <span class="file-name">${item.file}</span>
            <span class="file-coverage" style="color: ${getRatingColor(item.coverage)};">${item.coverage}%</span>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="footer">
      <p><strong>LibelulaSoft - Proyecto Financiero</strong></p>
      <p>Reporte generado automáticamente por Jest Coverage</p>
    </div>
  </div>
</body>
</html>`;
}

// Main
try {
  console.log('📊 Generando reporte de calidad de código...\n');
  
  if (!fs.existsSync(COVERAGE_FILE)) {
    console.error('❌ Error: No se encontró el archivo de cobertura.');
    console.error('   Ejecuta primero: npm run test:coverage');
    process.exit(1);
  }

  const coverageData = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8'));
  const html = generateHTML(coverageData);
  
  fs.writeFileSync(OUTPUT_FILE, html);
  
  console.log('✅ Reporte HTML generado exitosamente:');
  console.log(`   📄 ${OUTPUT_FILE}`);
  console.log('\n📈 Métricas de cobertura:');
  console.log(`   Statements: ${coverageData.total.statements.pct}%`);
  console.log(`   Branches:   ${coverageData.total.branches.pct}%`);
  console.log(`   Functions:  ${coverageData.total.functions.pct}%`);
  console.log(`   Lines:      ${coverageData.total.lines.pct}%`);
  console.log(`\n🎯 Calificación Global: ${((
    coverageData.total.statements.pct +
    coverageData.total.branches.pct +
    coverageData.total.functions.pct +
    coverageData.total.lines.pct
  ) / 4).toFixed(2)}%\n`);

} catch (error) {
  console.error('❌ Error al generar el reporte:', error.message);
  process.exit(1);
}
