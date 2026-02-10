import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, useGLTF, Html, Stage } from "@react-three/drei";
import { Card, Badge } from "react-bootstrap";
import socket from "../../../services/SocketService";
import modelPath from "../../../assets/models/invernadero.glb";

// 1. Componente para etiquetas flotantes XXL (Alta Visibilidad)
const SensorLabel = ({ position, label, value, unit, color }) => {
  return (
    <Html 
      position={position} 
      center 
      distanceFactor={30} // Aumentado para que no se encojan al alejar la cámara
      occlude={false}     // Siempre visible, incluso a través de paredes
    >
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.98)', 
        padding: '15px 25px',        // Mucho más espacio interno
        borderRadius: '16px', 
        border: `5px solid ${color}`, // Borde más grueso y llamativo
        textAlign: 'center',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        minWidth: '220px',           // Caja más ancha
        pointerEvents: 'none', 
        backdropFilter: 'blur(8px)',
        userSelect: 'none',
        zIndex: 100
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '800', 
          color: '#444', 
          textTransform: 'uppercase', 
          letterSpacing: '1.5px',
          marginBottom: '5px' 
        }}>
          {label}
        </div>
        
        <div style={{ 
          fontSize: '48px',          // VALOR GIGANTE
          fontWeight: '900', 
          color: color, 
          lineHeight: '1',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {value} 
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#666' }}>
            {unit}
          </span>
        </div>
      </div>
    </Html>
  );
};

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
        
        <Card.Body className="p-0" style={{ height: "700px", background: "#f8f9fa" }}>
          <Canvas shadows dpr={[1, 2]} camera={{ position: [60, 60, 60], fov: 30 }}>
            <Suspense fallback={<Html center>Cargando Escena...</Html>}>
              
              <color attach="background" args={['#eef2f3']} />
              
              <Stage environment="forest" intensity={0.6} adjustCamera={1.1}>
                <Model url={modelPath} />
              </Stage>

              {/* GRUPO DE ETIQUETAS XXL: Elevadas y separadas para que no se tapen */}
              <group>
                <SensorLabel 
                  position={[0, 22, 0]} 
                  label="Temperatura" 
                  value={sensorData.temperatura} 
                  unit="°C" 
                  color="#d32f2f" 
                />
                <SensorLabel 
                  position={[30, 15, 15]} 
                  label="Humedad" 
                  value={sensorData.humedad} 
                  unit="%" 
                  color="#1976d2" 
                />
                <SensorLabel 
                  position={[-30, 12, -15]} 
                  label="Nitrógeno" 
                  value={sensorData.nitrogeno} 
                  unit="mg/kg" 
                  color="#388e3c" 
                />
              </group>

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