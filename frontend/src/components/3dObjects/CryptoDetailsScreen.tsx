import { RenderTexture, Text, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

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
            
            {selectedPlanet ? (
              <>
                {/* Titre avec nom de la crypto */}
                <Text 
                  position={[0, 3.5, 0]}
                  fontSize={1.4} 
                  color="#00ffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {selectedPlanet}
                </Text>

                {/* Ligne 1: Cap. Marché */}
                <Text 
                  position={[-3, 2.3, 0]}
                  fontSize={0.55} 
                  color="#8899bb"
                  anchorX="left"
                  anchorY="middle"
                >
                  Cap. Marché
                </Text>
                <Text 
                  position={[-3, 1.7, 0]}
                  fontSize={0.75} 
                  color="#ffffff"
                  anchorX="left"
                  anchorY="middle"
                >
                  {cryptoData.marketCap}
                </Text>
                <Text 
                  position={[-3, 1.15, 0]}
                  fontSize={0.55} 
                  color={getChangeColor(cryptoData.marketCapChange)}
                  anchorX="left"
                  anchorY="middle"
                >
                  {cryptoData.marketCapChange}
                </Text>

                {/* Ligne 1: Volume (24h) */}
                <Text 
                  position={[1, 2.3, 0]}
                  fontSize={0.55} 
                  color="#8899bb"
                  anchorX="left"
                  anchorY="middle"
                >
                  Volume (24h)
                </Text>
                <Text 
                  position={[1, 1.7, 0]}
                  fontSize={0.75} 
                  color="#ffffff"
                  anchorX="left"
                  anchorY="middle"
                >
                  {cryptoData.volume24h}
                </Text>
                <Text 
                  position={[1, 1.15, 0]}
                  fontSize={0.55} 
                  color={getChangeColor(cryptoData.volumeChange)}
                  anchorX="left"
                  anchorY="middle"
                >
                  {cryptoData.volumeChange}
                </Text>

                {/* Ligne 2: FDV */}
                <Text 
                  position={[-3, 0.3, 0]}
                  fontSize={0.55} 
                  color="#8899bb"
                  anchorX="left"
                  anchorY="middle"
                >
                  FDV
                </Text>
                <Text 
                  position={[-3, -0.2, 0]}
                  fontSize={0.75} 
                  color="#ffffff"
                  anchorX="left"
                  anchorY="middle"
                >
                  {cryptoData.fdv}
                </Text>

                {/* Ligne 2: Vol/Mkt Cap (24h) */}
                <Text 
                  position={[1, 0.3, 0]}
                  fontSize={0.55} 
                  color="#8899bb"
                  anchorX="left"
                  anchorY="middle"
                >
                  Vol/Mkt Cap (24h)
                </Text>
                <Text 
                  position={[1, -0.2, 0]}
                  fontSize={0.75} 
                  color="#ffffff"
                  anchorX="left"
                  anchorY="middle"
                >
                  {cryptoData.volMarketCapRatio}
                </Text>

                {/* Ligne 3: Offre Totale */}
                <Text 
                  position={[-3, -1.1, 0]}
                  fontSize={0.55} 
                  color="#8899bb"
                  anchorX="left"
                  anchorY="middle"
                >
                  Offre Totale
                </Text>
                <Text 
                  position={[-3, -1.6, 0]}
                  fontSize={0.7} 
                  color="#ffffff"
                  anchorX="left"
                  anchorY="middle"
                >
                  {cryptoData.totalSupply}
                </Text>

                {/* Ligne 3: Offre max. */}
                <Text 
                  position={[1, -1.1, 0]}
                  fontSize={0.55} 
                  color="#8899bb"
                  anchorX="left"
                  anchorY="middle"
                >
                  Offre max.
                </Text>
                <Text 
                  position={[1, -1.6, 0]}
                  fontSize={0.7} 
                  color="#ffffff"
                  anchorX="left"
                  anchorY="middle"
                >
                  {cryptoData.maxSupply}
                </Text>

                {/* Ligne 4: Offre en circulation */}
                <Text 
                  position={[-3, -2.6, 0]}
                  fontSize={0.55} 
                  color="#8899bb"
                  anchorX="left"
                  anchorY="middle"
                >
                  Offre en circulation
                </Text>
                <Text 
                  position={[-3, -3.1, 0]}
                  fontSize={0.7} 
                  color="#ffffff"
                  anchorX="left"
                  anchorY="middle"
                >
                  {cryptoData.circulatingSupply}
                </Text>
              </>
            ) : (
              <>
                <Text 
                  position={[0, 0.9, 0]}
                  fontSize={0.75} 
                  color="#666699"
                  anchorX="center"
                  anchorY="middle"
                >
                  [ CRYPTO DETAILS ]
                </Text>
                <Text 
                  position={[0, 0.0, 0]}
                  fontSize={0.75} 
                  color="#4488aa"
                  anchorX="center"
                  anchorY="middle"
                >
                  Sélectionnez une planète
                </Text>
                <Text 
                  position={[0, -0.75, 0]}
                  fontSize={0.55} 
                  color="#335577"
                  anchorX="center"
                  anchorY="middle"
                >
                  pour afficher les détails
                </Text>
              </>
            )}
          </RenderTexture>
        </meshBasicMaterial>
      </mesh>
    </group>
  );
};

export default CryptoDetailsScreen;

