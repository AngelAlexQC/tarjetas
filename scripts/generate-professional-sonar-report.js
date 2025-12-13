const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración desde variables de entorno
const SONAR_CONFIG = {
  url: process.env.SONAR_URL || 'http://localhost:9000',
  token: process.env.SONAR_TOKEN || 'sqa_b6df0791d826ed92ba2534146d61a7f2a6dd1bad',
  component: process.env.SONAR_PROJECT_KEY || 'LibelulaSoft_Tarjetas',
  project: process.env.SONAR_PROJECT_NAME || 'LibelulaSoft Tarjetas',
  application: process.env.SONAR_PROJECT_NAME || 'LibelulaSoft Tarjetas',
  release: process.env.SONAR_PROJECT_VERSION || '1.0.0',
};

const OUTPUT_DIR = process.env.OUTPUT_DIR || path.resolve(__dirname, '..');
const RUN_ID = process.env.GITHUB_RUN_ID || Math.floor(Math.random() * 10000).toString();

// --- API FETCHING FUNCTIONS (MAXIMUM DETAIL) ---

async function fetchSonarMetrics() {
  console.log('Obteniendo métricas completas de SonarQube...');
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  // RESTORED: Full list of metrics from previous detailed implementations
  const metrics = [
    'bugs', 'vulnerabilities', 'code_smells', 'security_hotspots',
    'coverage', 'file_complexity', 'duplicated_lines_density',
    'ncloc', 'lines', 'statements', 'classes', 'functions', 'files',
    'sqale_index', 'reliability_rating', 'security_rating', 'sqale_rating',
    'alert_status', 'complexity', 'cognitive_complexity',
    'comment_lines_density', 'lines_to_cover',
    'blocker_violations', 'critical_violations', 'major_violations', 'minor_violations', 'info_violations'
  ];

  try {
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
  console.log('Analizando distribución de severidad...');
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

// RESTORED: Critical Issues List
async function fetchLatestIssues() {
  console.log('Obteniendo issues críticos detallados...');
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  try {
    const response = await axios.get(`${SONAR_CONFIG.url}/api/issues/search`, {
      params: {
        componentKeys: SONAR_CONFIG.component,
        severities: 'BLOCKER,CRITICAL,MAJOR',
        resolved: false,
        ps: 10,
        s: 'CREATION_DATE',
        asc: false,
        additionalFields: 'rules' // Ensure we get rule names if needed
      },
      headers
    });

    if (!response.data.issues) return [];

    return response.data.issues.map(issue => ({
      message: issue.message,
      component: issue.component.split(':').pop(),
      severity: issue.severity,
      line: issue.line || '-',
      type: issue.type,
      rule: issue.rule
    }));
  } catch (err) {
    console.warn('Error fetching specific issues:', err.message);
    return [];
  }
}

async function fetchTopFiles() {
  console.log('Identificando Hotspots...');
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  try {
    const response = await axios.get(`${SONAR_CONFIG.url}/api/measures/component_tree`, {
      params: {
        component: SONAR_CONFIG.component,
        metricKeys: 'complexity,bugs,vulnerabilities,code_smells,coverage,ncloc',
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
        code_smells: ms.code_smells || 0,
        coverage: parseFloat(ms.coverage || 0),
        lines: ms.ncloc || 0
      };
    });
  } catch (error) {
    console.warn('No se pudieron obtener Top Files:', error.message);
    return [];
  }
}

async function fetchQualityTrends() {
  console.log('Obteniendo tendencias históricas...');
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  try {
    const metrics = ['bugs', 'vulnerabilities', 'code_smells', 'coverage', 'sqale_index'];
    const response = await axios.get(`${SONAR_CONFIG.url}/api/measures/search_history`, {
      params: {
        component: SONAR_CONFIG.component,
        metrics: metrics.join(','),
        ps: 30
      },
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

function formatTechDebt(minutes) {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 8) return `${hours} h`;
  const days = Math.floor(hours / 8);
  return `${days} d`;
}

function getRatingLetter(rating) {
  const r = parseFloat(rating);
  if (r <= 1) return 'A';
  if (r <= 2) return 'B';
  if (r <= 3) return 'C';
  if (r <= 4) return 'D';
  return 'E';
}

function getConclusion(metrics, alertStatus) {
  const bugs = parseInt(metrics.bugs || 0);
  const vulns = parseInt(metrics.vulnerabilities || 0);
  const coverage = parseFloat(metrics.coverage || 0);

  if (alertStatus === 'ERROR') return 'El proyecto no cumple con los estándares de calidad mínimos (Quality Gate Bloqueado). Se requiere atención inmediata en issues bloqueantes/críticos.';
  if (vulns > 0) return `Se detectaron ${vulns} vulnerabilidades de seguridad. Aunque el Quality Gate aprueba, se recomienda revisión prioritaria.`;
  if (bugs > 10) return `Estabilidad comprometida por ${bugs} bugs detectados. Se sugiere sprint de estabilización.`;
  if (coverage < 80) return `La cobertura de pruebas (${coverage.toFixed(1)}%) puede mejorarse para garantizar la robustez a largo plazo.`;
  return 'Excelente estado de salud del código. Mantener las prácticas actuales.';
}

// --- HTML GENERATOR ---
function generateProfessionalHTML(metrics, issuesBySeverity, topFiles, trends, criticalIssues) {
  const logoBase64 = getLogoBase64();
  const dateFormatted = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const alertStatus = metrics.alert_status || 'OK';

  // Safe parsing
  const bugs = parseInt(metrics.bugs || 0);
  const vulns = parseInt(metrics.vulnerabilities || 0);
  const smells = parseInt(metrics.code_smells || 0);
  const coverage = parseFloat(metrics.coverage || 0);
  const complexity = parseInt(metrics.complexity || 0);
  const duplicated = parseFloat(metrics.duplicated_lines_density || 0);

  const relRating = getRatingLetter(metrics.reliability_rating);
  const secRating = getRatingLetter(metrics.security_rating);
  const sqaleRating = getRatingLetter(metrics.sqale_rating);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte ${SONAR_CONFIG.project}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, map-sans-serif; background: #fff; color: #333; margin: 0; padding: 0; font-size: 10pt; }
    @page { size: A4; margin: 15mm; }
    .page { padding: 30px; min-height: 270mm; position: relative; }
    .page-break { page-break-after: always; }

    /* HEADER */
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
      color: white; padding: 25px 40px; border-radius: 0 0 10px 10px; margin: -30px -30px 30px -30px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .header h1 { font-size: 20pt; margin: 0; font-weight: 400; }
    .header .sub { font-size: 10pt; opacity: 0.8; margin-top: 5px; }
    .logo { height: 45px; background: white; padding: 4px; border-radius: 4px; }

    /* SECTION HEADERS */
    h2 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 14pt; margin-top: 25px; margin-bottom: 15px; }

    /* EXECUTIVE */
    .summary-box { background: #f8fafc; border-left: 5px solid ${alertStatus === 'OK' ? '#22c55e' : '#ef4444'}; padding: 15px; border-radius: 4px; font-size: 10pt; margin-bottom: 20px; }
    
    /* KPI GRID */
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
    .kpi { background: white; border: 1px solid #e2e8f0; padding: 15px; text-align: center; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .kpi-val { font-size: 24pt; font-weight: 700; color: #1e293b; display: block; line-height: 1.2; }
    .kpi-lbl { font-size: 8pt; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    .rating { font-weight: bold; padding: 2px 6px; border-radius: 3px; color: white; display: inline-block; font-size: 10pt; vertical-align: middle; }
    .rating-A { background: #22c55e; } .rating-B { background: #a3e635; } .rating-C { background: #facc15; } .rating-D { background: #fb923c; } .rating-E { background: #ef4444; }

    /* ISSUES LIST */
    .issue-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    .issue-table th { background: #f1f5f9; text-align: left; padding: 8px; color: #475569; }
    .issue-table td { border-bottom: 1px solid #e2e8f0; padding: 8px; vertical-align: top; }
    .severity-tag { font-size: 7pt; padding: 2px 5px; border-radius: 3px; color: white; font-weight: bold; }
    .sev-BLOCKER { background: #991b1b; } .sev-CRITICAL { background: #dc2626; } .sev-MAJOR { background: #ea580c; }
    
    /* CHARTS */
    .chart-box { height: 200px; border: 1px solid #eee; padding: 10px; border-radius: 4px; }
    
    /* FOOTER */
    .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; color: #94a3b8; font-size: 8pt; }
    
  </style>
</head>
<body>

<!-- PAGE 1: OVERVIEW -->
<div class="page">
  <div class="header">
    <div>
      <h1>Informe de Clean Code y Seguridad</h1>
      <div class="sub">${SONAR_CONFIG.project} • ${dateFormatted}</div>
    </div>
    ${logoBase64 ? `<img src="${logoBase64}" class="logo"/>` : ''}
  </div>

  <div class="summary-box">
    <strong>Estado: ${alertStatus === 'OK' ? 'APROBADO' : 'FALLIDO'}</strong><br/>
    ${getConclusion(metrics, alertStatus)}
  </div>

  <h2>Métricas Principales</h2>
  <div class="kpi-row">
    <div class="kpi">
      <span class="kpi-lbl">Bugs / Fiabilidad</span>
      <span class="kpi-val" style="color: ${bugs > 0 ? '#dc2626' : '#22c55e'}">${bugs}</span>
      <span class="rating rating-${relRating}">${relRating}</span>
    </div>
    <div class="kpi">
      <span class="kpi-lbl">Vulns / Seguridad</span>
      <span class="kpi-val" style="color: ${vulns > 0 ? '#dc2626' : '#22c55e'}">${vulns}</span>
      <span class="rating rating-${secRating}">${secRating}</span>
    </div>
    <div class="kpi">
      <span class="kpi-lbl">Smells / Mant.</span>
      <span class="kpi-val">${smells}</span>
      <span class="rating rating-${sqaleRating}">${sqaleRating}</span>
    </div>
    <div class="kpi">
      <span class="kpi-lbl">Cobertura</span>
      <span class="kpi-val" style="color: ${coverage >= 80 ? '#22c55e' : '#f59e0b'}">${coverage.toFixed(1)}%</span>
      <span class="kpi-lbl">${metrics.lines_to_cover || 0} líneas</span>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi"><span class="kpi-lbl">Deuda Técnica</span><span class="kpi-val" style="font-size: 16pt">${formatTechDebt(metrics.sqale_index)}</span></div>
    <div class="kpi"><span class="kpi-lbl">Duplicidad</span><span class="kpi-val" style="font-size: 16pt">${duplicated.toFixed(1)}%</span></div>
    <div class="kpi"><span class="kpi-lbl">Complejidad</span><span class="kpi-val" style="font-size: 16pt">${complexity}</span></div>
    <div class="kpi"><span class="kpi-lbl">Líneas Código</span><span class="kpi-val" style="font-size: 16pt">${parseInt(metrics.ncloc || 0).toLocaleString()}</span></div>
  </div>

  <h2>Issues Críticos (Para Acción Inmediata)</h2>
  <table class="issue-table">
    <thead><tr><th width="10%">Sev</th><th width="30%">Ubicación</th><th width="60%">Problema</th></tr></thead>
    <tbody>
      ${criticalIssues.length === 0 ? '<tr><td colspan="3" align="center">Clean Code 🍃 - No hay issues críticos</td></tr>' :
      criticalIssues.map(i => `
          <tr>
            <td><span class="severity-tag sev-${i.severity}">${i.severity}</span></td>
            <td style="font-family:consolas; color:#475569;">${i.component}<br/><small>Línea ${i.line}</small></td>
            <td><b>${i.message}</b><br/><small style="color:#64748b">${i.type}</small></td>
          </tr>
        `).join('')
    }
    </tbody>
  </table>
  
  <div class="footer">ID Ejecución: ${RUN_ID} • LibelulaSoft Quality Assurance</div>
</div>

<!-- PAGE 2: CHARTS & FILES -->
<div class="page page-break">
  <div class="header">
    <div><h1>Análisis Profundo</h1><div class="sub">Tendencias y Hotspots</div></div>
    ${logoBase64 ? `<img src="${logoBase64}" class="logo"/>` : ''}
  </div>

  <h2>Distribución de Problemas</h2>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div class="chart-box"><canvas id="severityChart"></canvas></div>
    <div class="chart-box"><canvas id="typeChart"></canvas></div>
  </div>

  <h2>Archivos Más Complejos (Top Offenders)</h2>
  <table class="issue-table">
    <thead><tr><th>Archivo</th><th>Complejidad</th><th>Issues</th><th>Cobertura</th></tr></thead>
    <tbody>
      ${topFiles.map(f => `
        <tr>
          <td style="font-family:consolas">${f.name}</td>
          <td><b>${f.complexity}</b></td>
          <td>
            ${f.bugs > 0 ? `<span style="color:#dc2626">🐞 ${f.bugs}</span>` : ''} 
            ${f.vulnerabilities > 0 ? `<span style="color:#ea580c">🔓 ${f.vulnerabilities}</span>` : ''}
          </td>
          <td>${f.coverage.toFixed(1)}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Tendencias (Últimos 30 Análisis)</h2>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div class="chart-box"><canvas id="trendBugs"></canvas></div>
    <div class="chart-box"><canvas id="trendCov"></canvas></div>
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
        data: [${issuesBySeverity.BLOCKER}, ${issuesBySeverity.CRITICAL}, ${issuesBySeverity.MAJOR}, ${issuesBySeverity.MINOR}, ${issuesBySeverity.INFO}],
        backgroundColor: ['#7f1d1d', '#dc2626', '#ea580c', '#3b82f6', '#94a3b8']
      }]
    },
    options: { plugins: { title: {display:true, text:'Por Severidad'}, legend:{display:false} }, maintainAspectRatio: false }
  });

  // 2. Type
  new Chart(document.getElementById('typeChart'), {
    type: 'doughnut',
    data: {
      labels: ['Bugs', 'Vulns', 'Smells'],
      datasets: [{
        data: [${metrics.bugs}, ${metrics.vulnerabilities}, ${metrics.code_smells}],
        backgroundColor: ['#dc2626', '#ea580c', '#3b82f6']
      }]
    },
    options: { plugins: { title: {display:true, text:'Por Tipo'}, legend:{position:'right'} }, maintainAspectRatio: false }
  });
  
  // 3. Trends
  const dates = ${(JSON.stringify(trends.bugs || []))}.map(d => d.date);
  new Chart(document.getElementById('trendBugs'), {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{ label: 'Bugs', data: ${(JSON.stringify(trends.bugs || []))}.map(d => d.value), borderColor: '#dc2626', backgroundColor: '#fef2f2', fill:true }]
    },
    options: { plugins: { legend:{display:false}, title:{display:true, text:'Evolución de Bugs'} }, scales:{x:{display:false}}, maintainAspectRatio: false }
  });
  
  new Chart(document.getElementById('trendCov'), {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{ label: 'Cobertura', data: ${(JSON.stringify(trends.coverage || []))}.map(d => d.value), borderColor: '#22c55e', backgroundColor: '#f0fdf4', fill:true }]
    },
    options: { plugins: { legend:{display:false}, title:{display:true, text:'Cobertura %'} }, scales:{x:{display:false}, y:{min:0, max:100}}, maintainAspectRatio: false }
  });
</script>
</body>
</html>
  `;
}

// MAIN
async function generateFinalReport() {
  console.log('|-- Inicio Generación Reporte Profesional Completo --|');
  try {
    const [metrics, issuesSev, topFiles, trends, criticalIssues] = await Promise.all([
      fetchSonarMetrics(),
      fetchIssuesBySeverity(),
      fetchTopFiles(),
      fetchQualityTrends(),
      fetchLatestIssues()
    ]);

    // Generate Filename
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `sonar-report-${dateStr}-${RUN_ID}.pdf`;

    // Create Content
    const html = generateProfessionalHTML(metrics, issuesSev, topFiles, trends, criticalIssues);
    fs.writeFileSync(path.resolve(OUTPUT_DIR, 'sonar-professional-report.html'), html);

    // PDF 
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve(OUTPUT_DIR, 'sonar-professional-report.html')}`, { waitUntil: 'networkidle0' });

    const pdfPath = path.resolve(OUTPUT_DIR, fileName);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });

    await browser.close();
    console.log(`PDF Generado con éxito: ${pdfPath}`);

    // Create a generic copy for easier fetching if needed, OR relies on wildcard upload
    // But keeping the unique name is key.
  } catch (e) {
    console.error('Failure:', e);
    process.exit(1);
  }
}

generateFinalReport();
