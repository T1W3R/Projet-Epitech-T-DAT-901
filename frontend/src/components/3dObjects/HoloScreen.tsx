import { RenderTexture, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const HoloScreen = ({ 
  selectedPlanet, 
  onHoloScreenClick 
}: { 
  selectedPlanet: string | null;
  onHoloScreenClick?: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  
  // Animation de scintillement holographique
  useFrame((state) => {
    if (meshRef.current && frameRef.current) {
      const time = state.clock.elapsedTime;
      
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
    <group>
      {/* Zone cliquable invisible pour toute l'interface */}
      <mesh 
        position={[-0.01, -0.21, 6.25]}
        onClick={(e) => {
          e.stopPropagation();
          onHoloScreenClick && onHoloScreenClick();
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
        position={[-0.01, -0.21, 6.23]} 
        rotation={[0, 0, 0]}
        scale={[0.18, 0.15, 1]}
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
        position={[-0.01, -0.21, 6.24]} 
        rotation={[0, 0, 0]}
        scale={[0.18, 0.15, 1]}
      >
        <planeGeometry args={[2.5, 1.5]} />
        <meshBasicMaterial
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        >
          <RenderTexture attach="map" anisotropy={16}>
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
                  color="#ffaa00"
                  anchorX="center"
                  anchorY="middle"
                >
                  Variation: +2.4%
                </Text>
                <Text 
                  position={[0, -2, 0]}
                  fontSize={0.75} 
                  color="#ff6600"
                  anchorX="center"
                  anchorY="middle"
                >
                  Volume: 2.1B $
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
                  pour afficher les données
                </Text>
              </>
            )}
          </RenderTexture>
        </meshBasicMaterial>
      </mesh>
    </group>
  );
};

export default HoloScreen;