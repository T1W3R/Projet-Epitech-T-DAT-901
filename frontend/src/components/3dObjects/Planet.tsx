import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type PlanetProps = ThreeElements["mesh"] & {
  name: string;
  onClick?: (name: string) => void;
};

// Mapping des noms de crypto vers leurs modèles et textures
const CRYPTO_MODELS: Record<string, { 
  modelPath: string; 
  diffuseTexture?: string; 
  roughnessTexture?: string;
  lightColor: string;
}> = {
  "Bitcoin": {
    modelPath: "/models/coins/btc/Bitcoin.glb",
    diffuseTexture: "/models/coins/btc/T_BTC_Diffuse.png",
    roughnessTexture: "/models/coins/btc/T_BTC_Roughness.png",
    lightColor: "#ffd700"
  },
  "Ethereum": {
    modelPath: "/models/coins/eth/Ethereum.glb",
    diffuseTexture: "/models/coins/eth/T_ETH_Diffuse.png",
    roughnessTexture: "/models/coins/eth/T_ETH_Roughness.png",
    lightColor: "#627EEA"
  },
  "XRP": {
    modelPath: "/models/coins/xrp/XRP.glb",
    // diffuseTexture: "/models/coins/xrp/T_XRP_Diffuse.png",
    // roughnessTexture: "/models/coins/xrp/T_XRP_Roughness.png",
    lightColor: "#23292F"
  },
  "Solana": {
    modelPath: "/models/coins/sol/Solana.glb",
    // diffuseTexture: "/models/coins/sol/T_SOL_Diffuse.png",
    // roughnessTexture: "/models/coins/sol/T_SOL_Roughness.png",
    lightColor: "#14F195"
  },
  "Cardano": {
    modelPath: "/models/coins/ada/ADA.glb",
    diffuseTexture: "/models/coins/ada/T_ADA_Diffuse.png",
    roughnessTexture: "/models/coins/ada/T_ADA_Roughness.png",
    lightColor: "#0033AD"
  },
  "Chainlink": {
    modelPath: "/models/coins/link/Chainlink.glb",
    diffuseTexture: "/models/coins/link/T_LINK_DIFFUSE.png",
    roughnessTexture: "/models/coins/link/T_LINK_ROUGHNESS.png",
    lightColor: "#2A5ADA"
  },
  "Avalanche": {
    modelPath: "/models/coins/avax/AVAX.glb",
    // diffuseTexture: "/models/coins/avax/T_AVAX_Diffuse.png",
    // roughnessTexture: "/models/coins/avax/T_AVAX_Roughness.png",
    lightColor: "#E84142"
  },
  "Decentraland": {
    modelPath: "/models/coins/mana/Decentraland.glb",
    diffuseTexture: "/models/coins/mana/T_MANA_Diffuse.png",
    roughnessTexture: "/models/coins/mana/T_MANA_Roughness.png",
    lightColor: "#FF2D55"
  },
  "Polygone": {
    modelPath: "/models/coins/poly/Polygon.glb",
    diffuseTexture: "/models/coins/poly/T_MATIC_Diffuse.png",
    roughnessTexture: "/models/coins/poly/T_MATIC_Roughness.png",
    lightColor: "#8247E5"
  }
};

const Planet = ({ name, onClick, position, rotation, ...props }: PlanetProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const randomBaseColor = useMemo(() => {
    const hue = Math.random();
    const saturation = 0.6 + Math.random() * 0.3; // 0.6 - 0.9
    const lightness = 0.4 + Math.random() * 0.2; // 0.4 - 0.6
    const color = new THREE.Color().setHSL(hue, saturation, lightness);
    return `#${color.getHexString()}`;
  }, []);

  // Rotation initiale aléatoire pour varier les positions de départ
  const initialRotation = useMemo(() => Math.random() * Math.PI * 2, []);

  // Vérifier si la crypto a un modèle 3D
  const cryptoConfig = CRYPTO_MODELS[name];
  const has3DModel = !!cryptoConfig;
  const gltfScene = has3DModel ? useGLTF(cryptoConfig.modelPath).scene : null;

  // Créer une copie du modèle avec les textures appliquées
  const model3D = useMemo(() => {
    if (!has3DModel || !gltfScene) return null;

    const clonedScene = gltfScene.clone(true);

    // Appliquer les textures si disponibles
    if (cryptoConfig.diffuseTexture && cryptoConfig.roughnessTexture) {
      const textureLoader = new THREE.TextureLoader();
      
      const diffuseTexture = textureLoader.load(cryptoConfig.diffuseTexture);
      diffuseTexture.colorSpace = THREE.SRGBColorSpace;
      diffuseTexture.flipY = false;
      
      const roughnessTexture = textureLoader.load(cryptoConfig.roughnessTexture);
      roughnessTexture.flipY = false;
      
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: diffuseTexture,
            roughnessMap: roughnessTexture,
            roughness: 0.4,
            metalness: 0.5,
          });
        }
      });
    }

    return clonedScene;
  }, [has3DModel, gltfScene, cryptoConfig]);

  // Initialiser la rotation aléatoire a l'init
  useEffect(() => {
    if (has3DModel && groupRef.current) {
      groupRef.current.rotation.y = initialRotation;
    } else if (ref.current) {
      ref.current.rotation.y = initialRotation;
    }
  }, [has3DModel, initialRotation]);

  useFrame((_, delta) => {
    if (has3DModel && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    } else if (ref.current) {
      ref.current.rotation.y += delta * 0.2;
    }
  });

  if (has3DModel && model3D) {
    return (
      <group
        position={position}
        rotation={rotation}
        ref={groupRef}
        scale={hovered ? 0.9 : 0.75}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(name);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <primitive object={model3D} />
        <primitive object={model3D.clone()} rotation={[0, Math.PI, 0]} />

        {/* Lumières pour éclairer le modèle 3D */}
        <pointLight position={[0, 0, 3]} intensity={hovered ? 3 : 2} distance={8} color={cryptoConfig.lightColor} />
        <pointLight position={[0, 0, -3]} intensity={hovered ? 2 : 1.5} distance={8} color={cryptoConfig.lightColor} />
        <pointLight position={[3, 0, 0]} intensity={1.5} distance={4} color="#ffffff" />
        <pointLight position={[-3, 0, 0]} intensity={1.5} distance={4} color="#ffffff" />
      </group>
    );
  }

  return (
    <mesh
      position={position}
      rotation={rotation}
      {...props}
      ref={ref}
      scale={hovered ? 1.2 : 1}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(name);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        map={undefined}
        color={hovered ? "#44f" : randomBaseColor}
        emissive={hovered ? "#224" : "black"}
      />
    </mesh>
  );
};

export type { PlanetProps };
export default Planet;
