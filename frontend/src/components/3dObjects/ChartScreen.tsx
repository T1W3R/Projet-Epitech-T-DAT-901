import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import "./ChartScreen.css";

const ChartScreen = ({ 
  selectedPlanet, 
  onChartScreenClick,
  position = [0, 0, 0],
  quaternion = undefined,
}: { 
  selectedPlanet: string | null;
  onChartScreenClick?: () => void;
  position?: [number, number, number];
  quaternion?: THREE.Quaternion | undefined;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const BASE_SCALE: [number, number, number] = [0.18, 0.15, 1];
  
  // Positions de base pour l'écran holographique
  const basePosition: [number, number, number] = position;

  // Animation de scintillement holographique et oscillations
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current && frameRef.current) {
      // Léger scintillement de l'opacité pour l'écran principal
      const meshMaterial = meshRef.current.material as THREE.MeshBasicMaterial;
      if (meshMaterial && 'opacity' in meshMaterial) {
        meshMaterial.opacity = 0.85 + Math.sin(time * 2) * 0.1;
      }
      
      // Effet de lueur sur les bordures
      const frameMaterial = frameRef.current.material as THREE.MeshBasicMaterial;
      if (frameMaterial && 'opacity' in frameMaterial) {
        frameMaterial.opacity = 0.6 + Math.sin(time * 3) * 0.2;
      }
    }
  });

  return (
    <group ref={groupRef} position={basePosition} quaternion={quaternion}>
      {/* Cadre holographique lumineux */}
      <mesh 
        ref={frameRef}
        position={[0, 0, -0.01]} 
        rotation={[0, 0, 0]}
        scale={BASE_SCALE}
      >
        <planeGeometry args={[2.7, 1.7]} />
        <meshBasicMaterial
          color="cyan"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Écran avec fond */}
      <mesh 
        ref={meshRef}
        position={[0, 0, -0.008]} 
        rotation={[0, 0, 0]}
        scale={BASE_SCALE}
      >
        <planeGeometry args={[2.5, 1.5]} />
        <meshBasicMaterial
          color="#000a1a"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Interface HTML/CSS */}
      <Html
        transform
        position={[0, 0, 0]}
        distanceFactor={0.11}
        style={{
          width: '1500px',
          height: '700px',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          className="chart-container"
          onClick={(e) => {
            e.stopPropagation();
            onChartScreenClick && onChartScreenClick();
          }}
        >
          {selectedPlanet ? (
            <div className="chart-content">
              <h2 className="chart-title">{selectedPlanet}</h2>
              <div className="chart-subtitle">Overview</div>
            </div>
          ) : (
            <div className="chart-empty-state">
              <div className="chart-empty-title">
                [ CHART ]
              </div>
              <div className="chart-empty-subtitle">
                Sélectionnez une planète
              </div>
              <div className="chart-empty-text">
                pour afficher le graphique
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

export default ChartScreen;