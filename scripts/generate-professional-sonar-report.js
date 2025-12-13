const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración desde variables de entorno (para CI/CD) o valores por defecto
const SONAR_CONFIG = {
  url: process.env.SONAR_URL || 'http://localhost:9000',
  token: process.env.SONAR_TOKEN || 'sqa_b6df0791d826ed92ba2534146d61a7f2a6dd1bad',
  component: process.env.SONAR_PROJECT_KEY || 'LibelulaSoft_Tarjetas',
  project: process.env.SONAR_PROJECT_NAME || 'LibelulaSoft Tarjetas',
  application: process.env.SONAR_PROJECT_NAME || 'LibelulaSoft Tarjetas',
  release: process.env.SONAR_PROJECT_VERSION || '1.0.0',
};

const OUTPUT_DIR = process.env.OUTPUT_DIR || path.resolve(__dirname, '..');

// --- API FETCHING FUNCTIONS ---

async function fetchSonarMetrics() {
  console.log('Obteniendo métricas de SonarQube...');

  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const metrics = [
    'bugs', 'vulnerabilities', 'code_smells', 'security_hotspots',
    'coverage', 'duplicated_lines_density', 'ncloc',
    'sqale_index', 'reliability_rating', 'security_rating', 'sqale_rating',
    'alert_status', 'complexity', 'cognitive_complexity',
    'lines', 'functions', 'classes', 'files',
    'comment_lines_density',
    'blocker_violations', 'critical_violations'
  ];

  try {
    const response = await axios.get(`${SONAR_CONFIG.url}/api/measures/component`, {
      params: { component: SONAR_CONFIG.component, metricKeys: metrics.join(',') },
      headers
    });

    const measures = {};
    response.data.component.measures.forEach(m => measures[m.metric] = m.value);
    return measures;
  } catch (error) {
    console.warn('Error fetching metrics:', error.message);
    return {};
  }
}

async function fetchIssuesBySeverity() {
  console.log('Analizando issues por severidad...');
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const severities = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'];
  const issues = {};

  for (const severity of severities) {
    try {
      const response = await axios.get(`${SONAR_CONFIG.url}/api/issues/search`, {
        params: { componentKeys: SONAR_CONFIG.component, severities: severity, ps: 1, resolved: false },
        headers
      });
      issues[severity] = response.data.total || 0;
    } catch {
      issues[severity] = 0;
    }
  }
  return issues;
}

// [NEW] Obtener Top 10 archivos más complejos o con más problemas
async function fetchTopFiles() {
  console.log('Identificando archivos críticos (Top Offenders)...');
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  try {
    const response = await axios.get(`${SONAR_CONFIG.url}/api/measures/component_tree`, {
      params: {
        component: SONAR_CONFIG.component,
        metricKeys: 'complexity,bugs,vulnerabilities,code_smells,coverage',
        qualifiers: 'FIL',
        ps: 10,
        s: 'metric',
        metricSort: 'complexity', // Sort by complexity descending
        asc: false
      },
      headers
    });

    return response.data.components.map(file => {
      const metrics = {};
      file.measures.forEach(m => metrics[m.metric] = m.value);
      return {
        path: file.path,
        name: file.name,
        complexity: metrics.complexity || 0,
        bugs: metrics.bugs || 0,
        vulnerabilities: metrics.vulnerabilities || 0,
        code_smells: metrics.code_smells || 0,
        coverage: metrics.coverage || 0
      };
    });
  } catch (error) {
    console.warn('No se pudieron obtener Top Files:', error.message);
    return [];
  }
}

// [NEW] Obtener Tendencias Históricas
async function fetchQualityTrends() {
  console.log('Obteniendo tendencias históricas...');
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  try {
    const metrics = ['bugs', 'vulnerabilities', 'code_smells', 'coverage'];
    const response = await axios.get(`${SONAR_CONFIG.url}/api/measures/search_history`, {
      params: {
        component: SONAR_CONFIG.component,
        metrics: metrics.join(','),
        ps: 100 // Last 100 analyses
      },
      headers
    });

    // Transform response into easier structure: { metric: [{ date, value }] }
    const trends = {};
    response.data.measures.forEach(measure => {
      trends[measure.metric] = measure.history.map(point => ({
        date: new Date(point.date).toLocaleDateString(),
        value: parseFloat(point.value || 0)
      }));
    });
    return trends;
  } catch (error) {
    console.warn('No se pudieron obtener tendencias:', error.message);
    return {};
  }
}

function getLogoBase64() {
  const logoPath = path.resolve(__dirname, '../LibelulaLogo.png');
  if (fs.existsSync(logoPath)) {
    return `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
  }
  return null;
}

// --- HTML GENERATOR ---

function generateProfessionalHTML(metrics, issuesBySeverity, topFiles, trends) {
  const logoBase64 = getLogoBase64();
  const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  // Helpers
  const getRatingColor = (letter) => ({ 'A': '#2E7D32', 'B': '#7CB342', 'C': '#FBC02D', 'D': '#F57C00', 'E': '#C62828' }[letter] || '#757575');
  const relColor = getRatingColor(getRatingLetter(metrics.reliability_rating));
  const secColor = getRatingColor(getRatingLetter(metrics.security_rating));
  const mainColor = getRatingColor(getRatingLetter(metrics.sqale_rating));

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe de Calidad de Código - ${SONAR_CONFIG.project}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; color: #1F2937; margin: 0; background: #F3F4F6; }
    .page { background: white; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 15mm 20mm; box-sizing: border-box; position: relative; }
    .page-break { page-break-after: always; }
    
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
    .header-logo img { height: 60px; }
    .header-info h1 { margin: 0; font-size: 24px; color: #111827; }
    .header-info p { margin: 5px 0 0; color: #6B7280; font-size: 14px; }
    
    /* Metrics Summary */
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .card { background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .card-title { font-size: 12px; text-transform: uppercase; color: #6B7280; font-weight: 600; margin-bottom: 10px; }
    .card-value { font-size: 32px; font-weight: 700; color: #111827; }
    .rating { display: inline-block; padding: 4px 12px; border-radius: 4px; color: white; font-weight: 700; font-size: 14px; vertical-align: middle; margin-left: 10px; }
    
    /* Charts Area */
    .chart-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .chart-box { height: 250px; position: relative; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    th { text-align: left; padding: 12px; background: #F9FAFB; border-bottom: 2px solid #E5E7EB; color: #374151; }
    td { padding: 10px 12px; border-bottom: 1px solid #E5E7EB; color: #4B5563; }
    tr:last-child td { border-bottom: none; }
    
    .section-title { font-size: 18px; font-weight: 600; color: #1e3a8a; margin: 30px 0 15px; border-left: 4px solid #3B82F6; padding-left: 10px; }
    .meta-tag { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
    .tag-red { background: #FEE2E2; color: #991B1B; }
    .tag-green { background: #D1FAE5; color: #065F46; }
  </style>
</head>
<body>

  <!-- Page 1: Overview & Metrics -->
  <div class="page">
    <div class="header">
      <div class="header-info">
        <h1>Reporte de Calidad de Código</h1>
        <p>${SONAR_CONFIG.project} • Versión ${SONAR_CONFIG.release}</p>
        <p style="font-size: 12px; margin-top: 3px;">Generado el ${date}</p>
      </div>
      <div class="header-logo">
        ${logoBase64 ? `<img src="${logoBase64}" />` : ''}
      </div>
    </div>

    <!-- Executive Summary Cards -->
    <div class="grid">
      <div class="card" style="border-top: 4px solid ${relColor}">
        <div class="card-title">Reliability (Bugs)</div>
        <div>
          <span class="card-value">${metrics.bugs}</span>
          <span class="rating" style="background: ${relColor}">${getRatingLetter(metrics.reliability_rating)}</span>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 5px;">Bugs Confirmados</p>
      </div>
      <div class="card" style="border-top: 4px solid ${secColor}">
        <div class="card-title">Security (Vulns)</div>
        <div>
          <span class="card-value">${metrics.vulnerabilities}</span>
          <span class="rating" style="background: ${secColor}">${getRatingLetter(metrics.security_rating)}</span>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 5px;">Vulnerabilidades</p>
      </div>
      <div class="card" style="border-top: 4px solid ${mainColor}">
        <div class="card-title">Maintainability</div>
        <div>
          <span class="card-value">${metrics.code_smells}</span>
          <span class="rating" style="background: ${mainColor}">${getRatingLetter(metrics.sqale_rating)}</span>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 5px;">Code Smells</p>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Coverage</div>
        <span class="card-value">${parseFloat(metrics.coverage || 0).toFixed(1)}%</span>
        <div style="background: #E5E7EB; border-radius: 4px; height: 6px; width: 100%; margin-top: 10px; overflow: hidden;">
          <div style="background: #10B981; height: 100%; width: ${metrics.coverage}%"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Duplications</div>
        <span class="card-value">${parseFloat(metrics.duplicated_lines_density || 0).toFixed(1)}%</span>
      </div>
      <div class="card">
        <div class="card-title">Hotspots</div>
        <span class="card-value">${metrics.security_hotspots || 0}</span>
      </div>
    </div>

    <div class="section-title">Distribución de Problemas</div>
    <div class="chart-section">
      <div class="card chart-box">
        <canvas id="severityChart"></canvas>
      </div>
      <div class="card chart-box">
        <canvas id="typeChart"></canvas>
      </div>
    </div>
  </div>

  <div class="page page-break">
    <!-- Page 2: Top Offenders & Trends -->
    <div class="header">
      <div class="header-info">
        <h1>Análisis Detallado</h1>
        <p>Archivos Críticos y Tendencias Históricas</p>
      </div>
    </div>

    <!-- Top Files Table -->
    <div class="section-title">Top 10 Archivos Más Complejos (Hotspots)</div>
    <div class="card">
      <table>
        <thead>
          <tr>
            <th width="40%">Archivo</th>
            <th width="15%">Complejidad</th>
            <th width="15%">Bugs</th>
            <th width="15%">Vulns</th>
            <th width="15%">Cobertura</th>
          </tr>
        </thead>
        <tbody>
          ${topFiles.length === 0 ? '<tr><td colspan="5" align="center">No hay datos disponibles</td></tr>' :
      topFiles.map(file => `
              <tr>
                <td style="font-family: monospace; font-size: 11px;">${file.name}</td>
                <td><strong>${file.complexity}</strong></td>
                <td><span class="${file.bugs > 0 ? 'meta-tag tag-red' : 'meta-tag'}">${file.bugs}</span></td>
                <td><span class="${file.vulnerabilities > 0 ? 'meta-tag tag-red' : 'meta-tag'}">${file.vulnerabilities}</span></td>
                <td><span class="${file.coverage < 80 ? 'meta-tag tag-red' : 'meta-tag tag-green'}">${parseFloat(file.coverage).toFixed(1)}%</span></td>
              </tr>
            `).join('')
    }
        </tbody>
      </table>
    </div>

    <!-- Historical Trends -->
    <div class="section-title">Tendencias de Calidad (Últimos Analisis)</div>
    <div class="chart-section">
      <div class="card chart-box">
        <canvas id="bugsTrendChart"></canvas>
      </div>
      <div class="card chart-box">
        <canvas id="coverageTrendChart"></canvas>
      </div>
    </div>
  </div>

  <!-- Charts Logic -->
  <script>
    Chart.defaults.font.family = 'Inter';
    Chart.defaults.color = '#4B5563';
    
    // Severity Chart
    new Chart(document.getElementById('severityChart'), {
      type: 'bar',
      data: {
        labels: ['Blocker', 'Critical', 'Major', 'Minor', 'Info'],
        datasets: [{
          label: 'Issues',
          data: [${issuesBySeverity.BLOCKER}, ${issuesBySeverity.CRITICAL}, ${issuesBySeverity.MAJOR}, ${issuesBySeverity.MINOR}, ${issuesBySeverity.INFO}],
          backgroundColor: ['#991b1b', '#dc2626', '#ea580c', '#fbbf24', '#3b82f6'],
          borderRadius: 4
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Type Chart
    new Chart(document.getElementById('typeChart'), {
      type: 'doughnut',
      data: {
        labels: ['Bugs', 'Vulns', 'Smells'],
        datasets: [{
          data: [${metrics.bugs}, ${metrics.vulnerabilities}, ${metrics.code_smells}],
          backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6']
        }]
      },
      options: { plugins: { legend: { position: 'right' } }, cutout: '70%' }
    });

    // --- Trend Charts (Safe Handling) ---
    const trendDates = ${(JSON.stringify(trends.bugs || []))}.map(d => d.date);
    const bugValues = ${(JSON.stringify(trends.bugs || []))}.map(d => d.value);
    const covValues = ${(JSON.stringify(trends.coverage || []))}.map(d => d.value);

    // Bugs Trend
    new Chart(document.getElementById('bugsTrendChart'), {
      type: 'line',
      data: {
        labels: trendDates,
        datasets: [{
          label: 'Bugs',
          data: bugValues,
          borderColor: '#EF4444',
          tension: 0.3,
          fill: true,
          backgroundColor: 'rgba(239, 68, 68, 0.1)'
        }]
      },
      options: { plugins: { title: { display: true, text: 'Evolución de Bugs' } }, scales: { y: { beginAtZero: true } } }
    });

    // Coverage Trend
    new Chart(document.getElementById('coverageTrendChart'), {
      type: 'line',
      data: {
        labels: trendDates,
        datasets: [{
          label: 'Cobertura %',
          data: covValues,
          borderColor: '#10B981',
          tension: 0.3,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.1)'
        }]
      },
      options: { plugins: { title: { display: true, text: 'Evolución de Cobertura' } }, scales: { y: { min: 0, max: 100 } } }
    });
  </script>
</body>
</html>
  `;
}

function getRatingLetter(val) {
  const v = parseFloat(val);
  if (v < 2) return 'A';
  if (v < 3) return 'B';
  if (v < 4) return 'C';
  if (v < 5) return 'D';
  return 'E';
}

// MAIN EXECUTION
async function generateProfessionalReport() {
  console.log('--- Generando Reporte Avanzado de SonarCloud ---');
  try {
    const [metrics, issues, topFiles, trends] = await Promise.all([
      fetchSonarMetrics(),
      fetchIssuesBySeverity(),
      fetchTopFiles(),
      fetchQualityTrends()
    ]);

    const html = generateProfessionalHTML(metrics, issues, topFiles, trends);
    const htmlPath = path.resolve(OUTPUT_DIR, 'sonar-professional-report.html');
    fs.writeFileSync(htmlPath, html);
    console.log('HTML generado:', htmlPath);

    console.log('Renderizando PDF...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: path.resolve(OUTPUT_DIR, 'sonar-professional-report.pdf'),
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();
    console.log('PDF Generado Exitosamente!');

  } catch (e) {
    console.error('Error fatal:', e);
    process.exit(1);
  }
}

generateProfessionalReport();
