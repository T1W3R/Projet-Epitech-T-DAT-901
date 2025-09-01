import { useRef, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";

type SpaceshipProps = {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  useMotions?: boolean;
  // Si true, synchronise la position Z avec la caméra
  followCamera?: boolean;
  // Décalage appliqué par rapport à la caméra sur l'axe Z
  zOffset?: number;
};

// Composant pour charger le modèle FBX
const FBXModel = () => {
  const fbx = useLoader(FBXLoader, "/models/Spaceship_with_glass.fbx");

  // Centrer et ajuster le modèle
  const box = new THREE.Box3().setFromObject(fbx);
  const center = box.getCenter(new THREE.Vector3());
  fbx.position.sub(center);

  // Appliquer des transformations au modèle si nécessaire
  fbx.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      // Assurer que le matériau est compatible
      if (child.material) {
        child.material.needsUpdate = true;
      }
    }
  });

  return <primitive object={fbx} />;
};

// Composant de fallback en cas d'erreur de chargement
const FallbackSpaceship = () => (
  <mesh>
    <boxGeometry args={[1, 1, 2]} />
    <meshStandardMaterial color="#4a90e2" />
  </mesh>
);

// Composant principal du vaisseau spatial
const Spaceship = ({
  position = [0, 0, 0],
  scale = 0.01,
  rotation = [0, 0, 0],
  useMotions = true,
  followCamera = false,
  zOffset = 1.5,
}: SpaceshipProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Animation légère du vaisseau spatial
  useFrame((state) => {
    if (groupRef.current) {
      if (useMotions) {
        // Légère oscillation de rotation sur l'axe Z
        groupRef.current.rotation.z += Math.sin(state.clock.elapsedTime * 1) * 0.0005;

        // Légère oscillation de position sur l'axe Y
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1) * 0.05;
      }

      // Suivi simple de la caméra sur l'axe Z
      if (followCamera) {
        groupRef.current.position.z = state.camera.position.z + zOffset;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[scale, scale, scale]}
      rotation={rotation}
    >
      <Suspense fallback={<FallbackSpaceship />}>
        <FBXModel />
      </Suspense>
    </group>
  );
};

export default Spaceship;
