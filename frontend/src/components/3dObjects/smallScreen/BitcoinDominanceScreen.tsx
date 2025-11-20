import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import "./BitcoinDominanceScreen.css";

const BitcoinDominanceScreen = ({ 
  onScreenClick,
  position = [0, 0, 0],
  quaternion = undefined,
}: { 
  onScreenClick?: () => void;
  position?: [number, number, number];
  quaternion?: THREE.Quaternion | undefined;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const BASE_SCALE: [number, number, number] = [0.105, 0.10, 1];
  
  // Positions de base pour l'écran holographique
  const basePosition: [number, number, number] = position;

  //* Données simulées pour la dominance (à remplacer par des vraies données API plus tard)
  const dominanceData = {
    bitcoin: {
      percentage: 58.6,
      change: "-0.42%",
      color: "#F7931A"
    },
    ethereum: {
      percentage: 11.6,
      change: "-1.15%",
      color: "#627EEA" 
    },
    others: {
      percentage: 29.8,
      change: "+1.57%",
      color: "#8A8A8A" 
    }
  };

  // Fonction pour formater les couleurs selon les variations
  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return "#00ff88"; // vert
    if (change.startsWith('-')) return "#ff4444"; // rouge
    return "#aaccff"; // gris
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
          width: '800px',
          height: '600px',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          className="dominance-container"
          onClick={(e) => {
            e.stopPropagation();
            onScreenClick && onScreenClick();
          }}
        >
          {/* Titre */}
          <h2 className="dominance-title">Bitcoin Dominance</h2>

          <div className="dominance-grid">
            {/* Bitcoin */}
            <div className="dominance-item">
              <div className="dominance-header">
                <div 
                  className="dominance-bullet" 
                  style={{ backgroundColor: dominanceData.bitcoin.color }}
                />
                <span className="dominance-name">Bitcoin</span>
              </div>
              <div className="dominance-percentage">
                {dominanceData.bitcoin.percentage.toFixed(1)}%
              </div>
              <div 
                className="dominance-change" 
                style={{ color: getChangeColor(dominanceData.bitcoin.change) }}
              >
                {dominanceData.bitcoin.change.startsWith('+') ? '▲' : '▼'} {dominanceData.bitcoin.change.replace(/[+-]/, '')}
              </div>
            </div>

            {/* Ethereum */}
            <div className="dominance-item">
              <div className="dominance-header">
                <div 
                  className="dominance-bullet" 
                  style={{ backgroundColor: dominanceData.ethereum.color }}
                />
                <span className="dominance-name">Ethereum</span>
              </div>
              <div className="dominance-percentage">
                {dominanceData.ethereum.percentage.toFixed(1)}%
              </div>
              <div 
                className="dominance-change" 
                style={{ color: getChangeColor(dominanceData.ethereum.change) }}
              >
                {dominanceData.ethereum.change.startsWith('+') ? '▲' : '▼'} {dominanceData.ethereum.change.replace(/[+-]/, '')}
              </div>
            </div>

            {/* Others */}
            <div className="dominance-item">
              <div className="dominance-header">
                <div 
                  className="dominance-bullet" 
                  style={{ backgroundColor: dominanceData.others.color }}
                />
                <span className="dominance-name">Others</span>
              </div>
              <div className="dominance-percentage">
                {dominanceData.others.percentage.toFixed(1)}%
              </div>
              <div 
                className="dominance-change" 
                style={{ color: getChangeColor(dominanceData.others.change) }}
              >
                {dominanceData.others.change.startsWith('+') ? '▲' : '▼'} {dominanceData.others.change.replace(/[+-]/, '')}
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="dominance-bar-container">
            <div className="dominance-bar">
              <div 
                className="bar-segment bitcoin-bar"
                style={{ 
                  width: `${dominanceData.bitcoin.percentage}%`,
                  backgroundColor: dominanceData.bitcoin.color
                }}
              />
              <div 
                className="bar-segment ethereum-bar"
                style={{ 
                  width: `${dominanceData.ethereum.percentage}%`,
                  backgroundColor: dominanceData.ethereum.color
                }}
              />
              <div 
                className="bar-segment others-bar"
                style={{ 
                  width: `${dominanceData.others.percentage}%`,
                  backgroundColor: dominanceData.others.color
                }}
              />
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default BitcoinDominanceScreen;

