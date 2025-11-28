import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import socket from "../../../../services/SocketService";

const HumedadSemanalAvanzada = () => {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    // 📡 Escucha los datos en tiempo real desde tu backend
    socket.on("nuevosDatos", (payload) => {
      if (payload?.actual) {
        const nuevaLectura = payload.actual;
        console.log("💧 Nueva lectura de humedad:", nuevaLectura);
        setDatos((prev) => [...prev, nuevaLectura]);
      }
    });

    return () => socket.off("nuevosDatos");
  }, []);

  // 🧮 Adaptar datos: { fecha, humedad }
  const lecturas = datos.map((d) => ({
    fecha: d.fecha || d.timestamp || new Date().toISOString(),
    humedad: parseFloat(d.humedad) || 0,
  }));

  if (lecturas.length === 0) {
    return (
      <p className="text-center text-gray-500">Cargando datos de humedad...</p>
    );
  }

  // 🗓️ Agrupar por día de la semana
  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const humPorDia = Array.from({ length: 7 }, () => []);

  lecturas.forEach((d) => {
    const fecha = new Date(d.fecha);
    const diaSemana = fecha.getDay(); // 0 = domingo
    const index = diaSemana === 0 ? 6 : diaSemana - 1; // lunes=0
    humPorDia[index].push(d.humedad);
  });

  // 📊 Calcular mínimos, máximos y promedios
  const minPorDia = humPorDia.map((arr) =>
    arr.length ? Math.min(...arr).toFixed(1) : 0
  );
  const maxPorDia = humPorDia.map((arr) =>
    arr.length ? Math.max(...arr).toFixed(1) : 0
  );
  const promPorDia = humPorDia.map((arr) =>
    arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0
  );

  const series = [
    { name: "Humedad Promedio", type: "line", data: promPorDia },
    { name: "Humedad Mínima", type: "column", data: minPorDia },
    { name: "Humedad Máxima", type: "column", data: maxPorDia },
  ];

  const options = {
    chart: {
      height: 350,
      type: "line",
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          download: true, // descargar imagen
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true, // reiniciar vista
        },
      },
      zoom: {
        enabled: true,
        type: "x", // zoom horizontal
        autoScaleYaxis: true, // ajusta el eje Y al hacer zoom
      },
      animations: { enabled: true, easing: "easeinout", speed: 700 },
    },
    stroke: { width: [3, 0, 0], curve: "smooth" },
    plotOptions: { bar: { columnWidth: "40%" } },
    markers: { size: 5 },
    xaxis: { categories: dias },
    yaxis: { title: { text: "Humedad (%)" }, min: 0, max: 100 },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => `${val} %` },
    },
    fill: {
      opacity: [1, 0.5, 0.5],
      colors: ["#00BCD4", "#81C784", "#4CAF50"], // tonos azules y verdes
    },
    legend: { position: "bottom", horizontalAlign: "center" },
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold text-center mb-4">
          Niveles Semanales de Humedad
      </h3>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default HumedadSemanalAvanzada;
