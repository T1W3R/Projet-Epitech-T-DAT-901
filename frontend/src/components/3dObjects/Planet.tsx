import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type PlanetProps = ThreeElements["mesh"] & {
  textureUrl?: string;
  name: string;
  onClick?: (name: string) => void;
};

const Planet = ({ textureUrl, name, onClick, position, rotation, ...props }: PlanetProps) => {
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

  // Charger le modèle uniquement pour Bitcoin
  const isBitcoin = name === "Bitcoin";
  const bitcoinModel = isBitcoin ? useGLTF("/models/coins/btc/Bitcoin.glb").scene : null;
  const isEthereum = name === "Ethereum";
  const ethereumModel = isEthereum ? useGLTF("/models/coins/eth/Ethereum.glb").scene : null;

  // Appliquer les textures au modèle Bitcoin
  useEffect(() => {
    if (isBitcoin && bitcoinModel) {
      const textureLoader = new THREE.TextureLoader();
      
      // Charger la texture Diffuse (couleur de base)
      const diffuseTexture = textureLoader.load("/models/coins/btc/T_BTC_Diffuse.png");
      diffuseTexture.colorSpace = THREE.SRGBColorSpace;
      diffuseTexture.flipY = false; // Important pour les modèles FBX
      
      // Charger la texture Roughness
      const roughnessTexture = textureLoader.load("/models/coins/btc/T_BTC_Roughness.png");
      roughnessTexture.flipY = false;
      
      // Appliquer les textures à tous les meshes du modèle
      bitcoinModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: diffuseTexture,
            roughnessMap: roughnessTexture,
            roughness: 0.4,
            metalness: 0.6,
          });
        }
      });
    }
  }, [isBitcoin, bitcoinModel]);

  useEffect(() => {
    if (isEthereum && ethereumModel) {
      const textureLoader = new THREE.TextureLoader();
      
      // Charger la texture Diffuse (couleur de base)
      const diffuseTexture = textureLoader.load("/models/coins/eth/T_ETH_Diffuse.png");
      diffuseTexture.colorSpace = THREE.SRGBColorSpace;
      diffuseTexture.flipY = false; // Important pour les modèles FBX
      
      // Charger la texture Roughness
      const roughnessTexture = textureLoader.load("/models/coins/eth/T_ETH_Roughness.png");
      roughnessTexture.flipY = false;
      
      // Appliquer les textures à tous les meshes du modèle
      ethereumModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: diffuseTexture,
            roughnessMap: roughnessTexture,
            roughness: 0.4,
            metalness: 0.6,
          });
        }
      });
    }
  }, [isEthereum, ethereumModel]);

  useFrame((_, delta) => {
    if (isBitcoin && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2; // Rotation du modèle Bitcoin
    } else if (isEthereum && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2; // Rotation du modèle Ethereum
    } else if (ref.current) {
      ref.current.rotation.y += delta * 0.2; // Rotation des autres planètes
    }
  });

  // Si c'est Bitcoin, afficher le modèle 3D
  if (isBitcoin && bitcoinModel) {
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
        <primitive object={bitcoinModel.clone()} />

        {/* Lumières pour éclairer le Bitcoin */}
        <pointLight position={[0, 0, 3]} intensity={hovered ? 3 : 2} distance={8} color="#ffd700" />
        <pointLight position={[0, 0, -3]} intensity={hovered ? 2 : 1.5} distance={8} color="#ffaa00" />
        <pointLight position={[3, 0, 0]} intensity={1.5} distance={4} color="#ffffff" />
        <pointLight position={[-3, 0, 0]} intensity={1.5} distance={4} color="#ffffff" />
      </group>
    );
  }

  if (isEthereum && ethereumModel) {
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
        <primitive object={ethereumModel.clone()} />

        {/* Lumières pour éclairer l'Ethereum */}
        <pointLight position={[0, 0, 3]} intensity={hovered ? 3 : 2} distance={8} color="#627EEA" />
        <pointLight position={[0, 0, -3]} intensity={hovered ? 2 : 1.5} distance={8} color="#627EEA" />
        <pointLight position={[3, 0, 0]} intensity={1.5} distance={4} color="#ffffff" />
        <pointLight position={[-3, 0, 0]} intensity={1.5} distance={4} color="#ffffff" />
      </group>
    );
  }

  // Pour les autres planètes, afficher la sphère
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
