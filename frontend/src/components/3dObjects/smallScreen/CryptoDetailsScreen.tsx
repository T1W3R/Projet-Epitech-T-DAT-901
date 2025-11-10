import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import "./CryptoDetailsScreen.css";

const CryptoDetailsScreen = ({ 
  selectedPlanet,
  onScreenClick,
  position = [0, 0, 0],
  quaternion = undefined,
}: { 
  selectedPlanet: string | null;
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

  // Données simulées pour une crypto (à remplacer par des vraies données API plus tard)
  const cryptoData = {
    marketCap: "$428.19B",
    marketCapChange: "+0.2%",
    volume24h: "$37.46B",
    volumeChange: "+46.21%",
    fdv: "$428.2B",
    volMarketCapRatio: "8.76%",
    totalSupply: "120.69M ETH",
    maxSupply: "∞",
    circulatingSupply: "120.69M ETH"
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
          width: '850px',
          height: '600px',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          className="crypto-details-container"
          onClick={(e) => {
            e.stopPropagation();
            onScreenClick && onScreenClick();
          }}
        >
          {selectedPlanet ? (
            <>
              {/* Titre avec icône info */}
              <div className="crypto-header">
                <h2 className="crypto-title">{selectedPlanet}</h2>
              </div>

              {/* Grille 3x3 des métriques */}
              <div className="metrics-grid">
                {/* ROW 1: Market Cap - Full Width (3 colonnes) */}
                <div className="metric-card metric-card-full">
                  <div className="metric-card-content">
                    <div>
                      <div className="metric-header">
                        <span className="metric-label" style={{ marginBottom: '8px' }}>Market cap</span>
                      </div>
                      <div className="metric-value">{cryptoData.marketCap}</div>
                    </div>
                    <div 
                      className="metric-change"
                      style={{ color: getChangeColor(cryptoData.marketCapChange) }}
                    >
                      {cryptoData.marketCapChange.startsWith('+') ? '▲' : '▼'} {cryptoData.marketCapChange.replace(/[+-]/, '')}
                    </div>
                  </div>
                </div>

                {/* ROW 2: Volume (24h) */}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Volume (24h)</span>
                  </div>
                  <div className="metric-card-content">
                    <div className="metric-value">{cryptoData.volume24h}</div>
                    <div 
                      className="metric-change"
                      style={{ color: getChangeColor(cryptoData.volumeChange) }}
                    >
                      {cryptoData.volumeChange.startsWith('+') ? '▲' : '▼'} {cryptoData.volumeChange.replace(/[+-]/, '')}
                    </div>
                  </div>
                </div>

                {/* ROW 2: FDV */}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">FDV</span>
                  </div>
                  <div className="metric-value">{cryptoData.fdv}</div>
                </div>

                {/* ROW 2: Vol/Mkt Cap (24h) */}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Vol/Mkt Cap (24h)</span>
                  </div>
                  <div className="metric-value">{cryptoData.volMarketCapRatio}</div>
                </div>

                {/* ROW 3: Max Supply */}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Max supply</span>
                  </div>
                  <div className="metric-value">{cryptoData.maxSupply}</div>
                </div>


                {/* ROW 3: Total Supply */}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Total supply</span>
                  </div>
                  <div className="metric-value metric-value">{cryptoData.totalSupply}</div>
                </div>

                {/* ROW 3: Circulating Supply */}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Circulating supply</span>
                  </div>
                  <div className="metric-value metric-value">{cryptoData.circulatingSupply}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-title">
                [ CRYPTO DETAILS ]
              </div>
              <div className="empty-state-subtitle">
                Sélectionnez une planète
              </div>
              <div className="empty-state-text">
                pour afficher les détails
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

export default CryptoDetailsScreen;

