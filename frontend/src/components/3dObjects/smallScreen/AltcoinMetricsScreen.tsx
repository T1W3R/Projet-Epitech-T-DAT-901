import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import "./AltcoinMetricsScreen.css";

const AltcoinMetricsScreen = ({ 
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

  // Données simulées (à remplacer par des vraies données API plus tard)
  const fearGreedIndex = 72; // 0-100
  const altcoinSeasonIndex = 65; // 0-100

  // Déterminer la couleur selon l'indice Fear & Greed
  const getFearGreedColor = (value: number) => {
    if (value <= 25) return "#ff0000"; // Extreme Fear - Rouge
    if (value <= 45) return "#ff6600"; // Fear - Orange
    if (value <= 55) return "#ffaa00"; // Neutral - Jaune
    if (value <= 75) return "#88ff00"; // Greed - Vert clair
    return "#00ff00"; // Extreme Greed - Vert
  };

  const getFearGreedLabel = (value: number) => {
    if (value <= 25) return "Extreme Fear";
    if (value <= 45) return "Fear";
    if (value <= 55) return "Neutral";
    if (value <= 75) return "Greed";
    return "Extreme Greed";
  };

  // Déterminer la couleur selon l'indice de saison des altcoins
  const getAltcoinSeasonColor = (value: number) => {
    if (value < 25) return "#ff4444"; // Bitcoin season
    if (value < 50) return "#ffaa44"; // Bitcoin/Altcoin mix
    if (value < 75) return "#88ff44"; // Early Altcoin season
    return "#00ff88"; // Full Altcoin season
  };

  const getAltcoinSeasonLabel = (value: number) => {
    if (value < 25) return "Bitcoin Season";
    if (value < 50) return "Mixed Season";
    if (value < 75) return "Early Altcoin";
    return "Altcoin Season";
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
          className="metrics-container"
          onClick={(e) => {
            e.stopPropagation();
            onScreenClick && onScreenClick();
          }}
        >
          <h1 className="metrics-main-title">[ MARKET METRICS ]</h1>

          {/* Section Fear & Greed Index */}
          <div className="metrics-section">
            <div className="metrics-section-title">Fear & Greed Index</div>
            <div 
              className="metrics-value-large"
              style={{ color: getFearGreedColor(fearGreedIndex) }}
            >
              {fearGreedIndex}
            </div>
            <div 
              className="metrics-label"
              style={{ color: getFearGreedColor(fearGreedIndex) }}
            >
              {getFearGreedLabel(fearGreedIndex)}
            </div>
          </div>

          {/* Séparateur */}
          <div className="metrics-separator">───────────</div>

          {/* Section Altcoin Season Index */}
          <div className="metrics-section">
            <div className="metrics-section-title">Altcoin Season Index</div>
            <div 
              className="metrics-value-large"
              style={{ color: getAltcoinSeasonColor(altcoinSeasonIndex) }}
            >
              {altcoinSeasonIndex}
            </div>
            <div 
              className="metrics-label"
              style={{ color: getAltcoinSeasonColor(altcoinSeasonIndex) }}
            >
              {getAltcoinSeasonLabel(altcoinSeasonIndex)}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default AltcoinMetricsScreen;

