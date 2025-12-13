const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración de entorno
const SONAR_CONFIG = {
  url: process.env.SONAR_URL || 'http://localhost:9000',
  token: process.env.SONAR_TOKEN || 'sqa_b6df0791d826ed92ba2534146d61a7f2a6dd1bad',
  component: process.env.SONAR_PROJECT_KEY || 'LibelulaSoft_Tarjetas',
  project: process.env.SONAR_PROJECT_NAME || 'LibelulaSoft Tarjetas',
  application: process.env.SONAR_PROJECT_NAME || 'LibelulaSoft Tarjetas',
  release: process.env.SONAR_PROJECT_VERSION || '1.0.0',
};

const OUTPUT_DIR = process.env.OUTPUT_DIR || path.resolve(__dirname, '..');

// --- API FUNCTIONS ---

async function fetchSonarMetrics() {
  console.log('Obteniendo métricas...');
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  try {
    const metrics = [
      'bugs', 'vulnerabilities', 'code_smells', 'security_hotspots',
      'coverage', 'duplicated_lines_density', 'ncloc',
      'sqale_index', 'reliability_rating', 'security_rating', 'sqale_rating',
      'alert_status', 'complexity', 'cognitive_complexity',
      'lines', 'functions', 'classes', 'files',
      'comment_lines_density'
    ];

    const response = await axios.get(`${SONAR_CONFIG.url}/api/measures/component`, {
      params: { component: SONAR_CONFIG.component, metricKeys: metrics.join(',') },
      headers
    });

    const measures = {};
    if (response.data.component && response.data.component.measures) {
      response.data.component.measures.forEach(m => measures[m.metric] = m.value);
    }
    return measures;
  } catch (error) {
    console.warn('Error fetching metrics:', error.message);
    return {};
  }
}

async function fetchIssuesBySeverity() {
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

async function fetchTopFiles() {
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  try {
    const response = await axios.get(`${SONAR_CONFIG.url}/api/measures/component_tree`, {
      params: {
        component: SONAR_CONFIG.component,
        metricKeys: 'complexity,bugs,vulnerabilities,code_smells',
        qualifiers: 'FIL',
        ps: 10,
        s: 'metric',
        metricSort: 'complexity',
        asc: false
      },
      headers
    });

    if (!response.data.components) return [];

    return response.data.components.map(file => {
      const ms = {};
      file.measures.forEach(m => ms[m.metric] = m.value);
      return {
        name: file.name,
        complexity: ms.complexity || 0,
        bugs: ms.bugs || 0,
        vulnerabilities: ms.vulnerabilities || 0,
        code_smells: ms.code_smells || 0
      };
    });
  } catch (err) {
    console.warn('Error fetching Top Files:', err.message);
    return [];
  }
}

async function fetchQualityTrends() {
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  try {
    const response = await axios.get(`${SONAR_CONFIG.url}/api/measures/search_history`, {
      params: { component: SONAR_CONFIG.component, metrics: 'bugs,coverage', ps: 30 },
      headers
    });

    const trends = {};
    if (response.data.measures) {
      response.data.measures.forEach(measure => {
        trends[measure.metric] = measure.history.map(point => ({
          date: new Date(point.date).toLocaleDateString('es-ES'),
          value: parseFloat(point.value || 0)
        }));
      });
    }
    return trends;
  } catch (err) {
    console.warn('Error fetching trends:', err.message);
    return {};
  }
}

// [NEW] Get Specific Actionable Issues
async function fetchLatestIssues() {
  console.log('Obteniendo detalles de issues críticos...');
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  try {
    const response = await axios.get(`${SONAR_CONFIG.url}/api/issues/search`, {
      params: {
        componentKeys: SONAR_CONFIG.component,
        severities: 'BLOCKER,CRITICAL,MAJOR',
        resolved: false,
        ps: 8, // Top 8
        s: 'CREATION_DATE',
        asc: false
      },
      headers
    });

    if (!response.data.issues) return [];

    return response.data.issues.map(issue => ({
      message: issue.message,
      component: issue.component.split(':').pop(), // Simple filename
      severity: issue.severity,
      line: issue.line || '-',
      type: issue.type
    }));
  } catch (err) {
    console.warn('Error fetching specific issues:', err.message);
    return [];
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
function generateHTML(metrics, issuesBreakdown, topFiles, trends, criticalIssues) {
  const logoBase64 = getLogoBase64();
  const date = new Date().toLocaleDateString('es-ES', { dateStyle: 'long' });
  const bugs = metrics.bugs || 0;
  const coverage = parseFloat(metrics.coverage || 0).toFixed(1);
  const rating = (val) => ({ '1.0': 'A', '2.0': 'B', '3.0': 'C', '4.0': 'D', '5.0': 'E' }[parseFloat(val).toFixed(1)] || 'A');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte Detallado - ${SONAR_CONFIG.project}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fff; color: #333; }
    .page { padding: 30px; max-width: 210mm; margin: 0 auto; min-height: 290mm; box-sizing: border-box; }
    .page-break { page-break-after: always; }
    
    /* Header Style */
    .header { background: linear-gradient(135deg, #1565C0 0%, #1E88E5 100%); color: white; padding: 25px 40px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header h1 { margin: 0; font-size: 24px; font-weight: 300; }
    .header .meta { font-size: 14px; opacity: 0.9; margin-top: 5px; }
    .header img { height: 50px; background: white; padding: 5px; border-radius: 4px; }
    
    .section-title { color: #1565C0; border-bottom: 2px solid #E3F2FD; padding-bottom: 8px; margin: 25px 0 15px; font-size: 18px; font-weight: 600; }
    
    /* Metrics Grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
    .kpi-card { background: #F8F9FA; border: 1px solid #E0E0E0; padding: 15px; border-radius: 6px; text-align: center; }
    .kpi-val { font-size: 28px; font-weight: bold; color: #2C3E50; display: block; }
    .kpi-label { font-size: 12px; color: #7F8C8D; text-transform: uppercase; letter-spacing: 0.5px; }
    
    /* Tables */
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
    th { background: #F1F4F8; color: #5B6B79; font-weight: 600; text-align: left; padding: 10px; border-bottom: 2px solid #D5DBDB; }
    td { padding: 8px 10px; border-bottom: 1px solid #EEEEEE; color: #444; }
    tr:last-child td { border-bottom: none; }
    
    .badge { padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; color: white; display: inline-block; }
    .bg-red { background: #E74C3C; }
    .bg-orange { background: #F39C12; }
    .bg-blue { background: #3498DB; }
    .bg-green { background: #27AE60; }
    
    /* Issues List */
    .issue-item { border-left: 3px solid #ddd; padding: 8px 12px; margin-bottom: 8px; background: #fafafa; }
    .issue-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #666; }
    .issue-msg { font-weight: 500; font-size: 13px; color: #333; }
    .issue-loc { font-family: monospace; color: #1565C0; }

    .chart-container { height: 200px; border: 1px solid #eee; padding: 10px; border-radius: 4px; }
  </style>
</head>
<body>

  <!-- PAGE 1: OVERVIEW -->
  <div class="page">
    <div class="header">
      <div>
        <h1>Reporte de Calidad de Software</h1>
        <div class="meta">${SONAR_CONFIG.project} • ${date}</div>
      </div>
      ${logoBase64 ? `<img src="${logoBase64}" />` : ''}
    </div>

    <!-- Executive KPI -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">Reliability</span>
        <span class="kpi-val" style="color: ${rating(metrics.reliability_rating) === 'A' ? '#27AE60' : '#E74C3C'}">${rating(metrics.reliability_rating)}</span>
        <small style="color:#777">${bugs} Bugs</small>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Security</span>
        <span class="kpi-val" style="color: ${rating(metrics.security_rating) === 'A' ? '#27AE60' : '#E74C3C'}">${rating(metrics.security_rating)}</span>
        <small style="color:#777">${metrics.vulnerabilities} Vulns</small>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Maintainability</span>
        <span class="kpi-val">${rating(metrics.sqale_rating)}</span>
        <small style="color:#777">${metrics.code_smells} Smells</small>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Cobertura</span>
        <span class="kpi-val" style="color: ${coverage >= 80 ? '#27AE60' : '#F39C12'}">${coverage}%</span>
        <small style="color:#777">${metrics.lines} Líneas</small>
      </div>
    </div>

    <!-- Latest Critical Issues (NEW DETAIL) -->
    <h2 class="section-title">⚠️ Issues Críticos Recientes (Actionable Items)</h2>
    <div style="margin-bottom: 30px;">
      ${criticalIssues.length === 0 ? '<p>No hay issues críticos recientes.</p>' :
      criticalIssues.map(i => `
          <div class="issue-item" style="border-left-color: ${i.severity === 'BLOCKER' ? '#E74C3C' : '#F39C12'}">
            <div class="issue-header">
              <span><span class="badge ${i.severity === 'BLOCKER' ? 'bg-red' : 'bg-orange'}">${i.severity}</span> ${i.type}</span>
              <span class="issue-loc">${i.component}:${i.line}</span>
            </div>
            <div class="issue-msg">${i.message}</div>
          </div>
        `).join('')
    }
    </div>

    <!-- Top Files Table -->
    <h2 class="section-title">📂 Archivos Más Complejos</h2>
    <table>
      <thead><tr><th>Archivo</th><th>Complejidad</th><th>Bugs</th><th>Vulns</th></tr></thead>
      <tbody>
        ${topFiles.map(f => `
          <tr>
            <td style="font-family:monospace">${f.name}</td>
            <td><b>${f.complexity}</b></td>
            <td>${f.bugs > 0 ? `<span class="badge bg-red">${f.bugs}</span>` : '0'}</td>
            <td>${f.vulnerabilities > 0 ? `<span class="badge bg-red">${f.vulnerabilities}</span>` : '0'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- PAGE 2: CHARTS & TRENDS -->
  <div class="page page-break">
    <div class="header">
      <div>
        <h1>Análisis de Tendencias</h1>
        <div class="meta">Evolución Histórica</div>
      </div>
      ${logoBase64 ? `<img src="${logoBase64}" />` : ''}
    </div>

    <h2 class="section-title">Distribución de Severidad</h2>
    <div style="height: 250px; margin-bottom: 30px;">
        <canvas id="severityChart"></canvas>
    </div>

    <h2 class="section-title">Histórico de Calidad (Últimos 30 análisis)</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div class="chart-container">
        <canvas id="bugsTrend"></canvas>
      </div>
      <div class="chart-container">
        <canvas id="covTrend"></canvas>
      </div>
    </div>
  </div>

  <script>
    Chart.defaults.font.family = 'Segoe UI';
    
    // 1. Severity
    new Chart(document.getElementById('severityChart'), {
      type: 'bar',
      data: {
        labels: ['Blocker', 'Critical', 'Major', 'Minor', 'Info'],
        datasets: [{
          label: 'Issues',
          data: [${issuesBreakdown.BLOCKER}, ${issuesBreakdown.CRITICAL}, ${issuesBreakdown.MAJOR}, ${issuesBreakdown.MINOR}, ${issuesBreakdown.INFO}],
          backgroundColor: ['#C0392B', '#E74C3C', '#E67E22', '#3498DB', '#95A5A6']
        }]
      },
      options: { plugins: { legend: {display:false} }, scales: { y: { beginAtZero: true } }, maintainAspectRatio: false }
    });

    // 2. Trends
    const dates = ${(JSON.stringify(trends.bugs || []))}.map(d => d.date);
    
    new Chart(document.getElementById('bugsTrend'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Bugs',
          data: ${(JSON.stringify(trends.bugs || []))}.map(d => d.value),
          borderColor: '#C0392B',
          fill: true,
          backgroundColor: 'rgba(192, 57, 43, 0.1)'
        }]
      },
      options: { plugins: { title: {display:true, text:'Evolución de Bugs'} }, scales: { x: {display:false} }, maintainAspectRatio: false }
    });

    new Chart(document.getElementById('covTrend'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Cobertura',
          data: ${(JSON.stringify(trends.coverage || []))}.map(d => d.value),
          borderColor: '#27AE60',
          fill: true,
          backgroundColor: 'rgba(39, 174, 96, 0.1)'
        }]
      },
      options: { plugins: { title: {display:true, text:'% Cobertura'} }, scales: { x: {display:false}, y: {min:0, max:100} }, maintainAspectRatio: false }
    });
  </script>
</body>
</html>
  `;
}

// MAIN
async function generateReport() {
  console.log('Generando reporte detallado...');
  try {
    const [metrics, issues, topFiles, trends, criticalIssues] = await Promise.all([
      fetchSonarMetrics(),
      fetchIssuesBySeverity(),
      fetchTopFiles(),
      fetchQualityTrends(),
      fetchLatestIssues()
    ]);

    const html = generateHTML(metrics, issues, topFiles, trends, criticalIssues);
    fs.writeFileSync(path.resolve(OUTPUT_DIR, 'sonar-professional-report.html'), html);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve(OUTPUT_DIR, 'sonar-professional-report.html')}`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: path.resolve(OUTPUT_DIR, 'sonar-professional-report.pdf'),
      format: 'A4',
      printBackground: true
    });
    await browser.close();
    console.log('PDF Generado.');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

generateReport();
