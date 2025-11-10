import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import "./BuyCryptoScreen.css";

const BuyCryptoScreen = ({ 
  selectedPlanet, 
  onBuyCryptoScreenClick,
  position = [0, 0, 0],
  quaternion = undefined,
}: { 
  selectedPlanet: string | null;
  onBuyCryptoScreenClick?: () => void;
  position?: [number, number, number];
  quaternion?: THREE.Quaternion | undefined;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const BASE_SCALE: [number, number, number] = [0.105, 0.10, 1];
  
  // Positions de base pour l'écran holographique
  const basePosition: [number, number, number] = position;

  //* Données de prix simulées (à remplacer par des vraies données API plus tard)
  const priceData = {
    currentPrice: "$45,123.89",
    priceChange: "+2.34%",
    high24h: "$46,234.12",
    low24h: "$44,012.45"
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
          className="buy-crypto-container"
          onClick={(e) => {
            e.stopPropagation();
            onBuyCryptoScreenClick && onBuyCryptoScreenClick();
          }}
        >
          {selectedPlanet ? (
            <>
              {/* Header avec nom de la crypto */}
              <div className="buy-crypto-header">
                <h2 className="buy-crypto-title">{selectedPlanet}</h2>
              </div>

              {/* Prix actuel et variation */}
              <div className="price-section">
                <div className="current-price">{priceData.currentPrice}</div>
                <div 
                  className="price-change"
                  style={{ color: getChangeColor(priceData.priceChange) }}
                >
                  {priceData.priceChange.startsWith('+') ? '▲' : '▼'} {priceData.priceChange.replace(/[+-]/, '')}
                </div>
              </div>

              {/* Stats 24h */}
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">24h High</div>
                  <div className="stat-value">{priceData.high24h}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">24h Low</div>
                  <div className="stat-value">{priceData.low24h}</div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="buy-crypto-actions">
                <button className="buy-button">
                  <span className="button-text">Buy</span>
                </button>
                <button className="sell-button">
                  <span className="button-text">Sell</span>
                </button>
              </div>
            </>
          ) : (
            <div className="buy-crypto-empty-state">
              <div className="buy-crypto-empty-title">
                [ TRADING ]
              </div>
              <div className="buy-crypto-empty-subtitle">
                Sélectionnez une planète
              </div>
              <div className="buy-crypto-empty-text">
                pour trader
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

export default BuyCryptoScreen;