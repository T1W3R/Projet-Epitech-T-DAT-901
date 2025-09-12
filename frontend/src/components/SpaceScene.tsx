import { Canvas } from "@react-three/fiber";
import { Stars as DreiStars, OrbitControls } from "@react-three/drei";
import Planet from "./3dObjects/Planet";
import Spaceship from "./3dObjects/Spaceship";
import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
// import { useFrame, useThree } from "@react-three/fiber"; // Utilisés dans le code commenté (CameraController)
import * as THREE from "three";
import './SpaceScene.css';
import HoloScreen from "./3dObjects/HoloScreen";
import { createScreenQuaternion } from "../utils/mathUtils";
import SmallHoloScreen from "./3dObjects/SmallHoloScreen";
import EditableObject from "../utils/EditableObject";


const ShipWithSpotlight = ({ useMotion = true }: { useMotion?: boolean }) => {
  const shipPos: [number, number, number] = [0.025, 0.2, 9];

  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

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
        useMotions={useMotion}
      />
      {/* SpotLight dans le vaisseau visant les écrans holographiques */}
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

// Composant pour gérer l'animation de la caméra (désactivé)
/*
const CameraController = memo(({ 
  isZoomedToHolo, 
  onZoomComplete 
}: { 
  isZoomedToHolo: boolean;
  onZoomComplete?: () => void;
}) => {
  const { camera } = useThree();
  const animationRef = useRef({ 
    isAnimating: false, 
    startPos: new THREE.Vector3(),
    startLookAt: new THREE.Vector3(),
    targetPos: new THREE.Vector3(),
    targetLookAt: new THREE.Vector3(),
    progress: 0
  });

  // Positions fixes pour éviter les problèmes de mutation (une seule fois)
  const positionsRef = useRef({
    HOLO_POSITION: new THREE.Vector3(-0.01, -0.21, 6.8),
    HOLO_LOOK_AT: new THREE.Vector3(-0.01, -0.21, 6.24),
    MAIN_POSITION: new THREE.Vector3(0, 0, 8),
    MAIN_LOOK_AT: new THREE.Vector3(0, 0, 0)
  });
  const { HOLO_POSITION, HOLO_LOOK_AT, MAIN_POSITION, MAIN_LOOK_AT } = positionsRef.current;

  useFrame((_, delta) => {
    const anim = animationRef.current;
    
    if (isZoomedToHolo && !anim.isAnimating && camera.position.distanceTo(HOLO_POSITION) > 0.1) {
      // Commencer l'animation vers l'écran holo
      anim.isAnimating = true;
      anim.startPos.copy(camera.position);
      anim.startLookAt.copy(MAIN_LOOK_AT);
      anim.targetPos.copy(HOLO_POSITION);
      anim.targetLookAt.copy(HOLO_LOOK_AT);
      anim.progress = 0;
    } else if (!isZoomedToHolo && !anim.isAnimating && camera.position.distanceTo(MAIN_POSITION) > 0.1) {
      // Commencer l'animation de retour
      anim.isAnimating = true;
      anim.startPos.copy(camera.position);
      anim.startLookAt.copy(HOLO_LOOK_AT);
      anim.targetPos.copy(MAIN_POSITION);
      anim.targetLookAt.copy(MAIN_LOOK_AT);
      anim.progress = 0;
    }

    if (anim.isAnimating) {
      anim.progress += delta * 2; // Vitesse d'animation
      
      if (anim.progress >= 1) {
        anim.progress = 1;
        anim.isAnimating = false;
        console.log("✅ Animation terminée, isZoomedToHolo:", isZoomedToHolo);
        onZoomComplete && onZoomComplete();
      }
      
      // Interpolation smooth (ease-in-out)
      const t = 0.5 - 0.5 * Math.cos(anim.progress * Math.PI);
      
      // Position de la caméra
      camera.position.lerpVectors(anim.startPos, anim.targetPos, t);
    }
  });

  return null;
});
*/

// Composant de la scène 3D pure (ne se re-render JAMAIS !)
const Scene3D = memo(({ 
  onPlanetClick, 
  debug = false,
  useMotion = true
}: { 
  onPlanetClick: (name: string) => void;
  debug?: boolean;
  useMotion?: boolean;
}) => {
  const controlsRef = useRef<typeof OrbitControls>(null);

  // Génération de planètes à différentes profondeurs (stable)
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} />

      {/* Fond étoilé via drei */}
      <DreiStars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

      {/* Vaisseau + spotLight avec helpers */}
      <ShipWithSpotlight useMotion={useMotion} />

      {planets.map((p, idx) => (
        <Planet
          key={`${p.name}-${idx}`}
          name={p.name}
          position={p.position}
          textureUrl={p.textureUrl}
          onClick={onPlanetClick}
        />
      ))}
      
      {/* OrbitControls pour debug uniquement */}
      {debug && (
        <OrbitControls
          ref={controlsRef as any}
          enableDamping
          makeDefault
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
        />
      )}
    </>
  );
});

// Composant principal avec le state (seul le HUD se re-render)
const SpaceScene = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [isZoomedToHolo, setIsZoomedToHolo] = useState(false);
  
  // États pour le mode édition des écrans
  const [isEditMode, setIsEditMode] = useState(true);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate");
  const [selectedScreen, setSelectedScreen] = useState<"mainHolo" | "smallRightHolo" | null>(null);
  const [screenPositions, setScreenPositions] = useState({
    mainHolo: [-0.01, -0.21, 6.24] as [number, number, number],
    smallRightHolo: [0.424, -0.278, 6.475] as [number, number, number]
  });
  const [screenRotations, setScreenRotations] = useState({
    mainHolo: [0, 0, 0] as [number, number, number],
    smallRightHolo: [0, 0, 0] as [number, number, number]
  });
  
  // Stabilise la fonction pour éviter les re-renders de Scene3D
  const handlePlanetClick = useCallback((name: string) => {
    setSelectedPlanet(name);
  }, []);

  // Gestionnaire pour le clic sur l'écran holographique (stabilisé avec ref)
  const isZoomedRef = useRef(isZoomedToHolo);
  isZoomedRef.current = isZoomedToHolo;
  
  const handleHoloScreenClick = useCallback(() => {
    setIsZoomedToHolo(!isZoomedRef.current);
  }, []);

  const handleSmallHoloScreenClick = useCallback(() => {
    // setIsZoomedToHolo(!isZoomedRef.current); //TODO: Create the animation to zoom to the small right holo screen
    console.log("SmallRightHoloScreen clicked");
  }, []);

  return (
    <>
      <Canvas camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 500 }}>
        {/* Contrôleur d'animation de caméra (indépendant de la scène) */}
        {/* <CameraController isZoomedToHolo={isZoomedToHolo} /> */}
        
        <Scene3D 
          onPlanetClick={handlePlanetClick} 
          debug={true}
          useMotion={false}
        />
        <EditableObject 
          isEditing={isEditMode}
          isSelected={selectedScreen === "mainHolo"}
          transformMode={transformMode}
          initialPosition={screenPositions.mainHolo}
          onSelect={() => setSelectedScreen("mainHolo")}
          onPositionChange={(pos) => setScreenPositions(prev => ({ ...prev, mainHolo: pos }))}
          onRotationChange={(rot) => setScreenRotations(prev => ({ ...prev, mainHolo: rot }))}
        >
          <HoloScreen 
            selectedPlanet={selectedPlanet} 
            onHoloScreenClick={handleHoloScreenClick}
            useMotions={false}
            position={[0, 0, 0]} // Position relative dans le groupe parent
          />
        </EditableObject>
        
        <EditableObject 
          isEditing={isEditMode}
          isSelected={selectedScreen === "smallRightHolo"}
          transformMode={transformMode}
          initialPosition={screenPositions.smallRightHolo}
          onSelect={() => setSelectedScreen("smallRightHolo")}
          onPositionChange={(pos) => setScreenPositions(prev => ({ ...prev, smallRightHolo: pos }))}
          onRotationChange={(rot) => setScreenRotations(prev => ({ ...prev, smallRightHolo: rot }))}
        >
          <SmallHoloScreen 
            selectedPlanet={selectedPlanet} 
            onSmallHoloScreenClick={handleSmallHoloScreenClick}
            useMotions={false}
            position={[0, 0, 0]} // Position relative dans le groupe parent
            quaternion={createScreenQuaternion(-29.9, -59.5)}
          />
        </EditableObject>
      </Canvas>

      {/* Interface de contrôle holographique */}
      <div className="holo-control-panel">
        <div className="holo-control-header">[ CONTRÔLES SYSTÈME ]</div>

        {/* Mode Édition */}
        <div className="holo-control-item">
          <label className="holo-checkbox-container">
            <input
              type="checkbox"
              checked={isEditMode}
              onChange={(e) => setIsEditMode(e.target.checked)}
              className="holo-checkbox"
            />
            <span className="holo-checkmark"></span>
            <span className="holo-label">🛠️ Edit Mode</span>
          </label>
        </div>

        {/* Sélecteur d'écran à éditer */}
        {isEditMode && (
          <div className="holo-control-item">
            <span className="holo-label">Écran sélectionné:</span>
            <select 
              value={selectedScreen || ""} 
              onChange={(e) => setSelectedScreen(e.target.value as "mainHolo" | "smallRightHolo" || null)}
              className="holo-select-screen"
            >
              <option value="">Aucun</option>
              <option value="mainHolo">🖥️ Écran Principal</option>
              <option value="smallRightHolo">📱 Petit Écran Droite</option>
            </select>
          </div>
        )}

        {/* Sélecteur de mode de transformation */}
        {isEditMode && selectedScreen && (
          <div className="holo-control-item">
            <span className="holo-label">Transform Mode:</span>
            <select 
              value={transformMode} 
              onChange={(e) => setTransformMode(e.target.value as "translate" | "rotate" | "scale")}
              className="holo-select-transform"
            >
              <option value="translate">📍 Move</option>
              <option value="rotate">🔄 Rotate</option>
              <option value="scale">📏 Scale</option>
            </select>
          </div>
        )}

        {/* Affichage des coordonnées de l'écran sélectionné */}
        {isEditMode && selectedScreen && (
          <div className="holo-control-item holo-coordinates-display">
            <div>📍 Position: [{screenPositions[selectedScreen].map(x => x.toFixed(3)).join(', ')}]</div>
            <div>🔄 Rotation: [{screenRotations[selectedScreen].map(x => x.toFixed(3)).join(', ')}]</div>
          </div>
        )}

        {/* Bouton pour copier les coordonnées */}
        {isEditMode && selectedScreen && (
          <div className="holo-control-item">
            <button 
              onClick={() => {
                const pos = screenPositions[selectedScreen];
                const rot = screenRotations[selectedScreen];
                const code = `// ${selectedScreen === 'mainHolo' ? 'Écran Principal' : 'Petit Écran'}
position: [${pos.map(x => x.toFixed(3)).join(', ')}],
rotation: [${rot.map(x => x.toFixed(3)).join(', ')}]`;
                navigator.clipboard.writeText(code);
                console.log('📋 Coordonnées copiées dans le presse-papier !', code);
                alert('📋 Coordonnées copiées !');
              }}
              className="holo-copy-button"
            >
              📋 Copy Position
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SpaceScene;
