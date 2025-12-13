const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración desde variables de entorno (para CI/CD) o valores por defecto (desarrollo local)
const SONAR_CONFIG = {
  url: process.env.SONAR_URL || 'http://localhost:9000',
  token: process.env.SONAR_TOKEN || 'sqa_b6df0791d826ed92ba2534146d61a7f2a6dd1bad',
  component: process.env.SONAR_PROJECT_KEY || 'LibelulaSoft_Tarjetas',
  project: process.env.SONAR_PROJECT_NAME || 'LibelulaSoft Tarjetas',
  application: process.env.SONAR_PROJECT_NAME || 'LibelulaSoft Tarjetas',
  release: process.env.SONAR_PROJECT_VERSION || '1.0.0',
};

// Directorio de salida (para Docker monta volumen en /app/output)
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.resolve(__dirname, '..');

// Función para obtener métricas detalladas de SonarQube
async function fetchSonarMetrics() {
  console.log('Obteniendo métricas de SonarQube...\n');
  
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };
  
  const metrics = [
    'bugs', 'vulnerabilities', 'code_smells', 'security_hotspots',
    'coverage', 'duplicated_lines_density', 'ncloc',
    'sqale_index', 'reliability_rating', 'security_rating', 'sqale_rating',
    'alert_status', 'complexity', 'cognitive_complexity',
    'lines', 'functions', 'classes', 'files',
    'comment_lines', 'comment_lines_density',
    'violations', 'blocker_violations', 'critical_violations',
    'major_violations', 'minor_violations', 'info_violations'
  ];
  
  try {
    const response = await axios.get(
      `${SONAR_CONFIG.url}/api/measures/component`,
      {
        params: {
          component: SONAR_CONFIG.component,
          metricKeys: metrics.join(',')
        },
        headers
      }
    );
    
    const measures = {};
    response.data.component.measures.forEach(m => {
      measures[m.metric] = m.value;
    });
    
    return measures;
  } catch (error) {
    console.warn('Advertencia: No se pudieron obtener todas las métricas:', error.message);
    return {};
  }
}

// Función para obtener issues por severidad
async function fetchIssuesBySeverity() {
  console.log('Analizando issues por severidad...\n');
  
  const auth = Buffer.from(`${SONAR_CONFIG.token}:`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };
  
  const severities = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'];
  const issuesBySeverity = {};
  
  for (const severity of severities) {
    try {
      const response = await axios.get(
        `${SONAR_CONFIG.url}/api/issues/search`,
        {
          params: {
            componentKeys: SONAR_CONFIG.component,
            severities: severity,
            ps: 1,
            resolved: false
          },
          headers
        }
      );
      issuesBySeverity[severity] = response.data.total || 0;
    } catch (error) {
      issuesBySeverity[severity] = 0;
    }
  }
  
  return issuesBySeverity;
}

// Cargar logo como base64
function getLogoBase64() {
  const logoPath = path.resolve(__dirname, '../LibelulaLogo.png');
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  }
  return null;
}

// Generar HTML corporativo profesional
function generateProfessionalHTML(metrics, issuesBySeverity) {
  const logoBase64 = getLogoBase64();
  const date = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const time = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const coverage = parseFloat(metrics.coverage || 0);
  const coverageColor = coverage >= 80 ? '#2E7D32' : coverage >= 60 ? '#F57C00' : '#C62828';
  
  const bugs = parseInt(metrics.bugs || 0);
  const vulnerabilities = parseInt(metrics.vulnerabilities || 0);
  const codeSmells = parseInt(metrics.code_smells || 0);
  const hotspots = parseInt(metrics.security_hotspots || 0);
  
  const reliabilityRating = getRatingLetter(metrics.reliability_rating);
  const securityRating = getRatingLetter(metrics.security_rating);
  const maintainabilityRating = getRatingLetter(metrics.sqale_rating);
  
  const duplication = parseFloat(metrics.duplicated_lines_density || 0);
  const lines = parseInt(metrics.ncloc || 0);
  const techDebt = formatTechDebt(parseInt(metrics.sqale_index || 0));
  
  const totalIssues = bugs + vulnerabilities + codeSmells;
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Calidad de Código - ${SONAR_CONFIG.project}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 15mm;
    }
    
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: #ffffff;
      color: #212121;
      line-height: 1.6;
      font-size: 10pt;
    }
    
    .container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
    }
    
    .page {
      padding: 20px 30px;
      min-height: 277mm;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    /* Header */
    .report-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 35px 40px;
      margin: -20px -30px 30px -30px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header-text {
      flex: 1;
    }

    .header-logo {
      width: 100px;
      height: auto;
      margin-left: 20px;
      border-radius: 8px;
      background: white;
      padding: 5px;
    }

    .report-header h1 {
      font-size: 24pt;
      font-weight: 300;
      margin-bottom: 5px;
      letter-spacing: -0.5px;
    }

    .report-header .subtitle {
      font-size: 11pt;
      opacity: 0.9;
      font-weight: 400;
    }
    
    .report-metadata {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.2);
      font-size: 9pt;
    }
    
    .metadata-item {
      display: flex;
      justify-content: space-between;
    }
    
    .metadata-label {
      opacity: 0.8;
    }
    
    .metadata-value {
      font-weight: 600;
    }
    
    /* Secciones */
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: 600;
      color: #1e3a8a;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .section-subtitle {
      font-size: 10pt;
      color: #6b7280;
      margin-top: -10px;
      margin-bottom: 15px;
    }
    
    /* Executive Summary */
    .executive-summary {
      background: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin-bottom: 25px;
    }
    
    .executive-summary p {
      margin-bottom: 10px;
      text-align: justify;
    }
    
    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    
    .metric-box {
      background: white;
      border: 1px solid #e5e7eb;
      padding: 18px;
      text-align: center;
    }
    
    .metric-label {
      font-size: 9pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .metric-value {
      font-size: 28pt;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 8px;
    }
    
    .metric-rating {
      display: inline-block;
      width: 36px;
      height: 36px;
      line-height: 36px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 12pt;
      color: white;
      margin-top: 5px;
    }
    
    .rating-A { background: #2E7D32; }
    .rating-B { background: #558B2F; }
    .rating-C { background: #F57C00; }
    .rating-D { background: #E64A19; }
    .rating-E { background: #C62828; }
    
    .metric-description {
      font-size: 8pt;
      color: #9ca3af;
      margin-top: 5px;
    }
    
    /* Tablas */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 9pt;
    }
    
    .data-table thead {
      background: #f3f4f6;
    }
    
    .data-table th {
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #d1d5db;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.5px;
    }
    
    .data-table td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .data-table tbody tr:hover {
      background: #f9fafb;
    }
    
    .data-table tbody tr:last-child td {
      border-bottom: 2px solid #d1d5db;
    }
    
    .severity-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 3px;
      font-weight: 600;
      font-size: 8pt;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .severity-BLOCKER { background: #7f1d1d; }
    .severity-CRITICAL { background: #991b1b; }
    .severity-MAJOR { background: #b45309; }
    .severity-MINOR { background: #1e40af; }
    .severity-INFO { background: #64748b; }
    
    .status-good { color: #2E7D32; font-weight: 600; }
    .status-warning { color: #F57C00; font-weight: 600; }
    .status-critical { color: #C62828; font-weight: 600; }
    
    /* Gráficos */
    .chart-container {
      height: 250px;
      margin-bottom: 20px;
      background: white;
      padding: 15px;
      border: 1px solid #e5e7eb;
    }
    
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
    }
    
    /* Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 25px;
    }
    
    .detail-box {
      background: #f9fafb;
      border-left: 3px solid #3b82f6;
      padding: 12px;
    }
    
    .detail-label {
      font-size: 8pt;
      color: #6b7280;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .detail-value {
      font-size: 16pt;
      font-weight: 700;
      color: #1e3a8a;
    }
    
    /* Footer */
    .report-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 8pt;
    }
    
    .report-footer .company {
      font-weight: 600;
      color: #1e3a8a;
      font-size: 11pt;
      margin-bottom: 5px;
    }
    
    /* Progress Bar */
    .progress-container {
      width: 100%;
      height: 24px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 8px;
    }
    
    .progress-bar {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 8pt;
      font-weight: 600;
      transition: width 0.3s ease;
    }
    
    /* Quality Gate */
    .quality-gate {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      border: 2px solid #e5e7eb;
      margin-bottom: 25px;
    }

    .quality-gate-status {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14pt;
      font-weight: 700;
      color: white;
    }

    .quality-gate-passed { background: #2E7D32; }
    .quality-gate-failed { background: #C62828; }

    .quality-gate-info h3 {
      font-size: 14pt;
      margin-bottom: 5px;
      color: #1e3a8a;
    }

    .quality-gate-info p {
      color: #6b7280;
      font-size: 9pt;
    }

    /* Recommendations */
    .recommendations-list {
      list-style: none;
      padding: 0;
    }

    .recommendations-list li {
      padding: 12px 15px;
      border-left: 3px solid #3b82f6;
      background: #f8fafc;
      margin-bottom: 10px;
      font-size: 9pt;
    }

    .recommendations-list li.priority-high {
      border-left-color: #C62828;
    }

    .recommendations-list li.priority-medium {
      border-left-color: #F57C00;
    }

    .recommendations-list li.priority-low {
      border-left-color: #2E7D32;
    }

    .recommendation-title {
      font-weight: 600;
      color: #1e3a8a;
      margin-bottom: 3px;
    }

    /* Conclusion box */
    .conclusion-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 20px;
      margin-top: 20px;
    }

    .conclusion-box h4 {
      color: #0369a1;
      margin-bottom: 10px;
      font-size: 11pt;
    }

    .conclusion-box p {
      font-size: 9pt;
      text-align: justify;
    }

    @media print {
      .page-break {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="page">
      <!-- Header Principal -->
      <div class="report-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Informe de Calidad de Código</h1>
            <div class="subtitle">${SONAR_CONFIG.project}</div>
          </div>
          ${logoBase64 ? `<img src="${logoBase64}" alt="Libelula Logo" class="header-logo">` : ''}
        </div>
        <div class="report-metadata">
          <div class="metadata-item">
            <span class="metadata-label">Versión:</span>
            <span class="metadata-value">${SONAR_CONFIG.release}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Fecha:</span>
            <span class="metadata-value">${date}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Líneas de Código:</span>
            <span class="metadata-value">${lines.toLocaleString()}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Deuda Técnica:</span>
            <span class="metadata-value">${techDebt}</span>
          </div>
        </div>
      </div>

      <!-- Executive Summary -->
      <div class="section">
        <h2 class="section-title">Resumen Ejecutivo</h2>
        <div class="executive-summary">
          <p>El presente informe detalla el análisis de calidad del código realizado sobre el proyecto ${SONAR_CONFIG.project} versión ${SONAR_CONFIG.release}. El análisis comprende ${lines.toLocaleString()} líneas de código y evalúa aspectos críticos de confiabilidad, seguridad y mantenibilidad.</p>
          <p>Se han identificado un total de ${totalIssues.toLocaleString()} problemas, distribuidos en ${bugs} bugs, ${vulnerabilities} vulnerabilidades de seguridad y ${codeSmells} code smells. La cobertura de pruebas actual es del ${coverage.toFixed(1)}% y se ha detectado un ${duplication.toFixed(1)}% de código duplicado.</p>
          <p>La deuda técnica estimada es de ${techDebt}, con calificaciones de ${reliabilityRating} en confiabilidad, ${securityRating} en seguridad y ${maintainabilityRating} en mantenibilidad.</p>
        </div>
      </div>

      <!-- Quality Gate Status -->
      <div class="section">
        <h2 class="section-title">Estado del Quality Gate</h2>
        <div class="quality-gate">
          <div class="quality-gate-status ${metrics.alert_status === 'OK' ? 'quality-gate-passed' : 'quality-gate-failed'}">
            ${metrics.alert_status === 'OK' ? 'PASSED' : 'FAILED'}
          </div>
          <div class="quality-gate-info">
            <h3>${metrics.alert_status === 'OK' ? 'El proyecto cumple los estándares de calidad' : 'El proyecto requiere atención'}</h3>
            <p>${metrics.alert_status === 'OK'
              ? 'Todas las métricas están dentro de los umbrales definidos. El código está listo para producción.'
              : 'Algunas métricas no cumplen los umbrales establecidos. Se recomienda revisar los issues antes de desplegar.'}</p>
          </div>
        </div>
      </div>

      <!-- Métricas Principales -->
      <div class="section">
        <h2 class="section-title">Indicadores Principales</h2>
        <div class="metrics-grid">
          <div class="metric-box">
            <div class="metric-label">Bugs</div>
            <div class="metric-value" style="color: ${bugs === 0 ? '#2E7D32' : '#C62828'};">${bugs}</div>
            <div class="metric-rating rating-${reliabilityRating}">${reliabilityRating}</div>
            <div class="metric-description">Confiabilidad</div>
          </div>
          
          <div class="metric-box">
            <div class="metric-label">Vulnerabilidades</div>
            <div class="metric-value" style="color: ${vulnerabilities === 0 ? '#2E7D32' : '#C62828'};">${vulnerabilities}</div>
            <div class="metric-rating rating-${securityRating}">${securityRating}</div>
            <div class="metric-description">Seguridad</div>
          </div>
          
          <div class="metric-box">
            <div class="metric-label">Code Smells</div>
            <div class="metric-value" style="color: ${codeSmells < 50 ? '#2E7D32' : codeSmells < 100 ? '#F57C00' : '#C62828'};">${codeSmells}</div>
            <div class="metric-rating rating-${maintainabilityRating}">${maintainabilityRating}</div>
            <div class="metric-description">Mantenibilidad</div>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-box">
            <div class="metric-label">Cobertura</div>
            <div class="metric-value" style="color: ${coverageColor};">${coverage.toFixed(1)}%</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${coverage}%; background: ${coverageColor};">
                ${coverage.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div class="metric-box">
            <div class="metric-label">Duplicación</div>
            <div class="metric-value" style="color: ${duplication < 3 ? '#2E7D32' : duplication < 5 ? '#F57C00' : '#C62828'};">${duplication.toFixed(1)}%</div>
            <div class="metric-description">Código duplicado</div>
          </div>
          
          <div class="metric-box">
            <div class="metric-label">Security Hotspots</div>
            <div class="metric-value" style="color: ${hotspots === 0 ? '#2E7D32' : hotspots < 5 ? '#F57C00' : '#C62828'};">${hotspots}</div>
            <div class="metric-description">Puntos críticos</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Segunda Página -->
    <div class="page page-break">
      <!-- Análisis de Issues por Severidad -->
      <div class="section">
        <h2 class="section-title">Distribución de Issues por Severidad</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Severidad</th>
              <th style="text-align: center;">Cantidad</th>
              <th>Estado</th>
              <th style="text-align: right;">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            ${generateSeverityRows(issuesBySeverity)}
          </tbody>
        </table>
      </div>

      <!-- Gráficos -->
      <div class="section">
        <h2 class="section-title">Análisis Visual</h2>
        <div class="charts-row">
          <div>
            <div class="chart-container">
              <canvas id="severityChart"></canvas>
            </div>
          </div>
          <div>
            <div class="chart-container">
              <canvas id="issuesChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Métricas Técnicas Detalladas -->
      <div class="section">
        <h2 class="section-title">Métricas Técnicas</h2>
        <div class="details-grid">
          <div class="detail-box">
            <div class="detail-label">Complejidad Cognitiva</div>
            <div class="detail-value">${metrics.cognitive_complexity || 'N/A'}</div>
          </div>
          <div class="detail-box">
            <div class="detail-label">Complejidad Ciclomática</div>
            <div class="detail-value">${metrics.complexity || 'N/A'}</div>
          </div>
          <div class="detail-box">
            <div class="detail-label">Funciones</div>
            <div class="detail-value">${metrics.functions || 'N/A'}</div>
          </div>
          <div class="detail-box">
            <div class="detail-label">Clases</div>
            <div class="detail-value">${metrics.classes || 'N/A'}</div>
          </div>
          <div class="detail-box">
            <div class="detail-label">Archivos</div>
            <div class="detail-value">${metrics.files || 'N/A'}</div>
          </div>
          <div class="detail-box">
            <div class="detail-label">Densidad Comentarios</div>
            <div class="detail-value">${parseFloat(metrics.comment_lines_density || 0).toFixed(1)}%</div>
          </div>
          <div class="detail-box">
            <div class="detail-label">Violaciones Bloqueantes</div>
            <div class="detail-value">${metrics.blocker_violations || 0}</div>
          </div>
          <div class="detail-box">
            <div class="detail-label">Violaciones Críticas</div>
            <div class="detail-value">${metrics.critical_violations || 0}</div>
          </div>
        </div>
      </div>

      <!-- Recomendaciones -->
      <div class="section">
        <h2 class="section-title">Recomendaciones</h2>
        <ul class="recommendations-list">
          ${bugs > 0 ? `<li class="priority-high">
            <div class="recommendation-title">Corrección de Bugs (Prioridad Alta)</div>
            Se identificaron ${bugs} bugs que pueden afectar la estabilidad de la aplicación. Se recomienda priorizar su corrección antes del próximo release.
          </li>` : ''}
          ${vulnerabilities > 0 ? `<li class="priority-high">
            <div class="recommendation-title">Vulnerabilidades de Seguridad (Prioridad Alta)</div>
            Existen ${vulnerabilities} vulnerabilidades que deben ser remediadas para garantizar la seguridad del sistema.
          </li>` : ''}
          ${coverage < 80 ? `<li class="priority-medium">
            <div class="recommendation-title">Aumentar Cobertura de Pruebas</div>
            La cobertura actual (${coverage.toFixed(1)}%) está por debajo del umbral recomendado del 80%. Implementar pruebas unitarias adicionales mejorará la confiabilidad.
          </li>` : ''}
          ${codeSmells > 50 ? `<li class="priority-medium">
            <div class="recommendation-title">Reducir Code Smells</div>
            Se detectaron ${codeSmells} code smells. Refactorizar progresivamente mejorará la mantenibilidad del código.
          </li>` : ''}
          ${duplication > 3 ? `<li class="priority-low">
            <div class="recommendation-title">Reducir Código Duplicado</div>
            El ${duplication.toFixed(1)}% de duplicación puede reducirse aplicando principios DRY (Don't Repeat Yourself).
          </li>` : ''}
          ${bugs === 0 && vulnerabilities === 0 ? `<li class="priority-low">
            <div class="recommendation-title">Mantener Estándares Actuales</div>
            El código no presenta bugs ni vulnerabilidades. Continuar aplicando buenas prácticas de desarrollo.
          </li>` : ''}
        </ul>
      </div>

      <!-- Conclusión -->
      <div class="conclusion-box">
        <h4>Conclusión del Análisis</h4>
        <p>${getConclusion(bugs, vulnerabilities, codeSmells, coverage, reliabilityRating, securityRating)}</p>
      </div>

      <!-- Footer -->
      <div class="report-footer">
        <div class="company">LibelulaSoft</div>
        <p>Documento generado automáticamente el ${date} a las ${time}</p>
        <p>Análisis realizado con SonarQube | ${SONAR_CONFIG.project} v${SONAR_CONFIG.release}</p>
      </div>
    </div>
  </div>

  <script>
    // Configuración de Chart.js para aspecto profesional
    Chart.defaults.font.family = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = '#374151';

    // Gráfico de Severidades (Barras)
    const severityCtx = document.getElementById('severityChart').getContext('2d');
    new Chart(severityCtx, {
      type: 'bar',
      data: {
        labels: ['Blocker', 'Critical', 'Major', 'Minor', 'Info'],
        datasets: [{
          label: 'Cantidad de Issues',
          data: [
            ${issuesBySeverity.BLOCKER},
            ${issuesBySeverity.CRITICAL},
            ${issuesBySeverity.MAJOR},
            ${issuesBySeverity.MINOR},
            ${issuesBySeverity.INFO}
          ],
          backgroundColor: [
            '#7f1d1d',
            '#991b1b',
            '#b45309',
            '#1e40af',
            '#64748b'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Issues por Severidad',
            font: {
              size: 12,
              weight: '600'
            },
            padding: {
              bottom: 15
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0
            },
            grid: {
              color: '#e5e7eb'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    // Gráfico de Distribución (Dona)
    const issuesCtx = document.getElementById('issuesChart').getContext('2d');
    new Chart(issuesCtx, {
      type: 'doughnut',
      data: {
        labels: ['Bugs', 'Vulnerabilidades', 'Code Smells', 'Hotspots'],
        datasets: [{
          data: [${bugs}, ${vulnerabilities}, ${codeSmells}, ${hotspots}],
          backgroundColor: [
            '#C62828',
            '#E64A19',
            '#F57C00',
            '#FFA726'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              font: {
                size: 10
              }
            }
          },
          title: {
            display: true,
            text: 'Distribución de Issues',
            font: {
              size: 12,
              weight: '600'
            },
            padding: {
              bottom: 15
            }
          }
        }
      }
    });
  </script>
</body>
</html>
  `;
}

function generateSeverityRows(issuesBySeverity) {
  const total = Object.values(issuesBySeverity).reduce((a, b) => a + b, 0);
  const severityOrder = [
    { key: 'BLOCKER', label: 'Blocker' },
    { key: 'CRITICAL', label: 'Critical' },
    { key: 'MAJOR', label: 'Major' },
    { key: 'MINOR', label: 'Minor' },
    { key: 'INFO', label: 'Info' }
  ];
  
  return severityOrder.map(({ key, label }) => {
    const count = issuesBySeverity[key] || 0;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    const statusClass = count === 0 ? 'status-good' : count < 10 ? 'status-warning' : 'status-critical';
    const statusText = count === 0 ? 'Aprobado' : count < 10 ? 'Requiere atención' : 'Crítico';
    
    return `
      <tr>
        <td><span class="severity-badge severity-${key}">${label}</span></td>
        <td style="text-align: center;"><strong>${count}</strong></td>
        <td><span class="${statusClass}">${statusText}</span></td>
        <td style="text-align: right;">${percentage}%</td>
      </tr>
    `;
  }).join('');
}

function getRatingLetter(rating) {
  const r = parseFloat(rating);
  if (r <= 1) return 'A';
  if (r <= 2) return 'B';
  if (r <= 3) return 'C';
  if (r <= 4) return 'D';
  return 'E';
}

function formatTechDebt(minutes) {
  if (minutes < 60) return `${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  if (hours < 8) return `${hours} horas`;
  const days = Math.floor(hours / 8);
  return `${days} días`;
}

function getConclusion(bugs, vulnerabilities, codeSmells, coverage, reliabilityRating, securityRating) {
  const hasHighRisk = bugs > 10 || vulnerabilities > 0;
  const hasMediumRisk = bugs > 0 || codeSmells > 100 || coverage < 50;

  if (hasHighRisk) {
    return `El análisis revela áreas críticas que requieren atención inmediata. Con ${bugs} bugs y ${vulnerabilities} vulnerabilidades identificadas, se recomienda establecer un plan de acción prioritario para remediar estos issues antes de cualquier despliegue a producción. La inversión en la corrección de estos problemas reducirá significativamente el riesgo técnico y mejorará la estabilidad general del sistema.`;
  } else if (hasMediumRisk) {
    return `El proyecto presenta un nivel de calidad aceptable con oportunidades de mejora. La calificación ${reliabilityRating} en confiabilidad y ${securityRating} en seguridad indica una base sólida, aunque se recomienda aumentar la cobertura de pruebas y reducir progresivamente los code smells para alcanzar los estándares óptimos de calidad de software.`;
  } else {
    return `El proyecto demuestra un excelente nivel de calidad de código. Las calificaciones obtenidas (${reliabilityRating} en confiabilidad, ${securityRating} en seguridad) reflejan buenas prácticas de desarrollo. Se recomienda mantener los estándares actuales y continuar con las revisiones periódicas de código para preservar la calidad alcanzada.`;
  }
}

async function generateProfessionalReport() {
  console.log('GENERACIÓN DE INFORME DE CALIDAD DE CÓDIGO');
  console.log('='.repeat(60));
  
  try {
    // Obtener métricas
    const metrics = await fetchSonarMetrics();
    const issuesBySeverity = await fetchIssuesBySeverity();
    
    // Generar HTML
    console.log('Generando documento HTML...');
    const html = generateProfessionalHTML(metrics, issuesBySeverity);
    
    const htmlPath = path.resolve(OUTPUT_DIR, 'sonar-professional-report.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('Documento HTML generado correctamente');
    
    // Convertir a PDF
    console.log('\nGenerando documento PDF...');
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    // Esperar a que los gráficos se rendericen
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pdfPath = path.resolve(OUTPUT_DIR, 'sonar-professional-report.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    });
    
    await browser.close();
    
    // Resumen
    const stats = fs.statSync(pdfPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('INFORME GENERADO EXITOSAMENTE\n');
    console.log('Archivos generados:');
    console.log(`  HTML: sonar-professional-report.html`);
    console.log(`  PDF:  sonar-professional-report.pdf (${sizeInMB} MB)`);
    console.log('\nMétricas del análisis:');
    console.log(`  Bugs: ${metrics.bugs || 0}`);
    console.log(`  Vulnerabilidades: ${metrics.vulnerabilities || 0}`);
    console.log(`  Code Smells: ${metrics.code_smells || 0}`);
    console.log(`  Cobertura: ${parseFloat(metrics.coverage || 0).toFixed(1)}%`);
    console.log(`  Líneas de código: ${parseInt(metrics.ncloc || 0).toLocaleString()}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\nERROR:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\nSonarQube no está disponible en http://localhost:9000');
      console.error('Verifica que el servidor esté ejecutándose');
    }
    
    if (error.message.includes('401')) {
      console.error('\nToken de autenticación inválido');
      console.error('Verifica la configuración en el archivo');
    }
    
    process.exit(1);
  }
}

// Ejecutar
generateProfessionalReport();
