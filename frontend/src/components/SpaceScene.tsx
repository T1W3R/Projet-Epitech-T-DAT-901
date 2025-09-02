import { Canvas } from "@react-three/fiber";
import { Stars as DreiStars, OrbitControls, useHelper } from "@react-three/drei";
import Planet from "./3dObjects/Planet";
import Spaceship from "./3dObjects/Spaceship";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import './SpaceScene.css';

const ShipWithSpotlight = () => {
  const shipPos: [number, number, number] = [0, 0.2, 9];

  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  useHelper(spotRef as any, THREE.SpotLightHelper, "cyan");

  useEffect(() => {
    if (!spotRef.current || !targetRef.current) return;
    spotRef.current.position.set(shipPos[0], shipPos[1] , shipPos[2] - 1.25);
    targetRef.current.position.set(shipPos[0], shipPos[1] - 1, shipPos[2] - 3);
    spotRef.current.target = targetRef.current;
    spotRef.current.target.updateMatrixWorld();
  }, []);

  return (
    <>
      <Spaceship
        position={shipPos}
        rotation={[0, 135.1, 0]}
        scale={0.01}
        useMotions={false}
      />

      {/* SpotLight au-dessus du vaisseau, pointant vers le bas */}
      <spotLight
        ref={spotRef}
        intensity={25}
        angle={0.75}
        penumbra={0.5}
        distance={60}
        decay={3}
        color={"#00ffff"}
        castShadow
      />
      {/* Cible visible pour debug */}
      <mesh ref={targetRef as unknown as React.RefObject<THREE.Mesh>}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff00ff" />
      </mesh>
    </>
  );
};

const SpaceScene = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const controlsRef = useRef<typeof OrbitControls>(null);

  // Génération de planètes à différentes profondeurs
  const planets = useMemo(
    () => [
      { name: "Bitcoin",    position: [-6,  2, -5]  as [number, number, number], textureUrl: "" },
      { name: "Ethereum",   position: [ 5,  1, -8]  as [number, number, number], textureUrl: "" },
      { name: "XRP",        position: [ -3, 7, -12] as [number, number, number], textureUrl: "" },
      { name: "Solana",     position: [ 2,  5, -16] as [number, number, number], textureUrl: "" },
      { name: "Cardano",    position: [-5,  0, -20] as [number, number, number], textureUrl: "" },
      { name: "Chainlink",  position: [ 6,  3, -24] as [number, number, number], textureUrl: "" },
      { name: "Avalanche",  position: [-4,  5, -28] as [number, number, number], textureUrl: "" },
      { name: "Uniswap",    position: [ 3, 3, -32] as [number, number, number], textureUrl: "" },
      { name: "NEAR",       position: [ -11, 3, -36] as [number, number, number], textureUrl: "" },
    ],
    []
  );

  return (
    <>
      <Canvas camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 500 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />

        {/* Fond étoilé via drei */}
        <DreiStars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

        {/* Vaisseau + spotLight avec helpers */}
        <ShipWithSpotlight />

        {planets.map((p, idx) => (
          <Planet
            key={`${p.name}-${idx}`}
            name={p.name}
            position={p.position}
            textureUrl={p.textureUrl}
            onClick={setSelectedPlanet}
          />
        ))}

        <OrbitControls
          ref={controlsRef as any}
          enableDamping
          makeDefault
          enableZoom={false}
          enablePan={true}
          enableRotate={true}
        />
      </Canvas>
      {selectedPlanet && (
        <div className="holo-container">
          <h2>{selectedPlanet}</h2>
          <p>📊 Prix: ...</p>
          <p>💰 MarketCap: ...</p>
          <p>📈 Variation: ...</p>
        </div>
      )}
    </>
  );
};

export default SpaceScene;
