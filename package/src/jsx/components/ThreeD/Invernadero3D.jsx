import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Grid } from "@react-three/drei";
import { Card } from "react-bootstrap";

// Componente de marcador de posición para el invernadero
const GreenhousePlaceholder = () => {
  return (
    <group>
      {/* Suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>

      {/* Estructura simple del invernadero */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[4, 3, 6]} />
        <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>
      
      {/* Techo */}
      <mesh position={[0, 3, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[3.5, 1.5, 4, 1, false, Math.PI / 4]} />
        <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
      </mesh>

      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Modelo 3D Pendiente
      </Text>
    </group>
  );
};

const Invernadero3D = () => {
  return (
    <div className="h-80vh">
      <Card className="h-100">
        <Card.Header>
          <Card.Title>Recorrido Virtual 3D - Invernadero</Card.Title>
        </Card.Header>
        <Card.Body className="p-0" style={{ height: "600px" }}>
          <Canvas camera={{ position: [10, 5, 10], fov: 50 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <GreenhousePlaceholder />
              <OrbitControls />
              <Stars />
              <Grid infiniteGrid />
            </Suspense>
          </Canvas>
        </Card.Body>
        <Card.Footer className="text-muted">
          Utilice el mouse para rotar, hacer zoom y desplazarse por el modelo.
        </Card.Footer>
      </Card>
    </div>
  );
};
//ja
export default Invernadero3D;
