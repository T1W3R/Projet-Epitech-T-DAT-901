import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import "./CryptoDetailsScreen.css";

interface CoinData {
  market_cap: number;
  market_cap_change_percentage_24h: number;
  total_volume: number;
  fully_diluted_valuation: number;
  total_supply: number;
  max_supply: number | null;
  circulating_supply: number;
}

const CryptoDetailsScreen = ({ 
  selectedPlanet,
  selectedApiId,
  onScreenClick,
  position = [0, 0, 0],
  quaternion = undefined,
}: { 
  selectedPlanet: string | null;
  selectedApiId: string | null;
  onScreenClick?: () => void;
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
    if (value > 0) return "#00ff88";
    if (value < 0) return "#ff4444";
    return "#aaccff";
  };

  // Formatage du nombre en milliards/millions
  const formatLargeNumber = (value: number) => {
    if (value >= 1e9) {
      return `€${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `€${(value / 1e6).toFixed(2)}M`;
    }
    return `€${value.toLocaleString('fr-FR')}`;
  };

  // Formatage du supply
  const formatSupply = (value: number | null, symbol: string = '') => {
    if (value === null) return "∞";
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B ${symbol}`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M ${symbol}`;
    }
    return `${value.toLocaleString('fr-FR')} ${symbol}`;
  };

  // Formatage du pourcentage
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Calcul du ratio Volume/Market Cap
  const getVolMarketCapRatio = () => {
    if (!coinData) return "N/A";
    const ratio = (coinData.total_volume / coinData.market_cap) * 100;
    return `${ratio.toFixed(2)}%`;
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

              {loading ? (
                <div className="loading-state">Chargement...</div>
              ) : coinData ? (
                <>
                  {/* Grille 3x3 des métriques */}
                  <div className="metrics-grid">
                    {/* ROW 1: Market Cap - Full Width (3 colonnes) */}
                    <div className="metric-card metric-card-full">
                      <div className="metric-card-content">
                        <div>
                          <div className="metric-header">
                            <span className="metric-label" style={{ marginBottom: '8px' }}>Market cap</span>
                          </div>
                          <div className="metric-value">{formatLargeNumber(coinData.market_cap)}</div>
                        </div>
                        <div 
                          className="metric-change"
                          style={{ color: getChangeColor(coinData.market_cap_change_percentage_24h || 0) }}
                        >
                          {(coinData.market_cap_change_percentage_24h || 0) >= 0 ? '▲' : '▼'} {formatPercentage(coinData.market_cap_change_percentage_24h || 0).replace(/[+-]/, '')}
                        </div>
                      </div>
                    </div>

                    {/* ROW 2: Volume (24h) */}
                    <div className="metric-card">
                      <div className="metric-header">
                        <span className="metric-label">Volume (24h)</span>
                      </div>
                      <div className="metric-card-content">
                        <div className="metric-value">{formatLargeNumber(coinData.total_volume)}</div>
                      </div>
                    </div>

                    {/* ROW 2: FDV */}
                    <div className="metric-card">
                      <div className="metric-header">
                        <span className="metric-label">FDV</span>
                      </div>
                      <div className="metric-value">{formatLargeNumber(coinData.fully_diluted_valuation || coinData.market_cap)}</div>
                    </div>

                    {/* ROW 2: Vol/Mkt Cap (24h) */}
                    <div className="metric-card">
                      <div className="metric-header">
                        <span className="metric-label">Vol/Mkt Cap (24h)</span>
                      </div>
                      <div className="metric-value">{getVolMarketCapRatio()}</div>
                    </div>

                    {/* ROW 3: Max Supply */}
                    <div className="metric-card">
                      <div className="metric-header">
                        <span className="metric-label">Max supply</span>
                      </div>
                      <div className="metric-value">{formatSupply(coinData.max_supply)}</div>
                    </div>

                    {/* ROW 3: Total Supply */}
                    <div className="metric-card">
                      <div className="metric-header">
                        <span className="metric-label">Total supply</span>
                      </div>
                      <div className="metric-value metric-value">{formatSupply(coinData.total_supply)}</div>
                    </div>

                    {/* ROW 3: Circulating Supply */}
                    <div className="metric-card">
                      <div className="metric-header">
                        <span className="metric-label">Circulating supply</span>
                      </div>
                      <div className="metric-value metric-value">{formatSupply(coinData.circulating_supply)}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="loading-state">Aucune donnée disponible</div>
              )}
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

