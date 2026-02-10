import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, useGLTF, Html, Stage } from "@react-three/drei";
import { Card, Badge } from "react-bootstrap";
import socket from "../../../services/SocketService";
import modelPath from "../../../assets/models/invernadero.glb";

// 1. Componente de Tarjeta de Datos (HUD)
const StatCard = ({ label, value, unit, color, icon }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(8px)',
    padding: '15px',
    borderRadius: '12px',
    borderLeft: `5px solid ${color}`,
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    minWidth: '140px',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{ 
      fontSize: '12px', 
      fontWeight: '700', 
      color: '#666', 
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '5px'
    }}>
      {label}
    </div>
    <div style={{ 
      fontSize: '28px', 
      fontWeight: '800', 
      color: color,
      lineHeight: '1',
      display: 'flex',
      alignItems: 'baseline',
      gap: '4px'
    }}>
      {value}
      <span style={{ fontSize: '14px', color: '#888', fontWeight: '600' }}>{unit}</span>
    </div>
  </div>
);

// 2. Componente del Modelo con colores exactos según tu lista de nombres
const Model = ({ url }) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = child.material.clone();
        
        const name = child.name;

        // --- Aplicación de colores por nombre exacto ---
        if (name.includes('Vert') || name.includes('Bush')) {
          child.material.color.set('#4e613c'); // Verde plantas
        } 
        else if (name.includes('Pots')) {
          child.material.color.set('#a0522d'); // Café macetas
        }
        else if (name.includes('Table')) {
          child.material.color.set('#d1d1d1'); // Gris mesas
        }
        else if (name === 'Floor') {
          child.material.color.set('#2c313c'); // Piso interior
        }
        else if (name === 'Ground') {
          child.material.color.set('#4b3f35'); // Suelo exterior
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
};

// 3. Componente Principal Integrado
const Invernadero3D = () => {
  const [sensorData, setSensorData] = useState({
    temperatura: "0.0",
    humedad: "0.0",
    nitrogeno: "0.0"
  });

  useEffect(() => {
    const handleNewData = (payload) => {
      if (payload?.actual) {
        const { temperatura, humedad, nitrogeno } = payload.actual;
        setSensorData({
          temperatura: parseFloat(temperatura).toFixed(1),
          humedad: parseFloat(humedad).toFixed(1),
          nitrogeno: parseFloat(nitrogeno || 0).toFixed(1)
        });
      }
    };
    socket.on("nuevosDatos", handleNewData);
    return () => socket.off("nuevosDatos", handleNewData);
  }, []);

  return (
    <div className="h-80vh">
      <Card className="h-100 shadow-lg border-0">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
          <Card.Title className="mb-0 fw-bold">Maqueta Invernadero</Card.Title>
          <Badge bg={socket.connected ? "success" : "danger"} pill className="px-3">
            {socket.connected ? "LIVE" : "OFFLINE"}
          </Badge>
        </Card.Header>
        
        <Card.Body className="p-0 position-relative" style={{ height: "700px", background: "#f8f9fa" }}>
          
          {/* PANEL HUD: Superpuesto sobre el Canvas */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            gap: '15px',
            width: '90%',
            maxWidth: '800px',
            pointerEvents: 'none' // Para que los clics pasen al Canvas si es necesario
          }}>
             <StatCard 
               label="Temperatura" 
               value={sensorData.temperatura} 
               unit="°C" 
               color="#d32f2f" 
             />
             <StatCard 
               label="Humedad" 
               value={sensorData.humedad} 
               unit="%" 
               color="#1976d2" 
             />
             <StatCard 
               label="Nitrógeno" 
               value={sensorData.nitrogeno} 
               unit="mg/kg" 
               color="#388e3c" 
             />
          </div>

          <Canvas shadows dpr={[1, 2]} camera={{ position: [60, 60, 60], fov: 30 }}>
            <Suspense fallback={<Html center>Cargando Escena...</Html>}>
              
              <color attach="background" args={['#eef2f3']} />
              
              <Stage environment="forest" intensity={0.6} adjustCamera={1.1}>
                <Model url={modelPath} />
              </Stage>

              <OrbitControls makeDefault maxDistance={200} minDistance={30} />
              <Grid infiniteGrid sectionColor="#2e7d32" cellColor="#a5d6a7" position={[0, -0.01, 0]} />
              
            </Suspense>
          </Canvas>
        </Card.Body>
        
        <Card.Footer className="bg-light text-muted small py-3 text-center">
          <b>Tip:</b> Usa el mouse para rotar el invernadero y ver los datos desde cualquier ángulo.
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Invernadero3D;