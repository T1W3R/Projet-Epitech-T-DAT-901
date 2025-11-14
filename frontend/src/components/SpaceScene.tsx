import { Canvas } from "@react-three/fiber";
import { Stars as DreiStars, OrbitControls, Stats } from "@react-three/drei";
import Planet from "./3dObjects/Planet";
import Spaceship from "./3dObjects/Spaceship";
import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import './SpaceScene.css';
import ChartScreen from "./3dObjects/ChartScreen";
import { createScreenQuaternion } from "../utils/mathUtils";
import BuyCryptoScreen from "./3dObjects/smallScreen/BuyCryptoScreen";
import AltcoinMetricsScreen from "./3dObjects/smallScreen/AltcoinMetricsScreen";
import CryptoDetailsScreen from "./3dObjects/smallScreen/CryptoDetailsScreen";
import BitcoinDominanceScreen from "./3dObjects/smallScreen/BitcoinDominanceScreen";
import EditableObject from "../utils/EditableObject";


const ShipWithSpotlight = () => {
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
      <mesh ref={targetRef as unknown as React.RefObject<THREE.Mesh>}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff00ff" />
      </mesh>
    </>
  );
};

const CameraController = memo(({ 
  zoomTarget,
  onZoomComplete 
}: { 
  zoomTarget: 'none' | 'chart' | 'buyCrypto' | 'altcoinMetrics' | 'cryptoDetails' | 'btcDominance';
  onZoomComplete?: () => void;
}) => {
  const { camera } = useThree();
  const animationRef = useRef({ 
    isAnimating: false, 
    startPos: new THREE.Vector3(),
    startLookAt: new THREE.Vector3(),
    targetPos: new THREE.Vector3(),
    targetLookAt: new THREE.Vector3(),
    progress: 0,
    currentTarget: 'none' as 'none' | 'chart' | 'buyCrypto' | 'altcoinMetrics' | 'cryptoDetails' | 'btcDominance'
  });

  // Positions fixes pour éviter les problèmes de mutation (une seule fois)
  const positionsRef = useRef({
    CHART_POSITION: new THREE.Vector3(-0.01, -0.21, 6.6),
    CHART_LOOK_AT: new THREE.Vector3(-0.01, -0.21, 6.24),
    BUY_CRYPTO_POSITION: new THREE.Vector3(),
    BUY_CRYPTO_LOOK_AT: new THREE.Vector3(0.424, -0.278, 6.475),
    ALTCOIN_METRICS_POSITION: new THREE.Vector3(),
    ALTCOIN_METRICS_LOOK_AT: new THREE.Vector3(0.593, -0.277, 6.755),
    CRYPTO_DETAILS_POSITION: new THREE.Vector3(),
    CRYPTO_DETAILS_LOOK_AT: new THREE.Vector3(-0.435, -0.274, 6.490),
    BTC_DOMINANCE_POSITION: new THREE.Vector3(),
    BTC_DOMINANCE_LOOK_AT: new THREE.Vector3(-0.598, -0.277, 6.768),
    MAIN_POSITION: new THREE.Vector3(0, 0, 8),
    MAIN_LOOK_AT: new THREE.Vector3(0, 0, 0)
  });
  
  // Calculer les positions de la caméra pour les écrans inclinés
  useEffect(() => {
    // Buy Crypto Screen (premier a droite)
    const buyCryptoScreenPos = new THREE.Vector3(0.424, -0.278, 6.475);
    const buyCryptoQuaternion = createScreenQuaternion(-29.9, -59.5);
    
    const buyCryptoNormal = new THREE.Vector3(0, 0, 1);
    buyCryptoNormal.applyQuaternion(buyCryptoQuaternion);
    
    const buyCryptoCameraDistance = 0.45;
    const buyCryptoCameraPos = buyCryptoScreenPos.clone().add(buyCryptoNormal.multiplyScalar(buyCryptoCameraDistance));
    
    positionsRef.current.BUY_CRYPTO_POSITION.copy(buyCryptoCameraPos);
    
    // Altcoin Metrics Screen (deuxieme a droite)
    const altcoinScreenPos = new THREE.Vector3(0.593, -0.277, 6.755);
    const altcoinQuaternion = createScreenQuaternion(-29.9, -59.5);
    
    const altcoinNormal = new THREE.Vector3(0, 0, 1);
    altcoinNormal.applyQuaternion(altcoinQuaternion);
    
    const altcoinCameraDistance = 0.45;
    const altcoinCameraPos = altcoinScreenPos.clone().add(altcoinNormal.multiplyScalar(altcoinCameraDistance));
    
    positionsRef.current.ALTCOIN_METRICS_POSITION.copy(altcoinCameraPos);
    
    // Crypto Details Screen (premier a gauche)
    const cryptoDetailsScreenPos = new THREE.Vector3(-0.435, -0.274, 6.490);
    const cryptoDetailsQuaternion = createScreenQuaternion(-29.9, 59.9);
    
    const cryptoDetailsNormal = new THREE.Vector3(0, 0, 1);
    cryptoDetailsNormal.applyQuaternion(cryptoDetailsQuaternion);
    
    const cryptoDetailsCameraDistance = 0.45;
    const cryptoDetailsCameraPos = cryptoDetailsScreenPos.clone().add(cryptoDetailsNormal.multiplyScalar(cryptoDetailsCameraDistance));
    
    positionsRef.current.CRYPTO_DETAILS_POSITION.copy(cryptoDetailsCameraPos);
    
    // Bitcoin Dominance Screen (deuxieme a gauche)
    const btcDominanceScreenPos = new THREE.Vector3(-0.598, -0.277, 6.768);
    const btcDominanceQuaternion = createScreenQuaternion(-29.9, 59.9);
    
    const btcDominanceNormal = new THREE.Vector3(0, 0, 1);
    btcDominanceNormal.applyQuaternion(btcDominanceQuaternion);
    
    const btcDominanceCameraDistance = 0.45;
    const btcDominanceCameraPos = btcDominanceScreenPos.clone().add(btcDominanceNormal.multiplyScalar(btcDominanceCameraDistance));
    
    positionsRef.current.BTC_DOMINANCE_POSITION.copy(btcDominanceCameraPos);
  }, []);

  const { CHART_POSITION, CHART_LOOK_AT, BUY_CRYPTO_POSITION, BUY_CRYPTO_LOOK_AT, ALTCOIN_METRICS_POSITION, ALTCOIN_METRICS_LOOK_AT, CRYPTO_DETAILS_POSITION, CRYPTO_DETAILS_LOOK_AT, BTC_DOMINANCE_POSITION, BTC_DOMINANCE_LOOK_AT, MAIN_POSITION, MAIN_LOOK_AT } = positionsRef.current;

  // Mapping des targets vers leurs positions et lookAt
  const targetMapping = useMemo(() => ({
    none: { position: MAIN_POSITION, lookAt: MAIN_LOOK_AT },
    chart: { position: CHART_POSITION, lookAt: CHART_LOOK_AT },
    buyCrypto: { position: BUY_CRYPTO_POSITION, lookAt: BUY_CRYPTO_LOOK_AT },
    altcoinMetrics: { position: ALTCOIN_METRICS_POSITION, lookAt: ALTCOIN_METRICS_LOOK_AT },
    cryptoDetails: { position: CRYPTO_DETAILS_POSITION, lookAt: CRYPTO_DETAILS_LOOK_AT },
    btcDominance: { position: BTC_DOMINANCE_POSITION, lookAt: BTC_DOMINANCE_LOOK_AT }
  }), [MAIN_POSITION, MAIN_LOOK_AT, CHART_POSITION, CHART_LOOK_AT, BUY_CRYPTO_POSITION, BUY_CRYPTO_LOOK_AT, ALTCOIN_METRICS_POSITION, ALTCOIN_METRICS_LOOK_AT, CRYPTO_DETAILS_POSITION, CRYPTO_DETAILS_LOOK_AT, BTC_DOMINANCE_POSITION, BTC_DOMINANCE_LOOK_AT]);

  useFrame((_, delta) => {
    const anim = animationRef.current;
    
    // Détecter un changement de target
    if (zoomTarget !== anim.currentTarget && !anim.isAnimating) {
      anim.isAnimating = true;
      anim.startPos.copy(camera.position);
      anim.progress = 0;
      
      // Récupérer les positions source et destination depuis le mapping
      const targetConfig = targetMapping[zoomTarget];
      const currentConfig = targetMapping[anim.currentTarget];
      
      // Définir la destination
      anim.targetPos.copy(targetConfig.position);
      anim.targetLookAt.copy(targetConfig.lookAt);
      
      // Définir le point de départ du lookAt
      anim.startLookAt.copy(currentConfig.lookAt);
      
      anim.currentTarget = zoomTarget;
    }

    if (anim.isAnimating) {
      anim.progress += delta * 2;
      
      if (anim.progress >= 1) {
        anim.progress = 1;
        anim.isAnimating = false;
        onZoomComplete && onZoomComplete();
      }
      
      // Interpolation smooth (ease-in-out)
      const t = 0.5 - 0.5 * Math.cos(anim.progress * Math.PI);
      
      // Position de la caméra
      camera.position.lerpVectors(anim.startPos, anim.targetPos, t);
      
      // Orientation de la caméra (lookAt interpolé)
      const currentLookAt = new THREE.Vector3().lerpVectors(anim.startLookAt, anim.targetLookAt, t);
      camera.lookAt(currentLookAt);
    }
  });

  return null;
});


// Composant de la scène 3D pure (ne se re-render JAMAIS !)
const Scene3D = memo(({ 
  onPlanetClick, 
  debug = false,
}: { 
  onPlanetClick: (name: string, apiId: string) => void;
  debug?: boolean;
}) => {
  const controlsRef = useRef<typeof OrbitControls>(null);

  // Génération de planètes à différentes profondeurs (stable)
  const planets = useMemo(
    () => [
      { name: "Bitcoin",      apiId: "bitcoin",                 position: [-6,  2, -5]  as [number, number, number] },    //BTC
      { name: "Ethereum",     apiId: "ethereum",                position: [ 5,  1, -8]  as [number, number, number] },    //ETH
      { name: "XRP",          apiId: "ripple",                  position: [ -3, 7, -12] as [number, number, number] },    //XRP
      { name: "Solana",       apiId: "solana",                  position: [ 2,  5, -16] as [number, number, number] },    //SOL
      { name: "Cardano",      apiId: "cardano",                 position: [-5,  0, -20] as [number, number, number] },    //ADA
      { name: "Chainlink",    apiId: "chainlink",               position: [ 6,  3, -24] as [number, number, number] },    //LINK
      { name: "Decentraland", apiId: "decentraland",            position: [-4,  5.5, -28] as [number, number, number] }, //MANA
      { name: "Avalanche",    apiId: "avalanche-2",             position: [ 2, 2.5, -32] as [number, number, number] },   //AVAX
      { name: "Polygone",     apiId: "polygon-ecosystem-token", position: [ -11, 3.5, -36] as [number, number, number] }, //POLY
    ],
    []
  );

  return (
    <>      
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={2} />

      {/* Fond étoilé via drei */}
      <DreiStars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

      {/* Vaisseau + spotLight avec helpers */}
      <ShipWithSpotlight />

      {planets.map((p, idx) => (
        <Planet
          key={`${p.name}-${idx}`}
          name={p.name}
          apiId={p.apiId}
          position={p.position}
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
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);
  const [zoomTarget, setZoomTarget] = useState<'none' | 'chart' | 'buyCrypto' | 'altcoinMetrics' | 'cryptoDetails' | 'btcDominance'>('none');
  
  // États pour le mode édition des écrans
  const [isEditMode, setIsEditMode] = useState(false);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate");
  const [selectedScreen, setSelectedScreen] = useState<"chart" | "buyCrypto" | "altcoinMetrics" | "cryptoDetails" | "btcDominance" | null>(null);
  const [screenPositions, setScreenPositions] = useState({
    chart: [-0.01, -0.21, 6.24] as [number, number, number],
    buyCrypto: [0.424, -0.278, 6.475] as [number, number, number],
    altcoinMetrics: [0.593, -0.277, 6.755] as [number, number, number],
    cryptoDetails: [-0.435, -0.274, 6.490] as [number, number, number],
    btcDominance: [-0.597, -0.277, 6.772] as [number, number, number]
  });
  const [screenRotations, setScreenRotations] = useState({
    chart: [0, 0, 0] as [number, number, number],
    buyCrypto: [0, 0, 0] as [number, number, number],
    altcoinMetrics: [0, 0, 0] as [number, number, number],
    cryptoDetails: [0, 0, 0] as [number, number, number],
    btcDominance: [0, 0, 0] as [number, number, number]
  });
  
  // Stabilise la fonction pour éviter les re-renders de Scene3D
  const handlePlanetClick = useCallback((name: string, apiId: string) => {
    setSelectedPlanet(name);
    setSelectedApiId(apiId);
  }, []);

  // Gestionnaire pour le clic sur l'écran holographique principal (stabilisé avec ref)
  const zoomTargetRef = useRef(zoomTarget);
  zoomTargetRef.current = zoomTarget;
  
  const handleChartScreenClick = useCallback(() => {
    setZoomTarget(prev => prev === 'chart' ? 'none' : 'chart');
  }, []);

  const handleBuyCryptoScreenClick = useCallback(() => {
    setZoomTarget(prev => prev === 'buyCrypto' ? 'none' : 'buyCrypto');
  }, []);

  const handleAltcoinMetricsScreenClick = useCallback(() => {
    setZoomTarget(prev => prev === 'altcoinMetrics' ? 'none' : 'altcoinMetrics');
  }, []);

  const handleCryptoDetailsScreenClick = useCallback(() => {
    setZoomTarget(prev => prev === 'cryptoDetails' ? 'none' : 'cryptoDetails');
  }, []);

  const handleBtcDominanceScreenClick = useCallback(() => {
    setZoomTarget(prev => prev === 'btcDominance' ? 'none' : 'btcDominance');
  }, []);

  return (
    <>
      <Canvas camera={{ position: [0, 0, 8], fov: 60, near: 0.01, far: 500 }}>
        <Stats />
        
        {/* Contrôleur d'animation de caméra (indépendant de la scène) */}
        <CameraController zoomTarget={zoomTarget} />
        
        <Scene3D 
          onPlanetClick={handlePlanetClick} 
          debug={false}
        />

        <EditableObject 
          isEditing={isEditMode}
          isSelected={selectedScreen === "chart"}
          transformMode={transformMode}
          initialPosition={screenPositions.chart}
          onSelect={() => setSelectedScreen("chart")}
          onPositionChange={(pos) => setScreenPositions(prev => ({ ...prev, chart: pos }))}
          onRotationChange={(rot) => setScreenRotations(prev => ({ ...prev, chart: rot }))}
        >
          <ChartScreen 
            selectedPlanet={selectedPlanet}
            selectedApiId={selectedApiId}
            onChartScreenClick={handleChartScreenClick}
            position={[0, 0, 0]} // Position relative dans le groupe parent
          />
        </EditableObject>
        
        <EditableObject 
          isEditing={isEditMode}
          isSelected={selectedScreen === "buyCrypto"}
          transformMode={transformMode}
          initialPosition={screenPositions.buyCrypto}
          onSelect={() => setSelectedScreen("buyCrypto")}
          onPositionChange={(pos) => setScreenPositions(prev => ({ ...prev, buyCrypto: pos }))}
          onRotationChange={(rot) => setScreenRotations(prev => ({ ...prev, buyCrypto: rot }))}
        >
          <BuyCryptoScreen 
            selectedPlanet={selectedPlanet}
            selectedApiId={selectedApiId}
            onBuyCryptoScreenClick={handleBuyCryptoScreenClick}
            position={[0, 0, 0]}
            quaternion={createScreenQuaternion(-29.9, -59.5)}
          />
        </EditableObject>
        
        <EditableObject 
          isEditing={isEditMode}
          isSelected={selectedScreen === "altcoinMetrics"}
          transformMode={transformMode}
          initialPosition={screenPositions.altcoinMetrics}
          onSelect={() => setSelectedScreen("altcoinMetrics")}
          onPositionChange={(pos) => setScreenPositions(prev => ({ ...prev, altcoinMetrics: pos }))}
          onRotationChange={(rot) => setScreenRotations(prev => ({ ...prev, altcoinMetrics: rot }))}
        >
          <AltcoinMetricsScreen 
            onScreenClick={handleAltcoinMetricsScreenClick}
            position={[0, 0, 0]}
            quaternion={createScreenQuaternion(-29.9, -59.5)}
          />
        </EditableObject>
        
        <EditableObject 
          isEditing={isEditMode}
          isSelected={selectedScreen === "cryptoDetails"}
          transformMode={transformMode}
          initialPosition={screenPositions.cryptoDetails}
          onSelect={() => setSelectedScreen("cryptoDetails")}
          onPositionChange={(pos) => setScreenPositions(prev => ({ ...prev, cryptoDetails: pos }))}
          onRotationChange={(rot) => setScreenRotations(prev => ({ ...prev, cryptoDetails: rot }))}
        >
          <CryptoDetailsScreen 
            selectedPlanet={selectedPlanet}
            selectedApiId={selectedApiId}
            onScreenClick={handleCryptoDetailsScreenClick}
            position={[0, 0, 0]}
            quaternion={createScreenQuaternion(-29.9, 59.9)}
          />
        </EditableObject>
        
        <EditableObject 
          isEditing={isEditMode}
          isSelected={selectedScreen === "btcDominance"}
          transformMode={transformMode}
          initialPosition={screenPositions.btcDominance}
          onSelect={() => setSelectedScreen("btcDominance")}
          onPositionChange={(pos) => setScreenPositions(prev => ({ ...prev, btcDominance: pos }))}
          onRotationChange={(rot) => setScreenRotations(prev => ({ ...prev, btcDominance: rot }))}
        >
          <BitcoinDominanceScreen 
            onScreenClick={handleBtcDominanceScreenClick}
            position={[0, 0, 0]}
            quaternion={createScreenQuaternion(-29.9, 60)}
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
              onChange={(e) => setSelectedScreen(e.target.value as "chart" | "buyCrypto" | "altcoinMetrics" | "cryptoDetails" | "btcDominance" || null)}
              className="holo-select-screen"
            >
              <option value="">Aucun</option>
              <option value="chart">🖥️ Chart</option>
              <option value="buyCrypto">📱 Buy Crypto</option>
              <option value="altcoinMetrics">📊 Altcoin Metrics</option>
              <option value="cryptoDetails">💰 Crypto Details</option>
              <option value="btcDominance">₿ BTC Dominance</option>
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
                const code = `// ${selectedScreen === 'chart' ? 'Écran Chart' : 'Petit Écran'}
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
