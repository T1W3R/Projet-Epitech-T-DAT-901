import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import "./AltcoinMetricsScreen.css";

const AltcoinMetricsScreen = ({ 
  onScreenClick,
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
  const fearGreedIndex = 30; // 0-100
  const altcoinSeasonIndex = 25; // 0-100

  // Déterminer la couleur selon l'indice Fear & Greed
  const getFearGreedColor = (value: number) => {
    if (value <= 25) return "#EA3943"; // Extreme Fear - Rouge
    if (value <= 45) return "#FF6B00"; // Fear - Orange
    if (value <= 55) return "#F3BA2F"; // Neutral - Jaune
    if (value <= 75) return "#93D900"; // Greed - Vert clair
    return "#16C784"; // Extreme Greed - Vert
  };

  const getFearGreedLabel = (value: number) => {
    if (value <= 25) return "Extreme Fear";
    if (value <= 45) return "Fear";
    if (value <= 55) return "Neutral";
    if (value <= 75) return "Greed";
    return "Extreme Greed";
  };

  // Path complet du gauge (arc de 180°)
  const fullGaugeArc = "M 5 50 A 45 45 0 0 1 95 50";
  const arcLength = Math.PI * 45;
  
  const getStrokeDashoffset = (value: number) => {
    const p = Math.max(0, Math.min(100, value));
    return arcLength * (1 - p / 100);
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
        }}
      >
        <div
          className="metrics-container"
          onClick={(e) => {
            e.stopPropagation();
            onScreenClick && onScreenClick();
          }}
        >
          {/* Section Fear & Greed Index avec Gauge */}
          <div className="fear-greed-section">
            <div className="fear-greed-header">
              <span className="fear-greed-title">Fear & Greed</span>
            </div>
            
            <div className="gauge-container">
              <svg viewBox="0 0 100 60" className="gauge-svg">
                {/* Fond du gauge (arc gris) */}
                <path
                  d="M 5 50 A 45 45 0 0 1 95 50"
                  fill="none"
                  stroke="#2a2e39"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Arc coloré selon la valeur avec animation */}
                <path
                  d={fullGaugeArc}
                  fill="none"
                  stroke={getFearGreedColor(fearGreedIndex)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={arcLength}
                  strokeDashoffset={getStrokeDashoffset(fearGreedIndex)}
                  className="gauge-arc"
                />
              </svg>
              
              <div className="gauge-value">
                <div className="gauge-number">{fearGreedIndex}</div>
                <div className="gauge-label">{getFearGreedLabel(fearGreedIndex)}</div>
              </div>
            </div>
          </div>

          {/* Section Altcoin Season avec barre horizontale */}
          <div className="altcoin-season-section">
            <div className="altcoin-season-header">
              <span className="altcoin-season-title">Altcoin season</span>
            </div>
            
            <div className="altcoin-season-value">
              <span className="season-number">{altcoinSeasonIndex}</span>
              <span className="season-total">/ 100</span>
            </div>
            
            <div className="season-bar-container">
              <div className="season-labels">
                <span className="season-label-left">Bitcoin</span>
                <span className="season-label-right">Altcoin</span>
              </div>
              
              <div className="season-bar-track">
                <div className="season-bar-gradient" />
                <div 
                  className="season-bar-thumb"
                  style={{ left: `${altcoinSeasonIndex}%` }}
                >
                  <div className="season-bar-thumb-circle" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default AltcoinMetricsScreen;


