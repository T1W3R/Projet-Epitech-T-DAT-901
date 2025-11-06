import { RenderTexture, Text, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

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
      {/* Zone cliquable invisible pour toute l'interface */}
      <mesh 
        position={[0, 0, 0.01]}
        onClick={(e) => {
          e.stopPropagation();
          onScreenClick && onScreenClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <planeGeometry args={[0.5, 0.25]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

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

      {/* Écran holographique principal */}
      <mesh 
        ref={meshRef}
        position={[0, 0, -0.008]} 
        rotation={[0, 0, 0]}
        scale={BASE_SCALE}
      >
        <planeGeometry args={[2.5, 1.5]} />
        <meshBasicMaterial
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        >
          <RenderTexture attach="map" anisotropy={16}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <color attach="background" args={["#000a1a"]} />
            <ambientLight intensity={0.8} />
            
            {/* Titre de l'écran */}
            <Text 
              position={[0, 3.2, 0]}
              fontSize={1.2} 
              color="#00ffff"
              anchorX="center"
              anchorY="middle"
            >
              [ MARKET METRICS ]
            </Text>

            {/* Section Fear & Greed Index */}
            <Text 
              position={[0, 1.8, 0]}
              fontSize={0.85} 
              color="#aaccff"
              anchorX="center"
              anchorY="middle"
            >
              Fear & Greed Index
            </Text>
            <Text 
              position={[0, 0.8, 0]}
              fontSize={1.5} 
              color={getFearGreedColor(fearGreedIndex)}
              anchorX="center"
              anchorY="middle"
            >
              {fearGreedIndex}
            </Text>
            <Text 
              position={[0, 0, 0]}
              fontSize={0.65} 
              color={getFearGreedColor(fearGreedIndex)}
              anchorX="center"
              anchorY="middle"
            >
              {getFearGreedLabel(fearGreedIndex)}
            </Text>

            {/* Séparateur */}
            <Text 
              position={[0, -0.8, 0]}
              fontSize={0.5} 
              color="#335577"
              anchorX="center"
              anchorY="middle"
            >
              ───────────
            </Text>

            {/* Section Altcoin Season Index */}
            <Text 
              position={[0, -1.5, 0]}
              fontSize={0.85} 
              color="#aaccff"
              anchorX="center"
              anchorY="middle"
            >
              Altcoin Season Index
            </Text>
            <Text 
              position={[0, -2.4, 0]}
              fontSize={1.5} 
              color={getAltcoinSeasonColor(altcoinSeasonIndex)}
              anchorX="center"
              anchorY="middle"
            >
              {altcoinSeasonIndex}
            </Text>
            <Text 
              position={[0, -3.2, 0]}
              fontSize={0.65} 
              color={getAltcoinSeasonColor(altcoinSeasonIndex)}
              anchorX="center"
              anchorY="middle"
            >
              {getAltcoinSeasonLabel(altcoinSeasonIndex)}
            </Text>
          </RenderTexture>
        </meshBasicMaterial>
      </mesh>
    </group>
  );
};

export default AltcoinMetricsScreen;

