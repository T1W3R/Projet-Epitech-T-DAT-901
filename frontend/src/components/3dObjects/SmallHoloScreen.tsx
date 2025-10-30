import { RenderTexture, Text, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const SmallHoloScreen = ({ 
  selectedPlanet, 
  onSmallHoloScreenClick,
  useMotions = false,
  position = [0, 0, 0],
  quaternion = undefined,
}: { 
  selectedPlanet: string | null;
  onSmallHoloScreenClick?: () => void;
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
    //   // Même oscillation de rotation sur l'axe Z que le vaisseau et l'axe X
    //   groupRef.current.rotation.z -= Math.sin(time * 1) * 0.0005;
    //   groupRef.current.position.x -= Math.sin(time * 1) * 0.0002;

    //   // Même oscillation de position sur l'axe Y que le vaisseau
    //   groupRef.current.position.y = basePosition[1] + Math.sin(time * 1) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={basePosition} quaternion={quaternion}>
      {/* Zone cliquable invisible pour toute l'interface */}
      <mesh 
        position={[0, 0, 0.01]}
        onClick={(e) => {
          e.stopPropagation();
          onSmallHoloScreenClick && onSmallHoloScreenClick();
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
                <Text 
                  position={[0, 2.5, 0]}
                  fontSize={1.75} 
                  color="#00ffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {selectedPlanet}
                </Text>
                <Text 
                  position={[0, 0, 0]}
                  fontSize={0.75} 
                  color="#00ff88"
                  anchorX="center"
                  anchorY="middle"
                >
                  Prix: $45,123.89
                </Text>
                <Text 
                  position={[0, -1, 0]}
                  fontSize={0.75} 
                  color="#00ff00"
                  anchorX="center"
                  anchorY="middle"
                >
                  Achetez
                </Text>
                <Text 
                  position={[0, -2, 0]}
                  fontSize={0.75} 
                  color="#ff0000"
                  anchorX="center"
                  anchorY="middle"
                >
                  Vendre
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
                  [ SYSTÈME SPATIAL ]
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
                  pour afficher des données supplémentaires
                </Text>
              </>
            )}
          </RenderTexture>
        </meshBasicMaterial>
      </mesh>
    </group>
  );
};

export default SmallHoloScreen;