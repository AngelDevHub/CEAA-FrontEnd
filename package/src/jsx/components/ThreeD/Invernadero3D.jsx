import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, useGLTF, Html, Stage } from "@react-three/drei";
import { Card, Badge } from "react-bootstrap";
import socket from "../../../services/SocketService";
import modelPath from "../../../assets/models/invernadero.glb";

// 1. Componente para etiquetas flotantes (Visibilidad garantizada)
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
        minWidth: '130px',
        pointerEvents: 'none', 
        backdropFilter: 'blur(6px)',
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

// 2. Componente del Modelo con Mapeo de Nombres Reales
const Model = ({ url }) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Clonamos material para aplicar cambios únicos por pieza
        child.material = child.material.clone();
        
        const name = child.name; // Usamos el nombre exacto de tu lista de consola

        // --- PLANTAS (Vert001, Vert001_1, Bush00x) ---
        if (name.includes('Vert') || name.includes('Bush')) {
          child.material.color.set('#4e613c'); // Verde oliva orgánico
          child.material.roughness = 1;
          child.material.metalness = 0;
        } 
        // --- MACETAS (Pots_Smallxxx, Pots_Largexxx) ---
        else if (name.includes('Pots')) {
          child.material.color.set('#a0522d'); // Café terracota/arcilla
          child.material.roughness = 0.9;
        }
        // --- MESAS (Tablexxx) ---
        else if (name.includes('Table')) {
          child.material.color.set('#d1d1d1'); // Gris metálico claro
          child.material.roughness = 0.3;
          child.material.metalness = 0.6;
        }
        // --- ESTRUCTURA Y VIDRIOS ---
        else if (name.toLowerCase().includes('vidrio') || name.toLowerCase().includes('glass')) {
          child.material.transparent = true;
          child.material.opacity = 0.15;
          child.material.color.set('#ffffff');
          child.material.metalness = 1;
        } 
        // --- SUELOS (Floor, Ground) ---
        else if (name === 'Floor') {
          child.material.color.set('#2c313c'); // Suelo interior oscuro
        }
        else if (name === 'Ground') {
          child.material.color.set('#4b3f35'); // Tierra exterior
        }
        // --- FALLBACK: Si algo sigue siendo blanco puro, es la estructura ---
        else if (child.material.color.r > 0.8 && child.material.color.g > 0.8) {
          child.material.color.set('#f5f5f5'); // Blanco crema estructura
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
        <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom py-3">
          <Card.Title className="mb-0 fw-bold">Gemelo Digital: Monitoreo 3D</Card.Title>
          <Badge bg={socket.connected ? "success" : "warning"} pill className="px-3">
            {socket.connected ? "SISTEMA ONLINE" : "CONECTANDO..."}
          </Badge>
        </Card.Header>
        
        <Card.Body className="p-0" style={{ height: "650px", background: "#f8f9fa" }}>
          <Canvas shadows dpr={[1, 2]} camera={{ position: [50, 50, 50], fov: 35 }}>
            <Suspense fallback={<Html center>Iniciando Motor Gráfico...</Html>}>
              
              <color attach="background" args={['#eef2f3']} />
              
              {/* Iluminación tipo Forest para realismo */}
              <Stage environment="forest" intensity={0.6} contactShadow={{ opacity: 0.5, blur: 2 }} adjustCamera={1.2}>
                <Model url={modelPath} />
              </Stage>

              {/* GRUPO DE ETIQUETAS: Posicionadas estratégicamente en el espacio */}
              <group position={[0, 8, 0]}>
                <SensorLabel 
                  position={[0, 10, 0]} 
                  label="Temperatura" 
                  value={sensorData.temperatura} 
                  unit="°C" 
                  color="#d32f2f" 
                />
                <SensorLabel 
                  position={[18, 5, 12]} 
                  label="Humedad" 
                  value={sensorData.humedad} 
                  unit="%" 
                  color="#1976d2" 
                />
                <SensorLabel 
                  position={[-18, 3, -12]} 
                  label="Nitrógeno" 
                  value={sensorData.nitrogeno} 
                  unit="mg/kg" 
                  color="#388e3c" 
                />
              </group>

              <OrbitControls makeDefault maxDistance={150} minDistance={25} />
              <Grid infiniteGrid sectionColor="#2e7d32" cellColor="#a5d6a7" position={[0, -0.01, 0]} />
              
            </Suspense>
          </Canvas>
        </Card.Body>
        
        <Card.Footer className="bg-light text-muted small d-flex justify-content-between py-3">
          <span><b>Nodos:</b> Conectado al bus de datos industrial</span>
          <span>ID Socket: <b>{socket.id || 'Buscando...'}</b></span>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Invernadero3D;