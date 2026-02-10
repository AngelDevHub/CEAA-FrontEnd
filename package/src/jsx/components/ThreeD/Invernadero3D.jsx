import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Grid, useGLTF, Environment, Html, Bounds, Stage } from "@react-three/drei";
import { Card, Badge } from "react-bootstrap";
import socket from "../../../services/SocketService";
import modelPath from "../../../assets/models/invernadero.glb";

// Componente para mostrar datos flotantes sobre el modelo
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
        pointerEvents: 'none', // Evita que bloquee la rotación del modelo
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '800', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: '900', color: color, lineHeight: '1' }}>
          {value} <span style={{ fontSize: '14px', fontWeight: '700', color: '#666' }}>{unit}</span>
        </div>
      </div>
    </Html>
  );
};

// Componente para cargar el modelo GLB
const Model = ({ url }) => {
  const { scene } = useGLTF(url);

  // Intentar colorear automáticamente si faltan texturas
  useEffect(() => {
    console.log("--- ESTRUCTURA DEL MODELO 3D ---"); // Log para depuración
    scene.traverse((child) => {
      if (child.isMesh) {
        // Habilitar sombras para mayor realismo
        child.castShadow = true;
        child.receiveShadow = true;

        // Clonar material para no afectar a otros objetos que compartan el mismo
        child.material = child.material.clone();
        
        const name = child.name.toLowerCase();
        let isColored = false;
        
        // Lógica simple de coloreado basada en nombres comunes
        if (name.includes('bush') || name.includes('arbusto') || name.includes('tree') || name.includes('plant') || name.includes('vegetacion')) {
          child.material.color.set('#4caf50'); // Verde vegetación
          child.material.roughness = 0.8;
          isColored = true;
        } else if (name.includes('table') || name.includes('mesa') || name.includes('bench') || name.includes('banco')) {
          child.material.color.set('#e0e0e0'); // Gris claro/blanco para mesas
          child.material.metalness = 0.1;
          child.material.roughness = 0.5;
          isColored = true;
        } else if (name.includes('tierra') || name.includes('soil') || name.includes('ground') || name.includes('suelo')) {
          child.material.color.set('#5d4037'); // Café tierra
          isColored = true;
        } else if (name.includes('tronco') || name.includes('trunk') || name.includes('wood') || name.includes('madera')) {
          child.material.color.set('#795548'); // Café madera
          isColored = true;
        } else if (name.includes('vidrio') || name.includes('glass') || name.includes('window') || name.includes('panel')) {
          child.material.transparent = true;
          child.material.opacity = 0.3;
          child.material.color.set('#81d4fa'); // Azul claro transparente
          child.material.roughness = 0.1;
          child.material.metalness = 0.9;
          isColored = true;
        } else if (name.includes('estructura') || name.includes('frame') || name.includes('metal') || name.includes('tubo') || name.includes('beam')) {
          child.material.color.set('#b0bec5'); // Gris metálico estructura
          child.material.metalness = 0.6;
          child.material.roughness = 0.4;
          isColored = true;
        } else if (name.includes('piso') || name.includes('floor') || name.includes('concrete') || name.includes('base')) {
          child.material.color.set('#9e9e9e'); // Gris concreto piso
          isColored = true;
        } else if (name.includes('pot') || name.includes('maceta') || name.includes('vaso')) {
          child.material.color.set('#ff7043'); // Naranja maceta
          isColored = true;
        } else if (name.includes('vert001') || name.includes('leaf')) { 
          // Corrección específica para las plantas internas que salen como Vert001
          child.material.color.set('#66bb6a'); // Verde claro para plantas internas
          child.material.roughness = 0.6;
          isColored = true;
        }

        if (!isColored) {
          console.log("⚠️ OBJETO SIN COLOR DETECTADO:", child.name);
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
};

const Invernadero3D = () => {
  const modelUrl = modelPath;
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
          <Canvas shadows dpr={[1, 2]} camera={{ position: [20, 20, 20], fov: 45 }}>
            <Suspense fallback={<Html center>Cargando modelo...</Html>}>
              <color attach="background" args={['#f0f0f0']} />
              
              {/* Stage configura iluminación y entorno profesional automáticamente */}
              <Stage environment="city" intensity={0.5} contactShadow={false} adjustCamera={1.2}>
                <Model url={modelUrl} />
              </Stage>

              {/* Etiquetas de sensores flotantes (fuera del Stage para que no afecten el encuadre) */}
              <group position={[0, 0, 0]}>
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
              </group>

              <OrbitControls makeDefault maxDistance={500} />
              <Grid infiniteGrid sectionColor="#4caf50" cellColor="#8bc34a" position={[0, -0.01, 0]} />
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
