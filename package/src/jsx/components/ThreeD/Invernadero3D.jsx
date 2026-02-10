import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, useGLTF, Html, Stage } from "@react-three/drei";
import { Card, Badge } from "react-bootstrap";
import socket from "../../../services/SocketService";
import modelPath from "../../../assets/models/invernadero.glb";

// 1. Componente para etiquetas flotantes
const SensorLabel = ({ position, label, value, unit, color }) => {
  return (
    <Html position={position} center>
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

// 2. Componente del Modelo con Materiales corregidos
const Model = ({ url }) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Clonamos material para aplicar cambios individuales
        child.material = child.material.clone();
        const name = child.name.toLowerCase();
        
        // --- Lógica de coloreado y propiedades físicas ---
        if (name.includes('bush') || name.includes('arbusto') || name.includes('tree') || name.includes('vert001') || name.includes('leaf')) {
          child.material.color.set('#2d5a27'); // Verde orgánico
          child.material.roughness = 1;        // Mate
          child.material.metalness = 0;
        } 
        else if (name.includes('vidrio') || name.includes('glass') || name.includes('panel') || name.includes('window')) {
          child.material.transparent = true;
          child.material.opacity = 0.2;
          child.material.color.set('#e1f5fe'); 
          child.material.roughness = 0;        // Reflejo máximo
          child.material.metalness = 1;
        } 
        else if (name.includes('estructura') || name.includes('frame') || name.includes('metal') || name.includes('beam')) {
          child.material.color.set('#37474f'); // Gris industrial
          child.material.roughness = 0.3;
          child.material.metalness = 0.8;
        }
        else if (name.includes('tierra') || name.includes('soil') || name.includes('ground')) {
          child.material.color.set('#3e2723'); 
          child.material.roughness = 1;
        } 
        else if (name.includes('piso') || name.includes('floor') || name.includes('concrete')) {
          child.material.color.set('#78909c'); 
          child.material.roughness = 0.8;
        }
        else if (name.includes('pot') || name.includes('maceta')) {
          child.material.color.set('#bf360c'); // Arcilla
          child.material.roughness = 0.9;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
};

// 3. Componente Principal
const Invernadero3D = () => {
  const [sensorData, setSensorData] = useState({
    temperatura: "--",
    humedad: "--",
    nitrogeno: "--"
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
      <Card className="h-100 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white">
          <Card.Title className="mb-0">Monitoreo Invernadero 3D</Card.Title>
          <Badge bg="success">Streaming Activo</Badge>
        </Card.Header>
        
        <Card.Body className="p-0" style={{ height: "650px", background: "#f8f9fa" }}>
          <Canvas shadows dpr={[1, 2]} camera={{ position: [25, 25, 25], fov: 40 }}>
            <Suspense fallback={<Html center>Cargando Invernadero...</Html>}>
              
              <color attach="background" args={['#e3f2fd']} />
              
              {/* Iluminación de ambiente Park para reflejos naturales */}
              <Stage environment="park" intensity={0.7} contactShadow={{ opacity: 0.5, blur: 2 }} adjustCamera={1.2}>
                <Model url={modelPath} />
              </Stage>

              {/* Luces de soporte */}
              <ambientLight intensity={0.4} />
              <pointLight position={[15, 15, 15]} intensity={1.2} castShadow />

              {/* Etiquetas de sensores posicionadas estratégicamente */}
              <group>
                <SensorLabel 
                  position={[0, 6, 0]} 
                  label="Temperatura" 
                  value={sensorData.temperatura} 
                  unit="°C" 
                  color="#e53935" 
                />
                <SensorLabel 
                  position={[6, 3, 4]} 
                  label="Humedad" 
                  value={sensorData.humedad} 
                  unit="%" 
                  color="#0288d1" 
                />
                <SensorLabel 
                  position={[-6, 2, -4]} 
                  label="Nitrógeno" 
                  value={sensorData.nitrogeno} 
                  unit="mg/kg" 
                  color="#43a047" 
                />
              </group>

              <OrbitControls makeDefault maxDistance={80} minDistance={10} />
              <Grid infiniteGrid sectionColor="#4caf50" cellColor="#c8e6c9" position={[0, -0.05, 0]} />
              
            </Suspense>
          </Canvas>
        </Card.Body>
        
        <Card.Footer className="text-muted small d-flex justify-content-between">
          <span>Click Izquierdo: Rotar | Scroll: Zoom | Click Derecho: Pan</span>
          <span>Nodo: {socket.id ? 'Conectado' : 'Buscando servidor...'}</span>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Invernadero3D;