import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../services/AxiosInstance';

function formatDateTime(value) {
  try {
    return value ? new Date(value).toLocaleString() : '—';
  } catch {
    return '—';
  }
}

function formatHours(seconds) {
  if (!seconds || !Number.isFinite(Number(seconds))) return '0.0 h';
  return `${(Number(seconds) / 3600).toFixed(1)} h`;
}

function formatNumber(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(digits);
}

function Card({ title, value, subtitle }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="text-muted" style={{ fontSize: 12 }}>{title}</div>
        <div className="fw-bold" style={{ fontSize: 22, lineHeight: 1.2 }}>{value}</div>
        {subtitle ? <div className="text-muted mt-1" style={{ fontSize: 12 }}>{subtitle}</div> : null}
      </div>
    </div>
  );
}

export default function Reports() {
  const [mode, setMode] = useState('diario');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const load = async (m) => {
    try {
      setLoading(true);
      setError('');
      const endpoint = m === 'semanal' ? 'reportes/semanal' : 'reportes/diario';
      const res = await axiosInstance.get(endpoint);
      setReport(res.data?.data || null);
    } catch (e) {
      setReport(null);
      setError(e?.response?.data?.message || e?.message || 'No se pudo cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(mode);
  }, [mode]);

  const header = useMemo(() => {
    const title = mode === 'semanal' ? 'Reporte semanal' : 'Reporte diario';
    const range = report?.range;
    const subtitle = range?.start && range?.end
      ? `${new Date(range.start).toLocaleString()} → ${new Date(range.end).toLocaleString()}`
      : '—';
    return { title, subtitle };
  }, [mode, report]);

  const onPrint = () => {
    const prev = document.title;
    try {
      const range = report?.range;
      const start = range?.start ? new Date(range.start).toISOString().slice(0, 10) : 'sin-fecha';
      const end = range?.end ? new Date(range.end).toISOString().slice(0, 10) : 'sin-fecha';
      document.title = `CEAA-${mode}-${start}-${end}`;
    } catch {
      document.title = `CEAA-${mode}`;
    }
    window.print();
    document.title = prev;
  };

  const humedad = report?.sensores?.humedad;
  const temperatura = report?.sensores?.temperatura;
  const nitrogeno = report?.sensores?.nitrogeno;
  const thresholds = report?.thresholds;
  const riegos = report?.operacion?.riegos;

  const riesgo4h = report?.sensores?.riesgo_4h;
  const riesgoBadge = (value) => {
    if (value === 'alto') return 'badge bg-danger';
    if (value === 'bajo') return 'badge bg-success';
    return 'badge bg-secondary';
  };

  return (
    <div className="row report-page">
      <div className="col-12 mb-4 report-no-print">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 className="mb-1">{header.title}</h2>
            <div className="text-muted">{header.subtitle}</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${mode === 'diario' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setMode('diario')}
              disabled={loading}
            >
              Diario
            </button>
            <button
              className={`btn btn-sm ${mode === 'semanal' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setMode('semanal')}
              disabled={loading}
            >
              Semanal
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => load(mode)} disabled={loading}>
              Recargar
            </button>
            <button className="btn btn-sm btn-dark" onClick={onPrint} disabled={loading || !report}>
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="col-12 mb-4">
          <div className="alert alert-danger mb-0">{error}</div>
        </div>
      ) : null}

      {loading ? (
        <div className="col-12">
          <div className="text-muted">Cargando...</div>
        </div>
      ) : !report ? (
        <div className="col-12">
          <div className="text-muted">Sin datos de reporte.</div>
        </div>
      ) : (
        <>
          <div className="col-12 mb-4">
            <div className="report-document">
              <div className="report-header">
                <div className="report-brand">
                  <div className="report-brand-title">CEAA</div>
                  <div className="report-brand-subtitle">Control y administración de invernaderos</div>
                </div>
                <div className="report-meta">
                  <div className="report-title">{header.title}</div>
                  <div className="report-subtitle">{header.subtitle}</div>
                  <div className="report-generated">Generado: {formatDateTime(new Date().toISOString())}</div>
                </div>
              </div>

              <div className="report-section">
                <div className="report-section-title">Resumen ejecutivo</div>
                <div className="report-summary-grid">
                  <div className="report-summary-item">
                    <div className="report-summary-label">Riesgo 4h</div>
                    <div className={`report-summary-value ${riesgo4h === 'alto' ? 'text-danger' : riesgo4h === 'bajo' ? 'text-success' : 'text-muted'}`}>
                      {riesgo4h || '—'}
                    </div>
                    <div className="report-summary-help">Basado en tendencia de humedad y umbral configurado</div>
                  </div>
                  <div className="report-summary-item">
                    <div className="report-summary-label">Estrés hídrico</div>
                    <div className="report-summary-value">{formatHours(report?.sensores?.seconds_under_humidity_threshold || 0)}</div>
                    <div className="report-summary-help">Tiempo bajo el umbral de humedad</div>
                  </div>
                  <div className="report-summary-item">
                    <div className="report-summary-label">Agua estimada</div>
                    <div className="report-summary-value">{formatNumber(riegos?.litros_estimados, 3)} L</div>
                    <div className="report-summary-help">Calculado con caudal nominal {formatNumber(report?.caudal_lph, 0)} L/h</div>
                  </div>
                  <div className="report-summary-item">
                    <div className="report-summary-label">Operación</div>
                    <div className="report-summary-value">{report?.operacion?.tareas_creadas ?? 0} tareas</div>
                    <div className="report-summary-help">{report?.operacion?.bitacoras ?? 0} bitácoras</div>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <div className="report-section-title">Indicadores de sensores</div>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0 report-table">
                    <thead>
                      <tr>
                        <th>Variable</th>
                        <th style={{ width: 140 }}>Mín</th>
                        <th style={{ width: 140 }}>Prom</th>
                        <th style={{ width: 140 }}>Máx</th>
                        <th style={{ width: 220 }}>Referencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Humedad (%)</td>
                        <td>{formatNumber(humedad?.min)}</td>
                        <td>{formatNumber(humedad?.avg)}</td>
                        <td>{formatNumber(humedad?.max)}</td>
                        <td>Umbral riego: {formatNumber(thresholds?.humedad_min_riego)}%</td>
                      </tr>
                      <tr>
                        <td>Temperatura (°C)</td>
                        <td>{formatNumber(temperatura?.min)}</td>
                        <td>{formatNumber(temperatura?.avg)}</td>
                        <td>{formatNumber(temperatura?.max)}</td>
                        <td>Rango: {formatNumber(thresholds?.temperatura_min)}–{formatNumber(thresholds?.temperatura_max)} °C</td>
                      </tr>
                      <tr>
                        <td>Nitrógeno (mg/kg)</td>
                        <td>{formatNumber(nitrogeno?.min, 1)}</td>
                        <td>{formatNumber(nitrogeno?.avg, 1)}</td>
                        <td>{formatNumber(nitrogeno?.max, 1)}</td>
                        <td>Monitoreo continuo (alertas por reglas de cultivo)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-section">
                <div className="report-section-title">Riego y operación</div>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="report-kpi-box">
                      <div className="report-kpi-title">Riego (estimación)</div>
                      <div className="report-kpi-row">
                        <div className="report-kpi-label">Eventos</div>
                        <div className="report-kpi-value">{riegos?.eventos ?? 0}</div>
                      </div>
                      <div className="report-kpi-row">
                        <div className="report-kpi-label">Segundos bomba</div>
                        <div className="report-kpi-value">{riegos?.segundos_totales ?? 0} s</div>
                      </div>
                      <div className="report-kpi-row">
                        <div className="report-kpi-label">Litros estimados</div>
                        <div className="report-kpi-value">{formatNumber(riegos?.litros_estimados, 3)} L</div>
                      </div>
                      <div className="report-kpi-footnote">Caudal nominal: {formatNumber(report?.caudal_lph, 0)} L/h</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="report-kpi-box">
                      <div className="report-kpi-title">Tareas (periodo)</div>
                      <div className="report-kpi-row">
                        <div className="report-kpi-label">Creadas</div>
                        <div className="report-kpi-value">{report?.operacion?.tareas_creadas ?? 0}</div>
                      </div>
                      <div className="report-kpi-row">
                        <div className="report-kpi-label">Por estado</div>
                        <div className="report-kpi-value">
                          {Object.entries(report?.operacion?.tareas_por_estado || {}).map(([k, v]) => `${k}:${v}`).join(' · ') || '—'}
                        </div>
                      </div>
                      <div className="report-kpi-row">
                        <div className="report-kpi-label">Bitácoras</div>
                        <div className="report-kpi-value">{report?.operacion?.bitacoras ?? 0}</div>
                      </div>
                      <div className="report-kpi-footnote">Evidencia operativa: tareas y bitácoras asociadas</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <div className="report-section-title">Evidencias (bitácoras recientes)</div>
                {(report?.operacion?.evidencia || []).length === 0 ? (
                  <div className="text-muted">Sin bitácoras en este periodo.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-striped table-bordered mb-0 report-table">
                      <thead>
                        <tr>
                          <th>Registro</th>
                          <th style={{ width: 140 }}>Sector</th>
                          <th style={{ width: 90 }}>Tarea</th>
                          <th style={{ width: 160 }}>Riego</th>
                          <th style={{ width: 220 }}>Usuario</th>
                          <th style={{ width: 200 }}>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(report?.operacion?.evidencia || []).map((b) => (
                          <tr key={b.id_bitacora}>
                            <td>
                              <div className="fw-semibold">{b.titulo}</div>
                              {b.descripcion ? (
                                <div className="text-muted" style={{ fontSize: 12 }}>
                                  {b.descripcion}
                                </div>
                              ) : null}
                            </td>
                            <td className="text-muted">{b.sector || '—'}</td>
                            <td className="text-muted">{b.id_tarea ? `#${b.id_tarea}` : '—'}</td>
                            <td className="text-muted">
                              {b.riego_seg ? `${b.riego_seg}s · ${formatNumber(b.litros_estimados, 3)}L` : '—'}
                            </td>
                            <td className="text-muted">{b.usuario_correo || '—'}</td>
                            <td className="text-muted">{b.created_at ? new Date(b.created_at).toLocaleString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="report-footer">
                <div>Documento generado automáticamente por CEAA. Fuente de sensores: Firebase · Operación: MySQL</div>
                <div>Página 1/1</div>
              </div>
            </div>
          </div>

          <div className="col-12 mb-4">
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-3">
                <Card
                  title="Humedad (min / prom / max)"
                  value={`${formatNumber(humedad?.min)} / ${formatNumber(humedad?.avg)} / ${formatNumber(humedad?.max)}`}
                  subtitle={`Umbral riego: ${formatNumber(thresholds?.humedad_min_riego)}%`}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <Card
                  title="Estrés hídrico"
                  value={formatHours(report?.sensores?.seconds_under_humidity_threshold || 0)}
                  subtitle="Tiempo bajo el umbral de humedad"
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <Card
                  title="Riegos (eventos / litros)"
                  value={`${riegos?.eventos ?? 0} / ${formatNumber(riegos?.litros_estimados, 3)} L`}
                  subtitle={`Caudal nominal: ${formatNumber(report?.caudal_lph, 0)} L/h`}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <Card
                  title="Temperatura (min / prom / max)"
                  value={`${formatNumber(temperatura?.min)} / ${formatNumber(temperatura?.avg)} / ${formatNumber(temperatura?.max)}`}
                  subtitle={`Rango: ${formatNumber(thresholds?.temperatura_min)}–${formatNumber(thresholds?.temperatura_max)} °C`}
                />
              </div>
            </div>
          </div>

          <div className="col-12 mb-4">
            <div className="row g-3">
              <div className="col-12 col-lg-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4 className="card-title mb-0">Nitrógeno</h4>
                      <span className="text-muted" style={{ fontSize: 12 }}>muestra: {nitrogeno?.count ?? 0}</span>
                    </div>
                    <div className="row g-3">
                      <div className="col-12 col-md-4">
                        <div className="text-muted" style={{ fontSize: 12 }}>Mín</div>
                        <div className="fw-semibold">{formatNumber(nitrogeno?.min, 1)}</div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="text-muted" style={{ fontSize: 12 }}>Prom</div>
                        <div className="fw-semibold">{formatNumber(nitrogeno?.avg, 1)}</div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="text-muted" style={{ fontSize: 12 }}>Máx</div>
                        <div className="fw-semibold">{formatNumber(nitrogeno?.max, 1)}</div>
                      </div>
                    </div>
                    <div className="text-muted mt-3" style={{ fontSize: 12 }}>
                      Umbral de nitrógeno máximo recomendado se gestiona por cultivo; aquí se reporta el comportamiento.
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4 className="card-title mb-0">Operación</h4>
                      <span className={`badge ${riesgoBadge(riesgo4h)}`}>Riesgo 4h: {riesgo4h || '—'}</span>
                    </div>
                    <div className="row g-3">
                      <div className="col-12 col-md-4">
                        <div className="text-muted" style={{ fontSize: 12 }}>Tareas creadas</div>
                        <div className="fw-semibold">{report?.operacion?.tareas_creadas ?? 0}</div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="text-muted" style={{ fontSize: 12 }}>Bitácoras</div>
                        <div className="fw-semibold">{report?.operacion?.bitacoras ?? 0}</div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="text-muted" style={{ fontSize: 12 }}>Segundos bomba</div>
                        <div className="fw-semibold">{riegos?.segundos_totales ?? 0} s</div>
                      </div>
                    </div>
                    {report?.sensores?.trend_4h ? (
                      <div className="mt-3">
                        <div className="text-muted" style={{ fontSize: 12 }}>Tendencia de humedad (estimación simple)</div>
                        <div className="d-flex gap-3 flex-wrap">
                          <div><span className="text-muted" style={{ fontSize: 12 }}>Último:</span> <span className="fw-semibold">{formatNumber(report.sensores.trend_4h.last)}%</span></div>
                          <div><span className="text-muted" style={{ fontSize: 12 }}>Pendiente:</span> <span className="fw-semibold">{formatNumber(report.sensores.trend_4h.slope_per_hour, 3)} %/h</span></div>
                          <div><span className="text-muted" style={{ fontSize: 12 }}>En 4h:</span> <span className="fw-semibold">{formatNumber(report.sensores.trend_4h.predicted)}%</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted mt-3" style={{ fontSize: 12 }}>Sin suficientes datos para tendencia 4h.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <h4 className="card-title mb-0">Evidencias (bitácoras recientes)</h4>
                  <span className="text-muted" style={{ fontSize: 12 }}>Mostrando: {(report?.operacion?.evidencia || []).length}</span>
                </div>
                {(report?.operacion?.evidencia || []).length === 0 ? (
                  <div className="text-muted">Sin bitácoras en este periodo.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped mb-0">
                      <thead>
                        <tr>
                          <th>Registro</th>
                          <th>Sector</th>
                          <th>Tarea</th>
                          <th>Riego</th>
                          <th>Usuario</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(report?.operacion?.evidencia || []).map((b) => (
                          <tr key={b.id_bitacora}>
                            <td>
                              <div className="fw-semibold">{b.titulo}</div>
                              {b.descripcion ? (
                                <div className="text-muted" style={{ fontSize: 12 }}>
                                  {b.descripcion}
                                </div>
                              ) : null}
                            </td>
                            <td className="text-muted">{b.sector || '—'}</td>
                            <td className="text-muted">{b.id_tarea ? `#${b.id_tarea}` : '—'}</td>
                            <td className="text-muted">
                              {b.riego_seg ? `${b.riego_seg}s · ${formatNumber(b.litros_estimados, 3)}L` : '—'}
                            </td>
                            <td className="text-muted">{b.usuario_correo || '—'}</td>
                            <td className="text-muted">{b.created_at ? new Date(b.created_at).toLocaleString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
