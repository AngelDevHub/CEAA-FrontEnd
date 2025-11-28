import React from "react";
import loadable from "@loadable/component";
// import { Link } from 'react-router-dom';
import { Row, Col, Card, Button } from "react-bootstrap";
import axiosInstance from "../../../../services/AxiosInstance";
import { useState } from "react";

import pMinDelay from "p-min-delay";

import PageTitle from "../../../layouts/PageTitle";

const Temperatura = loadable(() => pMinDelay(import("./Temperatura"), 500));
const Humedad = loadable(() => pMinDelay(import("./Humedad"), 500));
const NivelesNitrogeno = loadable(() => pMinDelay(import("./NivelesNitrogeno"), 500));
const Riego = loadable(() => pMinDelay(import("./Riego"), 500));


function ApexChart() {
   const [downloading, setDownloading] = useState(false);

   const startOfWeek = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      return d;
   };

   const endOfWeek = (start) => {
      const d = new Date(start);
      d.setDate(d.getDate() + 6);
      d.setHours(23, 59, 59, 999);
      return d;
   };

   const parseTimestamp = (item) => {
      const ts = item.fecha || item.timestamp;
      return ts ? new Date(ts) : null;
   };

   const toFixedNum = (val, digits = 2) => Number.parseFloat(val).toFixed(digits);

   const generateCSV = (rows) => {
      const header = [
         'Dia','Temp_prom','Temp_min','Temp_max','Hum_prom','Hum_min','Hum_max','Nit_prom','Nit_min','Nit_max','Riego_prom','Riego_min','Riego_max'
      ];
      const lines = [header.join(',')];
      rows.forEach(r => {
         lines.push([
            r.dia,
            r.tempProm,
            r.tempMin,
            r.tempMax,
            r.humProm,
            r.humMin,
            r.humMax,
            r.nitProm,
            r.nitMin,
            r.nitMax,
            r.riegoProm,
            r.riegoMin,
            r.riegoMax
         ].join(','));
      });
      return lines.join('\n');
   };

   const downloadWeeklyReport = async () => {
      try {
         setDownloading(true);
         const now = new Date();
         const weekStart = startOfWeek(now);
         const weekEnd = endOfWeek(weekStart);

         const resp = await axiosInstance.get('invernadero/sensores', { withCredentials: true });
         const data = Array.isArray(resp.data?.data) ? resp.data.data : [];

         const weekData = data.filter(item => {
            const d = parseTimestamp(item);
            return d && d >= weekStart && d <= weekEnd;
         });

         const dias = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
         const buckets = Array.from({ length: 7 }, () => ({ temps: [], hums: [], nits: [], riegos: [] }));

         const sortedWeek = [...weekData].sort((a, b) => {
            const da = parseTimestamp(a);
            const db = parseTimestamp(b);
            return da - db;
         });
         const prevHum = Array.from({ length: 7 }, () => null);

         sortedWeek.forEach(item => {
            const d = parseTimestamp(item);
            const dow = d.getDay();
            const idx = dow === 0 ? 6 : dow - 1;
            const t = typeof item.temperatura === 'number' ? item.temperatura : parseFloat(item.temperatura);
            const h = typeof item.humedad === 'number' ? item.humedad : parseFloat(item.humedad);
            const n = typeof item.nitrogeno === 'number' ? item.nitrogeno : parseFloat(item.nitrogeno);
            let r;
            if (item.riego !== undefined) {
               r = typeof item.riego === 'number' ? item.riego : parseFloat(item.riego);
            } else {
               const prev = prevHum[idx];
               if (prev === null || Number.isNaN(prev)) {
                  prevHum[idx] = h;
                  r = NaN;
               } else {
                  const delta = h - prev;
                  r = delta > 0 ? delta : NaN;
                  prevHum[idx] = h;
               }
            }
            if (!Number.isNaN(t)) buckets[idx].temps.push(t);
            if (!Number.isNaN(h)) buckets[idx].hums.push(h);
            if (!Number.isNaN(n)) buckets[idx].nits.push(n);
            if (!Number.isNaN(r)) buckets[idx].riegos.push(+r.toFixed(2));
         });

         const rows = dias.map((dia, i) => {
            const b = buckets[i];
            const tempMin = b.temps.length ? Math.min(...b.temps) : 0;
            const tempMax = b.temps.length ? Math.max(...b.temps) : 0;
            const tempProm = b.temps.length ? b.temps.reduce((a, v) => a + v, 0) / b.temps.length : 0;

            const humMin = b.hums.length ? Math.min(...b.hums) : 0;
            const humMax = b.hums.length ? Math.max(...b.hums) : 0;
            const humProm = b.hums.length ? b.hums.reduce((a, v) => a + v, 0) / b.hums.length : 0;

            const nitMin = b.nits.length ? Math.min(...b.nits) : 0;
            const nitMax = b.nits.length ? Math.max(...b.nits) : 0;
            const nitProm = b.nits.length ? b.nits.reduce((a, v) => a + v, 0) / b.nits.length : 0;
            const riegoMin = b.riegos.length ? Math.min(...b.riegos) : 0;
            const riegoMax = b.riegos.length ? Math.max(...b.riegos) : 0;
            const riegoProm = b.riegos.length ? b.riegos.reduce((a, v) => a + v, 0) / b.riegos.length : 0;

            return {
               dia,
               tempProm: toFixedNum(tempProm, 2),
               tempMin: toFixedNum(tempMin, 2),
               tempMax: toFixedNum(tempMax, 2),
               humProm: toFixedNum(humProm, 2),
               humMin: toFixedNum(humMin, 2),
               humMax: toFixedNum(humMax, 2),
               nitProm: toFixedNum(nitProm, 2),
               nitMin: toFixedNum(nitMin, 2),
               nitMax: toFixedNum(nitMax, 2),
               riegoProm: toFixedNum(riegoProm, 2),
               riegoMin: toFixedNum(riegoMin, 2),
               riegoMax: toFixedNum(riegoMax, 2)
           };
        });

         const csv = generateCSV(rows);
         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         const year = weekStart.getFullYear();
         const weekNum = Math.ceil((((weekStart - new Date(weekStart.getFullYear(),0,1)) / 86400000) + weekStart.getDay()+1) / 7);
         a.href = url;
         a.download = `reporte-semanal-${year}-W${weekNum}.csv`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
      } catch (e) {
         console.error('Error generando reporte semanal:', e);
         alert('No se pudo generar el reporte semanal.');
      } finally {
         setDownloading(false);
      }
   };

   return (
      <div className="h-80">
         <PageTitle motherMenu="Charts" activeMenu="ApexChart" />
         <Row className="mb-3">
            <Col>
               <Button variant="primary" onClick={downloadWeeklyReport} disabled={downloading}>
                  {downloading ? 'Generando reporte...' : 'Exportar reporte semanal (CSV)'}
               </Button>
            </Col>
         </Row>
         <Row>
            <Col xl={6}>
               <Card>
                  <Card.Header>
                     <Card.Title>Bar Chart</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <Temperatura />
                  </Card.Body>
               </Card>
            </Col>
            <Col xl={6}>
               <Card>
                  <Card.Header>
                     <Card.Title>Bar Chart</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <Humedad />
                  </Card.Body>
               </Card>
            </Col>

            <Col xl={6}>
               <Card>
                  <Card.Header>
                     <Card.Title>Line</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <NivelesNitrogeno />
                  </Card.Body>
               </Card>
            </Col>
            <Col xl={6}>
               <Card>
                  <Card.Header>
                     <Card.Title>Line</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <Riego />
                  </Card.Body>
               </Card>
            </Col>

         </Row>
      </div>
   );
}

export default ApexChart;
