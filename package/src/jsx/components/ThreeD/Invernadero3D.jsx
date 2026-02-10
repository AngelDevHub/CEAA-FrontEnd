import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, useGLTF, Html, Stage } from "@react-three/drei";
import { Card, Badge } from "react-bootstrap";
import socket from "../../../services/SocketService";
import modelPath from "../../../assets/models/invernadero.glb";

// 1. Componente para etiquetas flotantes (Aseguramos visibilidad con Z-Index)
const SensorLabel = ({ position, label, value, unit, color }) => {
  return (
    <Html position={position} center distanceFactor={20}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.98)', 
        padding: '10px 14px', 
        borderRadius: '12px', 
        border: `3px solid ${color}`,
        textAlign: 'center',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        minWidth: '125px',
        pointerEvents: 'none', 
        backdropFilter: 'blur(6px)',
        userSelect: 'none',
        zIndex: 100
      }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#555', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: '900', color: color, lineHeight: '1' }}>
          {value} <span style={{ fontSize: '12px', fontWeight: '700', color: '#777' }}>{unit}</span>
        </div>
      </div>
    </Html>
  );
};

// 2. Componente del Modelo con Lógica de Color Fallback para evitar el blanco
const Model = ({ url }) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = child.material.clone();
        
        const name = child.name.toLowerCase();
        
        // --- Corrección de Plantas y Macetas (Evita que se vean blancas) ---
        if (name.includes('leaf') || name.includes('plant') || name.includes('vert') || name.includes('bush') || name.includes('arbusto')) {
          child.material.color.set('#4e613c'); // Verde oliva realista
          child.material.roughness = 1;
          child.material.metalness = 0;
        } 
        else if (name.includes('pot') || name.includes('maceta') || name.includes('pote')) {
          child.material.color.set('#a0522d'); // Color arcilla/terracota
          child.material.roughness = 0.9;
        }
        // --- Estructura y Vidrios ---
        else if (name.includes('vidrio') || name.includes('glass')) {
          child.material.transparent = true;
          child.material.opacity = 0.15;
          child.material.color.set('#ffffff');
          child.material.metalness = 1;
          child.material.roughness = 0;
        } 
        else if (name.includes('estructura') || name.includes('frame')) {
          child.material.color.set('#f5f5f5'); // Blanco crema
          child.material.metalness = 0.3;
        }
        // --- Suelo Interior ---
        else if (name.includes('piso') || name.includes('floor') || name.includes('pasto')) {
          child.material.color.set('#2c313c'); // Gris oscuro azulado
        }
        // Fallback: Si algo sigue siendo blanco puro, le damos un tono base
        else if (child.material.color.r > 0.9 && child.material.color.g > 0.9) {
          child.material.color.set('#556b2f'); 
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
};

// 3. Componente Principal
const Invernadero3D = () => {
  // Inicializamos con 0.0 para que los cartelitos se rendericen de inmediato
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
        <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom py-3">
          <Card.Title className="mb-0 fw-bold">Gemelo Digital: Invernadero</Card.Title>
          <Badge bg={socket.connected ? "success" : "warning"} pill className="px-3">
            {socket.connected ? "Streaming LIVE" : "Conectando..."}
          </Badge>
        </Card.Header>
        
        <Card.Body className="p-0" style={{ height: "650px", background: "#f8f9fa" }}>
          <Canvas shadows dpr={[1, 2]} camera={{ position: [45, 45, 45], fov: 35 }}>
            <Suspense fallback={<Html center>Cargando Entorno 3D...</Html>}>
              
              <color attach="background" args={['#eef2f3']} />
              
              {/* Stage configura luces y sombras automáticas estilo "Forest" */}
              <Stage environment="forest" intensity={0.6} contactShadow={{ opacity: 0.5, blur: 2 }} adjustCamera={1.2}>
                <Model url={modelPath} />
              </Stage>

              {/* GRUPO DE ETIQUETAS: Elevadas para que floten sobre el invernadero */}
              <group position={[0, 5, 0]}>
                <SensorLabel 
                  position={[0, 12, 0]} 
                  label="Temperatura" 
                  value={sensorData.temperatura} 
                  unit="°C" 
                  color="#d32f2f" 
                />
                <SensorLabel 
                  position={[15, 6, 10]} 
                  label="Humedad" 
                  value={sensorData.humedad} 
                  unit="%" 
                  color="#1976d2" 
                />
                <SensorLabel 
                  position={[-15, 4, -10]} 
                  label="Nitrógeno" 
                  value={sensorData.nitrogeno} 
                  unit="mg/kg" 
                  color="#388e3c" 
                />
              </group>

              <OrbitControls makeDefault maxDistance={120} minDistance={20} />
              
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
          <span><b>Interacción:</b> Click Izq (Rotar) | Click Der (Mover) | Scroll (Zoom)</span>
          <span>Nodo ID: <b>{socket.id || 'Desconectado'}</b></span>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Invernadero3D;