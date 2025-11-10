import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import "./CryptoDetailsScreen.css";

const CryptoDetailsScreen = ({ 
  selectedPlanet,
  onScreenClick,
  useMotions = false,
  position = [0, 0, 0],
  quaternion = undefined,
}: { 
  selectedPlanet: string | null;
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

  // Données simulées pour une crypto (à remplacer par des vraies données API plus tard)
  const cryptoData = {
    marketCap: "408,59B $",
    marketCapChange: "+1.98%",
    volume24h: "37,58B $",
    volumeChange: "-49.14%",
    fdv: "408,6B $",
    volMarketCapRatio: "9,35%",
    totalSupply: "120,69M ETH",
    maxSupply: "∞",
    circulatingSupply: "120,69M ETH"
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
          className="crypto-details-container"
          onClick={(e) => {
            e.stopPropagation();
            onScreenClick && onScreenClick();
          }}
        >
          {selectedPlanet ? (
            <>
              {/* Titre */}
              <h1 className="crypto-title">
                {selectedPlanet}
              </h1>

              {/* Grille des métriques */}
              <div className="metrics-grid">
                {/* ROW 1: Cap. Marché - Full Width */}
                <div className="metric-card-full">
                  <div>
                    <div className="metric-label-large">
                      CAP. MARCHÉ
                    </div>
                    <div className="metric-value-large">
                      {cryptoData.marketCap}
                    </div>
                  </div>
                  <div 
                    className="metric-change"
                    style={{ color: getChangeColor(cryptoData.marketCapChange) }}
                  >
                    {cryptoData.marketCapChange}
                  </div>
                </div>

                {/* ROW 2: Volume (24h) */}
                <div className="metric-card-turquoise">
                  <div className="metric-label">
                    VOLUME (24H)
                  </div>
                  <div className="metric-value-medium">
                    {cryptoData.volume24h}
                  </div>
                  <div 
                    className="metric-change-small"
                    style={{ color: getChangeColor(cryptoData.volumeChange) }}
                  >
                    {cryptoData.volumeChange}
                  </div>
                </div>

                {/* ROW 2: FDV */}
                <div className="metric-card-turquoise">
                  <div className="metric-label">
                    FDV
                  </div>
                  <div className="metric-value">
                    {cryptoData.fdv}
                  </div>
                </div>

                {/* ROW 3: Vol/Mkt Cap (24h) */}
                <div className="metric-card-purple">
                  <div className="metric-label">
                    VOL/MKT CAP (24H)
                  </div>
                  <div className="metric-value">
                    {cryptoData.volMarketCapRatio}
                  </div>
                </div>

                {/* ROW 3: Offre Totale */}
                <div className="metric-card-purple">
                  <div className="metric-label">
                    OFFRE TOTALE
                  </div>
                  <div className="metric-value-small">
                    {cryptoData.totalSupply}
                  </div>
                </div>

                {/* ROW 4: Offre max. */}
                <div className="metric-card-orange">
                  <div className="metric-label">
                    OFFRE MAX.
                  </div>
                  <div className="metric-value">
                    {cryptoData.maxSupply}
                  </div>
                </div>

                {/* ROW 4: Offre en circulation */}
                <div className="metric-card-orange">
                  <div className="metric-label">
                    OFFRE EN CIRCULATION
                  </div>
                  <div className="metric-value-small">
                    {cryptoData.circulatingSupply}
                  </div>
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

