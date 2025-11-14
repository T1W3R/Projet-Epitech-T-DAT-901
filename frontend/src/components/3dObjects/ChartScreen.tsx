import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./ChartScreen.css";

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartScreen = ({ 
  selectedPlanet,
  selectedApiId,
  onChartScreenClick,
  position = [0, 0, 0],
  quaternion = undefined,
}: { 
  selectedPlanet: string | null;
  selectedApiId: string | null;
  onChartScreenClick?: () => void;
  position?: [number, number, number];
  quaternion?: THREE.Quaternion | undefined;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // États pour la gestion des données du graphique
  const [history, setHistory] = useState<Array<{ time: string; price: number }>>([]);
  const [period, setPeriod] = useState<string>("day");

  const BASE_SCALE: [number, number, number] = [0.18, 0.15, 1];
  
  // Positions de base pour l'écran holographique
  const basePosition: [number, number, number] = position;

  // 🔹 Récupération de l'historique selon la période
  const fetchHistory = async () => {
    if (!selectedApiId) return;
    
    try {
      const res = await fetch(`http://localhost:5000/history/${period}/${selectedApiId}`);
      const json = await res.json();
      if (json.points) setHistory(json.points);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique:", err);
    }
  };

  // Récupération des données à chaque changement de planète ou de période
  useEffect(() => {
    fetchHistory();
  }, [selectedApiId, period]);

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

  const currentPrice = history.length > 0 ? history[history.length - 1].price : null;

  const chartData = {
    labels: history.map((d) => {
      const dt = new Date(d.time);
      return period === "day"
        ? dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : dt.toLocaleDateString("fr-FR");
    }),
    datasets: [
      {
        label: `${selectedPlanet || 'Crypto'} (Euro)`,
        data: history.map((d) => d.price),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.2,
        pointRadius: 4,
        pointHoverRadius: 10,
        pointHitRadius: 30,
        pointBackgroundColor: "rgb(75, 192, 192)",
        pointBorderColor: "#00ffff",
        pointBorderWidth: 2,
      },
    ],
  };

  // Options du graphique
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#00ffff",
          font: {
            family: "'Orbitron', monospace",
            size: 20,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 10, 26, 0.9)",
        titleColor: "#00ffff",
        bodyColor: "#ffffff",
        borderColor: "#00ffff",
        borderWidth: 1,
        titleFont: {
          size: 20,
          family: "'Orbitron', monospace",
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 24,
          family: "'Orbitron', monospace",
        },
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#00ffff",
          font: {
            family: "'Orbitron', monospace",
            size: 20,
          },
        },
        grid: {
          color: "rgba(0, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "#00ffff",
          font: {
            family: "'Orbitron', monospace",
            size: 24,
          },
        },
        grid: {
          color: "rgba(0, 255, 255, 0.1)",
        },
      },
    },
  };

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
              <div className="chart-header">
                <div className="chart-title-wrapper">
                  <h2 className="chart-title">{selectedPlanet}</h2>
                  {currentPrice !== null && (
                    <span className="chart-current-price">
                      {currentPrice.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 3,
                      })}
                    </span>
                  )}
                </div>
                <div className="chart-period-selector">
                  <button 
                    className={`period-btn ${period === 'day' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPeriod('day');
                    }}
                  >
                    24H
                  </button>
                  <button 
                    className={`period-btn ${period === 'month' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPeriod('month');
                    }}
                  >
                    30J
                  </button>
                  <button 
                    className={`period-btn ${period === 'year' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPeriod('year');
                    }}
                  >
                    1A
                  </button>
                </div>
              </div>
              <div className="chart-graph-container">
                {history.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="chart-loading">Chargement des données...</div>
                )}
              </div>
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