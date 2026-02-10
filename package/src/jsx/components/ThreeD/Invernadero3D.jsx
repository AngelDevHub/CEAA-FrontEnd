import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Grid, useGLTF, Environment, Html } from "@react-three/drei";
import { Card, Badge } from "react-bootstrap";
import socket from "../../../services/SocketService";

// Componente para mostrar datos flotantes sobre el modelo
const SensorLabel = ({ position, label, value, unit, color }) => {
  return (
    <Html position={position} center distanceFactor={10}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.9)', 
        padding: '8px 12px', 
        borderRadius: '8px', 
        border: `2px solid ${color}`,
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        minWidth: '100px',
        pointerEvents: 'none' // Evita que bloquee la rotación del modelo
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>{label}</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: color }}>
          {value} <span style={{ fontSize: '0.8rem' }}>{unit}</span>
        </div>
      </div>
    </Html>
  );
};

// Componente para cargar el modelo GLB
const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
};

const Invernadero3D = () => {
  const modelUrl = "/models/invernadero.glb";
  const [sensorData, setSensorData] = useState({
    temperatura: "--",
    humedad: "--",
    nitrogeno: "--"
  });

  useEffect(() => {
    // Escuchar datos en tiempo real
    const handleNewData = (payload) => {
      if (payload?.actual) {
        const { temperatura, humedad, nitrogeno } = payload.actual;
        setSensorData({
          temperatura: parseFloat(temperatura).toFixed(1),
          humedad: parseFloat(humedad).toFixed(1),
          nitrogeno: parseFloat(nitrogeno || 0).toFixed(1) // Asumiendo que viene este campo, ajustar si es diferente
        });
      }
    };

    socket.on("nuevosDatos", handleNewData);
    
    // Cleanup
    return () => {
      socket.off("nuevosDatos", handleNewData);
    };
  }, []);

  return (
    <div className="h-80vh">
      <Card className="h-100">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title>Recorrido Virtual 3D - Monitoreo en Tiempo Real</Card.Title>
          <div>
            <Badge bg="success" className="me-2">En línea</Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0" style={{ height: "600px" }}>
          <Canvas camera={{ position: [10, 5, 10], fov: 50 }}>
            <Suspense fallback={<Html center>Cargando modelo...</Html>}>
              {/* Iluminación ambiente y entorno */}
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <Environment preset="sunset" />

              {/* Cargar el modelo 3D */}
              <Model url={modelUrl} />

              {/* Etiquetas de sensores flotantes */}
              {/* Ajustar posiciones [x, y, z] según donde quieras que aparezcan en tu modelo */}
              <SensorLabel 
                position={[0, 3, 0]} 
                label="Temperatura" 
                value={sensorData.temperatura} 
                unit="°C" 
                color="#e53935" 
              />
              <SensorLabel 
                position={[3, 2, 2]} 
                label="Humedad" 
                value={sensorData.humedad} 
                unit="%" 
                color="#0288d1" 
              />
              <SensorLabel 
                position={[-3, 1, -2]} 
                label="Nitrógeno" 
                value={sensorData.nitrogeno} 
                unit="mg/kg" 
                color="#43a047" 
              />

              <OrbitControls />
              <Stars />
              <Grid infiniteGrid sectionColor="#4caf50" cellColor="#8bc34a" />
            </Suspense>
          </Canvas>
        </Card.Body>
        <Card.Footer className="text-muted d-flex justify-content-between">
          <span>Utilice el mouse para rotar, hacer zoom y desplazarse por el modelo.</span>
          <span>Datos actualizados en tiempo real vía Socket.io</span>
        </Card.Footer>
      </Card>
    </div>
  );
};
//correc
export default Invernadero3D;
