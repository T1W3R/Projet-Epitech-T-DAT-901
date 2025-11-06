import { RenderTexture, Text, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const BitcoinDominanceScreen = ({ 
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

  // Données simulées pour la dominance (à remplacer par des vraies données API plus tard)
  const dominanceData = {
    bitcoin: {
      percentage: 60.0,
      change: "+1.88%",
      color: "#ff9500"
    },
    ethereum: {
      percentage: 11.9,
      change: "-1.32%",
      color: "#627eea"
    },
    others: {
      percentage: 28.1,
      change: "-0.56%",
      color: "#888888"
    }
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
            
            {/* Titre */}
            <Text 
              position={[0, 3.5, 0]}
              fontSize={1.2} 
              color="#00ffff"
              anchorX="center"
              anchorY="middle"
            >
              Dominance Bitcoin
            </Text>

            {/* Bitcoin */}
            <group position={[-3.5, 1.8, 0]}>
              <mesh position={[0.35, 0, 0]}>
                <circleGeometry args={[0.15, 16]} />
                <meshBasicMaterial color={dominanceData.bitcoin.color} />
              </mesh>
              <Text 
                position={[0.8, 0, 0]}
                fontSize={0.65} 
                color="#ffffff"
                anchorX="left"
                anchorY="middle"
              >
                Bitcoin
              </Text>
            </group>

            {/* Ethereum */}
            <group position={[0.2, 1.8, 0]}>
              <mesh position={[0.35, 0, 0]}>
                <circleGeometry args={[0.15, 16]} />
                <meshBasicMaterial color={dominanceData.ethereum.color} />
              </mesh>
              <Text 
                position={[0.8, 0, 0]}
                fontSize={0.65} 
                color="#ffffff"
                anchorX="left"
                anchorY="middle"
              >
                Ethereum
              </Text>
            </group>

            {/* Autres */}
            <group position={[3.8, 1.8, 0]}>
              <mesh position={[0.35, 0, 0]}>
                <circleGeometry args={[0.15, 16]} />
                <meshBasicMaterial color={dominanceData.others.color} />
              </mesh>
              <Text 
                position={[0.8, 0, 0]}
                fontSize={0.65} 
                color="#ffffff"
                anchorX="left"
                anchorY="middle"
              >
                Autres
              </Text>
            </group>

            {/* Pourcentages */}
            <Text 
              position={[-3.5, 0.8, 0]}
              fontSize={1.2} 
              color="#ffffff"
              anchorX="left"
              anchorY="middle"
            >
              {dominanceData.bitcoin.percentage.toFixed(1)}%
            </Text>

            <Text 
              position={[0.2, 0.8, 0]}
              fontSize={1.2} 
              color="#ffffff"
              anchorX="left"
              anchorY="middle"
            >
              {dominanceData.ethereum.percentage.toFixed(1)}%
            </Text>

            <Text 
              position={[3.8, 0.8, 0]}
              fontSize={1.2} 
              color="#ffffff"
              anchorX="left"
              anchorY="middle"
            >
              {dominanceData.others.percentage.toFixed(1)}%
            </Text>

            {/* Variations */}
            <Text 
              position={[-3.5, 0.1, 0]}
              fontSize={0.6} 
              color={getChangeColor(dominanceData.bitcoin.change)}
              anchorX="left"
              anchorY="middle"
            >
              {dominanceData.bitcoin.change}
            </Text>

            <Text 
              position={[0.2, 0.1, 0]}
              fontSize={0.6} 
              color={getChangeColor(dominanceData.ethereum.change)}
              anchorX="left"
              anchorY="middle"
            >
              {dominanceData.ethereum.change}
            </Text>

            <Text 
              position={[3.8, 0.1, 0]}
              fontSize={0.6} 
              color={getChangeColor(dominanceData.others.change)}
              anchorX="left"
              anchorY="middle"
            >
              {dominanceData.others.change}
            </Text>

            {/* Barre de progression composite */}
            <group position={[0, -1.5, 0]}>
              {/* Fond de la barre */}
              <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[8, 0.3]} />
                <meshBasicMaterial color="#1a1a2e" opacity={0.8} transparent />
              </mesh>

              {/* Segment Bitcoin */}
              <mesh position={[-4 + (dominanceData.bitcoin.percentage / 100 * 8) / 2, 0, 0]}>
                <planeGeometry args={[(dominanceData.bitcoin.percentage / 100) * 8, 0.3]} />
                <meshBasicMaterial color={dominanceData.bitcoin.color} />
              </mesh>

              {/* Segment Ethereum */}
              <mesh position={[-4 + (dominanceData.bitcoin.percentage / 100 * 8) + (dominanceData.ethereum.percentage / 100 * 8) / 2, 0, 0]}>
                <planeGeometry args={[(dominanceData.ethereum.percentage / 100) * 8, 0.3]} />
                <meshBasicMaterial color={dominanceData.ethereum.color} />
              </mesh>

              {/* Segment Autres */}
              <mesh position={[-4 + (dominanceData.bitcoin.percentage / 100 * 8) + (dominanceData.ethereum.percentage / 100 * 8) + (dominanceData.others.percentage / 100 * 8) / 2, 0, 0]}>
                <planeGeometry args={[(dominanceData.others.percentage / 100) * 8, 0.3]} />
                <meshBasicMaterial color={dominanceData.others.color} />
              </mesh>
            </group>

            {/* Informations supplémentaires */}
            <Text 
              position={[0, -2.8, 0]}
              fontSize={0.5} 
              color="#6699cc"
              anchorX="center"
              anchorY="middle"
            >
              Total Market Cap: $2.8T
            </Text>
          </RenderTexture>
        </meshBasicMaterial>
      </mesh>
    </group>
  );
};

export default BitcoinDominanceScreen;

