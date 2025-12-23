/* eslint-env node */
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

// --- API FETCHING FUNCTIONS ---

async function fetchSonarMetrics() {
  console.log('Obteniendo métricas completas...');
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const metrics = [
    'bugs', 'vulnerabilities', 'code_smells', 'security_hotspots',
    'coverage', 'duplicated_lines_density', 'ncloc',
    'sqale_index', 'reliability_rating', 'security_rating', 'sqale_rating',
    'alert_status', 'complexity', 'cognitive_complexity',
    'lines', 'functions', 'classes', 'files',
    'comment_lines_density', 'lines_to_cover'
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
        asc: false
      },
      headers
    });

    if (!response.data.issues) return [];

    return response.data.issues.map(issue => ({
      message: issue.message,
      component: issue.component.split(':').pop(),
      severity: issue.severity,
      line: issue.line || '-',
      type: issue.type
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
        metricKeys: 'complexity,bugs,vulnerabilities,code_smells,coverage',
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
        coverage: parseFloat(ms.coverage || 0) // Fix for TypeError
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
    const metrics = ['bugs', 'vulnerabilities', 'code_smells', 'coverage'];
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

function getConclusion(bugs, vulnerabilities, codeSmells, coverage, reliabilityRating) {
  const hasHighRisk = bugs > 5 || vulnerabilities > 0;
  const hasMediumRisk = bugs > 0 || codeSmells > 100 || coverage < 60;

  if (hasHighRisk) {
    return `El análisis revela áreas críticas. Con ${bugs} bugs y ${vulnerabilities} vulnerabilidades, se recomienda un plan de acción inmediato.`;
  } else if (hasMediumRisk) {
    return `Calidad aceptable con oportunidades. La calificación ${reliabilityRating} en confiabilidad es buena, pero se debe mejorar la cobertura (${coverage}%).`;
  } else {
    return `Excelente nivel de calidad. Mantener los estándares actuales y revisiones periódicas.`;
  }
}

// --- HTML GENERATOR (Professional Blue Design - Step 576 Refined) ---

function generateProfessionalHTML(metrics, issuesBySeverity, topFiles, trends, criticalIssues) {
  const logoBase64 = getLogoBase64();
  const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  // Safety
  const coverage = parseFloat(metrics.coverage || 0);
  const bugs = parseInt(metrics.bugs || 0);
  const vulnerabilities = parseInt(metrics.vulnerabilities || 0);
  const codeSmells = parseInt(metrics.code_smells || 0);
  const hotspots = parseInt(metrics.security_hotspots || 0);
  const duplication = parseFloat(metrics.duplicated_lines_density || 0);
  const lines = parseInt(metrics.ncloc || 0);
  const techDebt = formatTechDebt(parseInt(metrics.sqale_index || 0));

  const relRating = getRatingLetter(metrics.reliability_rating);
  const secRating = getRatingLetter(metrics.security_rating);
  const mainRating = getRatingLetter(metrics.sqale_rating);
  const alertStatus = metrics.alert_status || 'OK';

  const coverageColor = coverage >= 80 ? '#2E7D32' : coverage >= 60 ? '#F57C00' : '#C62828';
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe - ${SONAR_CONFIG.project}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #212121; font-size: 10pt; line-height: 1.5; }
    .container { max-width: 210mm; margin: 0 auto; }
    .page { padding: 20px 30px; min-height: 270mm; position: relative; }
    .page-break { page-break-after: always; }

    /* PROFESSIONAL HEADER (Blue Gradient - The design user Liked) */
    .report-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 30px 40px;
      margin: -20px -30px 30px -30px;
      display: flex; justify-content: space-between; align-items: flex-start;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header-text { flex: 1; }
    .header-text h1 { font-size: 24pt; font-weight: 300; margin-bottom: 5px; }
    .header-text .subtitle { font-size: 11pt; opacity: 0.9; margin-bottom: 20px; font-weight: 400; }
    
    .header-meta { display: flex; gap: 40px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; font-size: 9pt; }
    .meta-item strong { display: block; font-size: 11pt; }
    .meta-item span { opacity: 0.8; font-size: 8pt; text-transform: uppercase; }

    .header-logo { width: 100px; background: white; padding: 8px; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); margin-left: 20px; }

    /* SECTIONS */
    .section { margin-bottom: 25px; }
    .section-title {
      font-size: 13pt; font-weight: 600; color: #1e3a8a;
      border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;
    }

    /* EXECUTIVE SUMMARY */
    .executive-summary { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; font-size: 9.5pt; text-align: justify; border-radius: 0 4px 4px 0; }

    /* QUALITY GATE */
    .quality-gate { display: flex; align-items: center; gap: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; margin-top: 20px; }
    .gate-status {
      width: 70px; height: 70px; border-radius: 50%; 
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: white; font-size: 10pt;
      background: ${alertStatus === 'OK' ? '#2E7D32' : '#C62828'};
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .gate-info h3 { margin: 0 0 5px; color: #1e3a8a; font-size: 12pt; }
    .gate-info p { margin: 0; font-size: 9pt; color: #666; }

    /* METRICS GRID */
    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; }
    .metric-box { background: white; border: 1px solid #e0e0e0; padding: 15px; text-align: center; border-radius: 6px; }
    .metric-label { font-size: 8pt; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .metric-value { font-size: 22pt; font-weight: 700; color: #333; line-height: 1; }
    .metric-rating {
      display: inline-block; width: 24px; height: 24px; line-height: 24px;
      border-radius: 3px; font-weight: 700; font-size: 10pt; color: white; margin-top: 5px;
    }
    .rating-A { background: #2E7D32; } .rating-B { background: #7CB342; } .rating-C { background: #FBC02D; } .rating-D { background: #E64A19; } .rating-E { background: #C62828; }

    /* ISSUES SNAPSHOT */
    .issue-list { margin-top: 10px; }
    .issue-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 10px; border-left: 3px solid #ccc; background: #f9fafb; margin-bottom: 8px; border-radius: 0 4px 4px 0;
    }
    .issue-row.BLOCKER { border-left-color: #b91c1c; background: #fef2f2; }
    .issue-row.CRITICAL { border-left-color: #dc2626; background: #fff1f2; }
    .issue-row.MAJOR { border-left-color: #ea580c; background: #fff7ed; }
    .issue-content { flex: 1; margin-right: 15px; }
    .issue-msg { font-size: 9pt; color: #1f2937; margin-bottom: 3px; font-weight: 500; }
    .issue-loc { font-size: 8pt; color: #64748b; font-family: consolas, monospace; }
    .issue-meta { text-align: right; }
    .badge { padding: 2px 6px; border-radius: 3px; font-size: 7.5pt; font-weight: 600; color: #fff; }
    .badge-red { background: #ef4444; } .badge-orange { background: #f97316; }

    /* CHARTS */
    .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .chart-container { height: 220px; border: 1px solid #e5e7eb; padding: 10px; border-radius: 4px; }

    /* FOOTER */
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #94a3b8; font-size: 8pt; }

    /* TABS */
    .detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .detail-item { background: #f8fafc; padding: 10px; border-left: 3px solid #cbd5e1; border-radius: 0 4px 4px 0; }
    .detail-item small { display: block; color: #64748b; font-size: 7.5pt; text-transform: uppercase; }
    .detail-item span { display: block; font-size: 12pt; font-weight: 700; color: #334155; }
    
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    th { text-align: left; padding: 10px; background: #f1f5f9; color: #475569; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
  </style>
</head>
<body>

  <!-- PAGE 1 -->
  <div class="container page">
    <div class="report-header">
      <div class="header-text">
        <!-- UPDATED TITLE PER USER REQUEST -->
        <h1>Informe de Clean Code y Seguridad</h1>
        <div class="subtitle">${SONAR_CONFIG.project}</div>
        
        <div class="header-meta">
          <div class="meta-item"><span>Versión</span><strong>${SONAR_CONFIG.release}</strong></div>
          <div class="meta-item"><span>Fecha</span><strong>${date}</strong></div>
          <div class="meta-item"><span>Líneas de Código</span><strong>${lines.toLocaleString()}</strong></div>
          <div class="meta-item"><span>Deuda Técnica</span><strong>${techDebt}</strong></div>
        </div>
      </div>
      ${logoBase64 ? `<img src="${logoBase64}" class="header-logo" alt="Logo"/>` : ''}
    </div>

    <!-- Executive Summary -->
    <div class="section">
      <h2 class="section-title">Resumen Ejecutivo</h2>
      <div class="executive-summary">
        <p>
          El presente informe certifica el análisis de calidad sobre la versión <strong>${SONAR_CONFIG.release}</strong> del proyecto.
          El sistema cuenta con un volumen de <strong>${lines.toLocaleString()}</strong> líneas y una deuda técnica de <strong>${techDebt}</strong>.
          <br/><br/>
          ${getConclusion(bugs, vulnerabilities, codeSmells, coverage, relRating)}
        </p>
      </div>
    </div>

    <!-- Quality Gate -->
    <div class="section">
      <h2 class="section-title">Estado del Quality Gate</h2>
      <div class="quality-gate">
        <div class="gate-status">${alertStatus}</div>
        <div class="gate-info">
          <h3>${alertStatus === 'OK' ? 'El proyecto cumple los estándares de calidad' : 'Quality Gate Fallido'}</h3>
          <p>${alertStatus === 'OK' ? 'Todas las métricas están dentro de los umbrales definidos. El código está listo para producción.' : 'Existen violaciones a los umbrales de calidad definidos.'}</p>
        </div>
      </div>
    </div>

    <!-- Main Metrics -->
    <div class="section">
      <h2 class="section-title">Indicadores Principales</h2>
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="metric-label">Confiabilidad</div>
          <div class="metric-value" style="color: ${bugs > 0 ? '#D32F2F' : '#388E3C'}">${bugs}</div>
          <div class="metric-rating rating-${relRating}">${relRating}</div>
          <div style="font-size:8pt; color:#888; mt-1">Bugs</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Seguridad</div>
          <div class="metric-value" style="color: ${vulnerabilities > 0 ? '#D32F2F' : '#388E3C'}">${vulnerabilities}</div>
          <div class="metric-rating rating-${secRating}">${secRating}</div>
          <div style="font-size:8pt; color:#888; mt-1">Vulnerabilidades</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Mantenibilidad</div>
          <div class="metric-value">${codeSmells}</div>
          <div class="metric-rating rating-${mainRating}">${mainRating}</div>
          <div style="font-size:8pt; color:#888; mt-1">Code Smells</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Cobertura</div>
          <div class="metric-value" style="color: ${coverageColor}">${coverage.toFixed(1)}%</div>
          <div style="font-size: 8pt; color: #888;">${metrics.lines_to_cover || 0} líneas a cubrir</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Duplicación</div>
          <div class="metric-value">${duplication.toFixed(1)}%</div>
          <div style="font-size: 8pt; color: #888;">Densidad</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Hotspots Seg.</div>
          <div class="metric-value">${hotspots}</div>
          <div style="font-size: 8pt; color: #888;">Requieren revisión</div>
        </div>
      </div>
    </div>
    
    <!-- CRITICAL ISSUES (Retained Feature) -->
    <div class="section">
      <h2 class="section-title">Problemas Críticos (Actionable Items)</h2>
      <div class="issue-list">
        ${criticalIssues.length === 0 ? '<p>No se encontraron problemas críticos recientes.</p>' :
      criticalIssues.map(i => `
            <div class="issue-row ${i.severity}">
              <div class="issue-content">
                <div class="issue-msg">${i.message}</div>
                <div class="issue-loc">${i.component} : ${i.line}</div>
              </div>
              <div class="issue-meta">
                <span class="badge ${i.severity === 'BLOCKER' ? 'badge-red' : 'badge-orange'}">${i.severity}</span>
                <div style="font-size: 7.5pt; color: #888; margin-top: 2px;">${i.type}</div>
              </div>
            </div>
          `).join('')
    }
      </div>
    </div>

    <div class="footer">
      <strong>LibelulaSoft</strong> &copy; ${new Date().getFullYear()} • ID Ejecución: ${RUN_ID}
    </div>
  </div>

  <!-- PAGE 2: DETAILS & TRENDS -->
  <div class="container page page-break">
    <div class="report-header" style="margin-bottom: 20px; padding: 20px 40px;">
      <div class="header-text">
        <h1>Análisis Profundo</h1>
        <div class="subtitle">Detalles por archivo y tendencias</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Métricas Técnicas Adicionales</h2>
      <div class="detail-grid">
        <div class="detail-item"><small>Complejidad Total</small><span>${metrics.complexity || 0}</span></div>
        <div class="detail-item"><small>Clases</small><span>${metrics.classes || 0}</span></div>
        <div class="detail-item"><small>Funciones</small><span>${metrics.functions || 0}</span></div>
        <div class="detail-item"><small>Comentarios %</small><span>${parseFloat(metrics.comment_lines_density || 0).toFixed(1)}%</span></div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Top 10 Archivos Más Complejos (Hotspots)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="45%">Archivo</th>
            <th width="15%">Complejidad</th>
            <th width="15%">Bugs</th>
            <th width="15%">Vulns</th>
          </tr>
        </thead>
        <tbody>
          ${topFiles.length === 0 ? '<tr><td colspan="4" align="center">Sin datos disponibles</td></tr>' :
      topFiles.map(f => `
              <tr>
                <td style="font-family:consolas; font-size:8.5pt;">${f.name}</td>
                <td><strong>${f.complexity}</strong></td>
                <td>${f.bugs > 0 ? `<span class="badge badge-red">${f.bugs}</span>` : '0'}</td>
                <td>${f.vulnerabilities > 0 ? `<span class="badge badge-red">${f.vulnerabilities}</span>` : '0'}</td>
              </tr>
            `).join('')
    }
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">Evolución Histórica (Últimos 30 análisis)</h2>
      <div class="chart-row">
        <div class="chart-container">
          <canvas id="bugsTrendChart"></canvas>
        </div>
        <div class="chart-container">
          <canvas id="coverageTrendChart"></canvas>
        </div>
      </div>
    </div>

    <div class="footer">
      Página 2/2 • Documento confidencial
    </div>
  </div>

  <script>
    Chart.defaults.font.family = "'Segoe UI', 'Helvetica Neue', Arial";
    Chart.defaults.font.size = 10;
    
    // Trends - Bugs
    const dates = ${(JSON.stringify(trends.bugs || []))}.map(d => d.date);
    const bugsData = ${(JSON.stringify(trends.bugs || []))}.map(d => d.value);
    
    new Chart(document.getElementById('bugsTrendChart'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Bugs',
          data: bugsData,
          borderColor: '#ef4444',
          tension: 0.2,
          pointRadius: 2,
          fill: true,
          backgroundColor: 'rgba(239, 68, 68, 0.05)'
        }]
      },
      options: { 
        plugins: { title: { display: true, text: 'Bugs encontrados' }, legend: {display: false} },
        scales: { x: { display: false }, y: { beginAtZero: true } }
      }
    });

    // Trends - Coverage
    const covData = ${(JSON.stringify(trends.coverage || []))}.map(d => d.value);
    new Chart(document.getElementById('coverageTrendChart'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Cobertura %',
          data: covData,
          borderColor: '#22c55e',
          tension: 0.2,
          pointRadius: 2,
          fill: true,
          backgroundColor: 'rgba(34, 197, 94, 0.05)'
        }]
      },
      options: { 
        plugins: { title: { display: true, text: 'Cobertura de Código (%)' }, legend: {display: false} },
        scales: { x: { display: false }, y: { min: 0, max: 100 } }
      }
    });
  </script>
</body>
</html>
  `;
}

// MAIN EXECUTION
async function generateProfessionalReport() {
  console.log('|-- Inicio de generación de reporte profesional --|');

  try {
    const [metrics, issues, topFiles, trends, criticalIssues] = await Promise.all([
      fetchSonarMetrics(),
      fetchIssuesBySeverity(),
      fetchTopFiles(),
      fetchQualityTrends(),
      fetchLatestIssues()
    ]);

    // Fixed Filename (as per working version)
    const fileName = 'sonar-professional-report.pdf';

    // Generar contenido HTML
    const htmlContent = generateProfessionalHTML(metrics, issues, topFiles, trends, criticalIssues);
    const htmlPath = path.resolve(OUTPUT_DIR, 'sonar-professional-report.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('-> HTML generado en:', htmlPath);

    // Renderizar PDF con Puppeteer
    console.log('-> Renderizando PDF...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    const pdfPath = path.resolve(OUTPUT_DIR, fileName);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });

    await browser.close();
    console.log(`-> ÉXITO: Reporte creado en ${pdfPath}`);

  } catch (error) {
    console.error('!!! ERROR FATAL !!!', error);
    process.exit(1);
  }
}

generateProfessionalReport();
