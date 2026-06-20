import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import socket from "../../../../services/SocketService";

const NitrogenoSemanalAvanzado = () => {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    // 📡 Escuchar evento del backend
    socket.on("nuevosDatos", (payload) => {
      if (payload?.actual) {
        const nuevaLectura = payload.actual;
        setDatos((prev) => [...prev, nuevaLectura]);
      }
    });

    return () => socket.off("nuevosDatos");
  }, []);

  // 🧮 Adaptar los datos a { fecha, nitrogeno }
  const lecturas = datos.map((d) => ({
    fecha: d.fecha || d.timestamp || new Date().toISOString(),
    nitrogeno: parseFloat(d.nitrogeno) || 0,
  }));

  if (lecturas.length === 0) {
    return (
      <p className="text-center text-gray-500">Cargando datos de nitrógeno...</p>
    );
  }

  // 🗓️ Agrupar por día de la semana
  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const nitroPorDia = Array.from({ length: 7 }, () => []);

  lecturas.forEach((d) => {
    const fecha = new Date(d.fecha);
    const diaSemana = fecha.getDay(); // 0 = domingo
    const index = diaSemana === 0 ? 6 : diaSemana - 1; // lunes=0
    nitroPorDia[index].push(d.nitrogeno);
  });

  // 📊 Calcular mínimos, máximos y promedios
  const minPorDia = nitroPorDia.map((arr) =>
    arr.length ? Math.min(...arr).toFixed(2) : 0
  );
  const maxPorDia = nitroPorDia.map((arr) =>
    arr.length ? Math.max(...arr).toFixed(2) : 0
  );
  const promPorDia = nitroPorDia.map((arr) =>
    arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0
  );

  const series = [
    { name: "Nitrógeno Promedio", data: promPorDia },
    { name: "Nitrógeno Mínimo", data: minPorDia },
    { name: "Nitrógeno Máximo", data: maxPorDia },
  ];

  const options = {
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: true, type: "x", autoScaleYaxis: true },
      toolbar: {
        show: true,
        tools: {
          download: true, // 📥 Descargar imagen
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true, // 🔄 Reiniciar vista
        },
      },
      animations: { enabled: true, easing: "easeinout", speed: 700 },
    },
    stroke: {
      curve: "smooth",
      width: [3, 2, 2],
      colors: ["#1EA7C5", "#4FC3F7", "#0277BD"],
    },
    colors: ["#1EA7C5", "#4FC3F7", "#0277BD"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.6,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 5,
      colors: ["#1EA7C5"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 8 },
    },
    xaxis: { categories: dias },
    yaxis: { title: { text: "Nitrógeno (mg/kg)" }, min: 0 },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => `${val} mg/kg` },
    },
    legend: { position: "bottom", horizontalAlign: "center" },
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold text-center mb-4">
         Niveles Semanales de Nitrógeno
      </h3>
      <ReactApexChart options={options} series={series} type="area" height={350} />
    </div>
  );
};

export default NitrogenoSemanalAvanzado;
