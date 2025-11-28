import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import socket from "../../../../services/SocketService";

const RiegoSemanal = () => {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    socket.on("nuevosDatos", (payload) => {
      if (payload?.actual) {
        const nuevaLectura = payload.actual;
        setDatos((prev) => [...prev, nuevaLectura]);
      }
    });
    return () => socket.off("nuevosDatos");
  }, []);

  const lecturas = datos.map((d) => ({
    fecha: d.fecha || d.timestamp || new Date().toISOString(),
    humedad: typeof d.humedad === "number" ? d.humedad : parseFloat(d.humedad ?? 0),
    riego: typeof d.riego === "number" ? d.riego : parseFloat(d.riego ?? d.irrigacion ?? d.caudal ?? NaN)
  }));

  if (lecturas.length === 0) {
    return (
      <p className="text-center text-gray-500">Cargando datos de riego...</p>
    );
  }

  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const riegoPorDia = Array.from({ length: 7 }, () => []);

  const sorted = [...lecturas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const prevHum = Array.from({ length: 7 }, () => null);

  sorted.forEach((d) => {
    const fecha = new Date(d.fecha);
    const diaSemana = fecha.getDay();
    const index = diaSemana === 0 ? 6 : diaSemana - 1;
    if (!Number.isNaN(d.riego)) {
      riegoPorDia[index].push(d.riego);
    } else {
      const h = Number.isFinite(d.humedad) ? d.humedad : 0;
      const prev = prevHum[index];
      if (prev === null) {
        prevHum[index] = h;
      } else {
        const delta = h - prev;
        if (delta > 0) riegoPorDia[index].push(+delta.toFixed(2));
        prevHum[index] = h;
      }
    }
  });

  const minPorDia = riegoPorDia.map((arr) => (arr.length ? Math.min(...arr).toFixed(2) : 0));
  const maxPorDia = riegoPorDia.map((arr) => (arr.length ? Math.max(...arr).toFixed(2) : 0));
  const promPorDia = riegoPorDia.map((arr) => (arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0));

  const series = [
    { name: "Riego Promedio", type: "line", data: promPorDia },
    { name: "Riego Mínimo", type: "column", data: minPorDia },
    { name: "Riego Máximo", type: "column", data: maxPorDia }
  ];

  const options = {
    chart: { height: 350, type: "line", stacked: false, toolbar: { show: true } },
    stroke: { width: [3, 0, 0], curve: "smooth" },
    plotOptions: { bar: { columnWidth: "40%" } },
    markers: { size: 5 },
    xaxis: { categories: dias },
    yaxis: { title: { text: "Riego" }, min: 0 },
    tooltip: { shared: true, intersect: false },
    fill: { opacity: [1, 0.4, 0.4], colors: ["#2BC155", "#81C784", "#43A047"] },
    legend: { position: "bottom", horizontalAlign: "center" }
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold text-center mb-4">Niveles Semanales de Riego</h3>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default RiegoSemanal;
