import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Card, Badge } from "react-bootstrap";
import socket from "../../../services/SocketService";
import * as THREE from "three";
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

// 2. Componente del Modelo
const Model = ({ url }) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    const mkStd = (params) => new THREE.MeshStandardMaterial(params);
    const mkGlass = (params) => new THREE.MeshPhysicalMaterial({ transmission: 0.95, ior: 1.45, thickness: 0.15, roughness: 0.08, metalness: 0, ...params });

    const materialForName = (raw) => {
      const name = String(raw || "").toLowerCase();

      if (name.includes("glass") || name.includes("window") || name.includes("polyglass") || name.includes("acrylic")) {
        return mkGlass({ color: new THREE.Color("#ffffff") });
      }

      if (name.includes("frame") || name.includes("metal") || name.includes("steel") || name.includes("structure") || name.includes("pipe")) {
        return mkStd({ color: new THREE.Color("#d6dbe2"), roughness: 0.35, metalness: 0.15 });
      }

      if (name.includes("floor") || name.includes("tarp") || name.includes("mat") || name.includes("carpet")) {
        return mkStd({ color: new THREE.Color("#1f2430"), roughness: 0.95, metalness: 0 });
      }

      if (name.includes("ground") || name.includes("terrain") || name.includes("soil") || name.includes("dirt")) {
        return mkStd({ color: new THREE.Color("#4f4639"), roughness: 1, metalness: 0 });
      }

      if (name.includes("grass")) {
        return mkStd({ color: new THREE.Color("#4f7a35"), roughness: 1, metalness: 0 });
      }

      if (name.includes("tree") || name.includes("bush") || name.includes("leaf") || name.includes("foliage") || name.includes("vert")) {
        return mkStd({ color: new THREE.Color("#3f6f35"), roughness: 0.95, metalness: 0 });
      }

      if (name.includes("plant") || name.includes("crop")) {
        return mkStd({ color: new THREE.Color("#2f7d32"), roughness: 0.9, metalness: 0 });
      }

      if (name.includes("pot") || name.includes("vase")) {
        return mkStd({ color: new THREE.Color("#8a5a3c"), roughness: 0.85, metalness: 0 });
      }

      if (name.includes("table") || name.includes("bench")) {
        return mkStd({ color: new THREE.Color("#d1d6dd"), roughness: 0.55, metalness: 0.05 });
      }

      return null;
    };

    const shouldOverride = (material) => {
      if (!material) return true;
      const maps = [
        material.map,
        material.normalMap,
        material.roughnessMap,
        material.metalnessMap,
        material.emissiveMap,
        material.aoMap
      ];
      if (maps.some(Boolean)) return false;
      return true;
    };

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const next = materialForName(child.name);
        if (next) {
          if (Array.isArray(child.material)) {
            const can = child.material.every((m) => shouldOverride(m));
            if (can) child.material = next;
          } else if (shouldOverride(child.material)) {
            child.material = next;
          }
        }

        if (Array.isArray(child.material)) child.material.forEach((m) => m && (m.needsUpdate = true));
        else if (child.material) child.material.needsUpdate = true;
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

          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [70, 50, 90], fov: 35, near: 0.1, far: 20000 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
            onCreated={({ gl }) => {
              gl.toneMappingExposure = 1.2;
              gl.physicallyCorrectLights = true;
            }}
          >
            <Suspense fallback={<Html center>Cargando Escena...</Html>}>

              <Environment preset="sunset" background />

              <ambientLight intensity={0.6} />
              <directionalLight
                position={[25, 40, 18]}
                intensity={2.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={1}
                shadow-camera-far={200}
                shadow-camera-left={-80}
                shadow-camera-right={80}
                shadow-camera-top={80}
                shadow-camera-bottom={-80}
              />

              <Model url={modelPath} />

              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.08}
                maxDistance={9000}
                minDistance={10}
                zoomSpeed={0.9}
                target={[0, 6, 0]}
              />

              <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.45}
                scale={150}
                blur={2.8}
                far={60}
              />
              
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
