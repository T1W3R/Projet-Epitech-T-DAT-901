import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import "./BitcoinDominanceScreen.css";

const BitcoinDominanceScreen = ({ 
  onScreenClick,
  useMotions = false,
  position = [0, 0, 0],
  quaternion = undefined,
}: { 
  onScreenClick?: () => void;
  useMotions?: boolean;
  position?: [number, number, number];
  quaternion?: THREE.Quaternion | undefined;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const BASE_SCALE: [number, number, number] = [0.105, 0.10, 1];
  
  // Positions de base pour l'écran holographique
  const basePosition: [number, number, number] = position;

  // Données simulées pour la dominance (à remplacer par des vraies données API plus tard)
  const dominanceData = {
    bitcoin: {
      percentage: 60.0,
      change: "+1.88%",
      color: "#ff9500"
    },
    ethereum: {
      percentage: 11.9,
      change: "-1.32%",
      color: "#627eea"
    },
    others: {
      percentage: 28.1,
      change: "-0.56%",
      color: "#888888"
    }
  };

  // Fonction pour formater les couleurs selon les variations
  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return "#00ff88";
    if (change.startsWith('-')) return "#ff4444";
    return "#aaccff";
  };

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

    // Oscillations synchronisées avec le vaisseau
    if (groupRef.current && useMotions) {
      // Oscillations optionnelles
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
        distanceFactor={0.13}
        style={{
          width: '500px',
          height: '300px',
          pointerEvents: 'auto',
        }}
      >
        <div
          className="dominance-container"
          onClick={(e) => {
            e.stopPropagation();
            onScreenClick && onScreenClick();
          }}
        >
          <h1 className="dominance-title">Dominance Bitcoin</h1>

          {/* Légendes */}
          <div className="dominance-legend">
            <div className="legend-item">
              <div 
                className="legend-dot" 
                style={{ backgroundColor: dominanceData.bitcoin.color }}
              />
              <span className="legend-label">Bitcoin</span>
            </div>
            <div className="legend-item">
              <div 
                className="legend-dot" 
                style={{ backgroundColor: dominanceData.ethereum.color }}
              />
              <span className="legend-label">Ethereum</span>
            </div>
            <div className="legend-item">
              <div 
                className="legend-dot" 
                style={{ backgroundColor: dominanceData.others.color }}
              />
              <span className="legend-label">Autres</span>
            </div>
          </div>

          {/* Données */}
          <div className="dominance-data">
            <div className="data-item">
              <div className="data-percentage">{dominanceData.bitcoin.percentage.toFixed(1)}%</div>
              <div 
                className="data-change" 
                style={{ color: getChangeColor(dominanceData.bitcoin.change) }}
              >
                {dominanceData.bitcoin.change}
              </div>
            </div>
            <div className="data-item">
              <div className="data-percentage">{dominanceData.ethereum.percentage.toFixed(1)}%</div>
              <div 
                className="data-change" 
                style={{ color: getChangeColor(dominanceData.ethereum.change) }}
              >
                {dominanceData.ethereum.change}
              </div>
            </div>
            <div className="data-item">
              <div className="data-percentage">{dominanceData.others.percentage.toFixed(1)}%</div>
              <div 
                className="data-change" 
                style={{ color: getChangeColor(dominanceData.others.change) }}
              >
                {dominanceData.others.change}
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="dominance-bar">
            <div 
              className="bar-segment bitcoin-segment"
              style={{ 
                width: `${dominanceData.bitcoin.percentage}%`,
                backgroundColor: dominanceData.bitcoin.color
              }}
            />
            <div 
              className="bar-segment ethereum-segment"
              style={{ 
                width: `${dominanceData.ethereum.percentage}%`,
                backgroundColor: dominanceData.ethereum.color
              }}
            />
            <div 
              className="bar-segment others-segment"
              style={{ 
                width: `${dominanceData.others.percentage}%`,
                backgroundColor: dominanceData.others.color
              }}
            />
          </div>

          {/* Info supplémentaire */}
          <div className="dominance-info">
            Total Market Cap: $2.8T
          </div>
        </div>
      </Html>
    </group>
  );
};

export default BitcoinDominanceScreen;

