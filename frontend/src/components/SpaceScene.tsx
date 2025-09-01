import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars as DreiStars } from "@react-three/drei";
import Planet from "./3dObjects/Planet";
import Spaceship from "./3dObjects/Spaceship";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import './SpaceScene.css';

const SpaceScene = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const targetZRef = useRef(8); // position cible de la caméra sur Z
  const controlsRef = useRef<any>(null);

  // Génération de planètes à différentes profondeurs
  const planets = useMemo(
    () => [
      { name: "Bitcoin",    position: [-6,  2, -5]  as [number, number, number], textureUrl: "" },
      { name: "Ethereum",   position: [ 5,  1, -8]  as [number, number, number], textureUrl: "" },
      { name: "XRP",        position: [ 0, -5, -12] as [number, number, number], textureUrl: "" },
      { name: "Solana",     position: [ 2,  5, -16] as [number, number, number], textureUrl: "" },
      { name: "Cardano",    position: [-5,  0, -20] as [number, number, number], textureUrl: "" },
      { name: "Chainlink",  position: [ 6,  3, -24] as [number, number, number], textureUrl: "" },
      { name: "Avalanche",  position: [-4,  5, -28] as [number, number, number], textureUrl: "" },
      { name: "Uniswap",    position: [ 3, -4, -32] as [number, number, number], textureUrl: "" },
      { name: "NEAR",       position: [ -5, -2, -36] as [number, number, number], textureUrl: "" },
    ],
    []
  );

  // Gestion du scroll lissé (avancée dans la scène)
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Ajuste la cible Z de manière régulière
      const sensitivity = 0.02; // facteur de déplacement
      targetZRef.current += e.deltaY * sensitivity;
      // Limites de déplacement
      targetZRef.current = THREE.MathUtils.clamp(targetZRef.current, -40, 200);      
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel as EventListener);
  }, []);

  // Driver lissé de la caméra vers targetZ
  const SmoothCameraDriver = () => {
    useFrame(({ camera }, delta) => {
      const newZ = THREE.MathUtils.damp(
        camera.position.z,
        targetZRef.current,
        3, // coefficient d’amortissement
        delta
      );
      camera.position.z = newZ;
      // Maintient la caméra regardant "devant" en déplaçant la cible des controls
      if (controlsRef.current) {
        const target = controlsRef.current.target;
        target.z = newZ - 10; // décale la cible 10 unités devant
        controlsRef.current.update();
      } else {
        camera.lookAt(0, 0, newZ - 10);
      }
    });
    return null;
  };
  
  return (
    <>
      <Canvas camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 500 }}>
        <SmoothCameraDriver />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />

        {/* Fond étoilé via drei */}
        <DreiStars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

        {/* Vaisseau spatial près de la caméra */}
        <Spaceship position={[-0.07, 0.2, 9.5]} rotation={[0, 135.05, 0]} scale={0.01} useMotions={false} />

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
          ref={controlsRef}
          enableDamping
          makeDefault
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
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
