import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import "./BuyCryptoScreen.css";

interface CoinData {
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
}

const BuyCryptoScreen = ({ 
  selectedPlanet,
  selectedApiId,
  onBuyCryptoScreenClick,
  position = [0, 0, 0],
  quaternion = undefined,
}: { 
  selectedPlanet: string | null;
  selectedApiId: string | null;
  onBuyCryptoScreenClick?: () => void;
  position?: [number, number, number];
  quaternion?: THREE.Quaternion | undefined;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // État pour stocker les données de l'API
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState(false);

  const BASE_SCALE: [number, number, number] = [0.105, 0.10, 1];
  
  // Positions de base pour l'écran holographique
  const basePosition: [number, number, number] = position;

  // Récupération des données depuis l'API CoinGecko
  const fetchCoinData = async () => {
    if (!selectedApiId) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${selectedApiId}`
      );
      const json = await res.json();
      if (json && json.length > 0) {
        setCoinData(json[0]);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
    } finally {
      setLoading(false);
    }
  };

  // Appel de l'API quand la crypto change
  useEffect(() => {
    fetchCoinData();
  }, [selectedApiId]);

  // Fonction pour formater les couleurs selon les variations
  const getChangeColor = (value: number) => {
    if (value > 0) return "#00ff88"; // vert
    if (value < 0) return "#ff4444"; // rouge
    return "#aaccff"; // gris
  };

  // Formatage du prix
  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Formatage du pourcentage
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
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

              {loading ? (
                <div className="loading-state">Chargement...</div>
              ) : coinData ? (
                <>
                  {/* Prix actuel et variation */}
                  <div className="price-section">
                    <div className="current-price">{formatPrice(coinData.current_price)}</div>
                    <div 
                      className="price-change"
                      style={{ color: getChangeColor(coinData.price_change_percentage_24h) }}
                    >
                      {coinData.price_change_percentage_24h >= 0 ? '▲' : '▼'} {formatPercentage(coinData.price_change_percentage_24h).replace(/[+-]/, '')}
                    </div>
                  </div>

                  {/* Stats 24h */}
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-label">24h High</div>
                      <div className="stat-value">{formatPrice(coinData.high_24h)}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">24h Low</div>
                      <div className="stat-value">{formatPrice(coinData.low_24h)}</div>
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
                <div className="loading-state">Aucune donnée disponible</div>
              )}
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