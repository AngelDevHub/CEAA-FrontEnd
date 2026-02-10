import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, useGLTF, Html, Stage } from "@react-three/drei";
import { Card, Badge } from "react-bootstrap";
import socket from "../../../services/SocketService";
import modelPath from "../../../assets/models/invernadero.glb";

// 1. Componente para etiquetas flotantes con escala inteligente
const SensorLabel = ({ position, label, value, unit, color }) => {
  return (
    <Html position={position} center distanceFactor={20}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '10px 14px', 
        borderRadius: '12px', 
        border: `3px solid ${color}`,
        textAlign: 'center',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        minWidth: '120px',
        pointerEvents: 'none', 
        backdropFilter: 'blur(4px)',
        userSelect: 'none'
      }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#666', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '22px', fontWeight: '900', color: color, lineHeight: '1' }}>
          {value} <span style={{ fontSize: '12px', fontWeight: '700', color: '#888' }}>{unit}</span>
        </div>
      </div>
    </Html>
  );
};

// 2. Componente del Modelo con Materiales ajustados al "Original"
const Model = ({ url }) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = child.material.clone();
        
        const name = child.name.toLowerCase();
        
        // --- Vegetación Exterior (Árboles grandes) ---
        if (name.includes('bush') || name.includes('arbusto') || name.includes('tree')) {
          child.material.color.set('#4e613c'); // Verde oliva seco (más realista)
          child.material.roughness = 1;        // Sin brillo plástico
          child.material.metalness = 0;
        } 
        // --- Vegetación Interior / Detalles ---
        else if (name.includes('vert001') || name.includes('leaf') || name.includes('plant')) {
          child.material.color.set('#556b2f'); // Verde oscuro
          child.material.roughness = 0.8;
        }
        // --- Vidrio (Casi invisible como en la foto) ---
        else if (name.includes('vidrio') || name.includes('glass') || name.includes('panel')) {
          child.material.transparent = true;
          child.material.opacity = 0.12;       // Muy sutil
          child.material.color.set('#ffffff'); 
          child.material.roughness = 0;
          child.material.metalness = 1;        // Refleja el entorno
        } 
        // --- Estructura (Blanco/Crema como el original) ---
        else if (name.includes('estructura') || name.includes('frame') || name.includes('metal')) {
          child.material.color.set('#f5f5f5'); // Blanco roto
          child.material.roughness = 0.2;
          child.material.metalness = 0.4;
        }
        // --- Piso Interior (Gris azulado oscuro) ---
        else if (name.includes('piso') || name.includes('floor') || name.includes('concrete')) {
          child.material.color.set('#2c313c'); 
          child.material.roughness = 1;
        }
        // --- Tierra Exterior ---
        else if (name.includes('tierra') || name.includes('soil')) {
          child.material.color.set('#4b3f35'); 
          child.material.roughness = 1;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
};

// 3. Componente Principal Integrado
const Invernadero3D = () => {
  const [sensorData, setSensorData] = useState({
    temperatura: "--",
    humedad: "--",
    nitrogeno: "--"
  });

  // Lógica de Socket.io
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
        <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom py-3">
          <Card.Title className="mb-0 fw-bold">Gemelo Digital: Invernadero Inteligente</Card.Title>
          <Badge bg="success" pill className="px-3">DATOS EN TIEMPO REAL</Badge>
        </Card.Header>
        
        <Card.Body className="p-0" style={{ height: "650px", background: "#f0f2f5" }}>
          <Canvas shadows dpr={[1, 2]} camera={{ position: [35, 35, 35], fov: 35 }}>
            <Suspense fallback={<Html center>Conectando con el modelo 3D...</Html>}>
              
              {/* Fondo neutro claro */}
              <color attach="background" args={['#eef2f3']} />
              
              {/* Escenario con iluminación de Bosque para realismo en hojas y vidrios */}
              <Stage environment="forest" intensity={0.5} contactShadow={{ opacity: 0.4, blur: 2.5 }} adjustCamera={1.2}>
                <Model url={modelPath} />
              </Stage>

              {/* Luces de realce para volumen */}
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />

              {/* Etiquetas posicionadas para que no se amontonen */}
              <group>
                <SensorLabel 
                  position={[0, 8, 0]} 
                  label="Temperatura" 
                  value={sensorData.temperatura} 
                  unit="°C" 
                  color="#d32f2f" 
                />
                <SensorLabel 
                  position={[12, 4, 8]} 
                  label="Humedad Relativa" 
                  value={sensorData.humedad} 
                  unit="%" 
                  color="#1976d2" 
                />
                <SensorLabel 
                  position={[-12, 3, -8]} 
                  label="Nitrógeno (N)" 
                  value={sensorData.nitrogeno} 
                  unit="mg/kg" 
                  color="#388e3c" 
                />
              </group>

              <OrbitControls makeDefault maxDistance={100} minDistance={15} />
              
              {/* Suelo decorativo estilo pasto */}
              <Grid 
                infiniteGrid 
                sectionColor="#2e7d32" 
                cellColor="#a5d6a7" 
                sectionSize={10} 
                cellSize={1} 
                position={[0, -0.05, 0]} 
              />
              
            </Suspense>
          </Canvas>
        </Card.Body>
        
        <Card.Footer className="bg-light text-muted small d-flex justify-content-between py-3">
          <span><b>Controles:</b> Rotar (Click Izq), Pan (Click Der), Zoom (Rueda)</span>
          <span>Status Socket: <b>{socket.connected ? 'Sincronizado' : 'Conectando...'}</b></span>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Invernadero3D;