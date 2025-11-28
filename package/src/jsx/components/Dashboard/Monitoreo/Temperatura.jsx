import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import socket from "../../../../services/SocketService";

const TemperaturaSemanalAvanzada = () => {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    // 📡 Escuchar el evento correcto emitido por tu backend
    socket.on("nuevosDatos", (payload) => {
      if (payload?.actual) {
        const nuevaLectura = payload.actual;
        console.log("📡 Nueva lectura recibida:", nuevaLectura);
        setDatos((prev) => [...prev, nuevaLectura]);
      }
    });

    return () => socket.off("nuevosDatos");
  }, []);

  // 🧮 Adaptar datos: { fecha, temp }
  const lecturas = datos.map((d) => ({
    fecha: d.fecha || d.timestamp || new Date().toISOString(),
    temp: parseFloat(d.temperatura) || 0,
  }));

  if (lecturas.length === 0) {
    return (
      <p className="text-center text-gray-500">Cargando datos de temperatura...</p>
    );
  }

  // 🗓️ Agrupar por día
  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const tempsPorDia = Array.from({ length: 7 }, () => []);

  lecturas.forEach((d) => {
    const fecha = new Date(d.fecha);
    const diaSemana = fecha.getDay(); // 0 = domingo
    const index = diaSemana === 0 ? 6 : diaSemana - 1; // lunes=0
    tempsPorDia[index].push(d.temp);
  });

  // 📊 Calcular mínimos, máximos y promedios
  const minPorDia = tempsPorDia.map((arr) =>
    arr.length ? Math.min(...arr).toFixed(1) : 0
  );
  const maxPorDia = tempsPorDia.map((arr) =>
    arr.length ? Math.max(...arr).toFixed(1) : 0
  );
  const promPorDia = tempsPorDia.map((arr) =>
    arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0
  );

  const series = [
    { name: "Temperatura Promedio", type: "line", data: promPorDia },
    { name: "Temperatura Mínima", type: "column", data: minPorDia },
    { name: "Temperatura Máxima", type: "column", data: maxPorDia },
  ];

  const options = {
    chart: {
      height: 350,
      type: "line",
      stacked: false,
      toolbar: { show: true },
      animations: { enabled: true, easing: "easeinout", speed: 700 },
    },
    stroke: { width: [3, 0, 0], curve: "smooth" },
    plotOptions: { bar: { columnWidth: "40%" } },
    markers: { size: 5 },
    xaxis: { categories: dias },
    yaxis: { title: { text: "Temperatura (°C)" }, min: 0 },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => `${val} °C` },
    },
    fill: {
      opacity: [1, 0.4, 0.4],
      colors: ["#FFA000", "#0288D1", "#E53935"],
    },
    legend: { position: "bottom", horizontalAlign: "center" },
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold text-center mb-4">
        Niveles Semanales de Temperatura
      </h3>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default TemperaturaSemanalAvanzada;

