# 🚀 CryptoSpace - Visualisation 3D de Cryptomonnaies

## 📖 Introduction

**CryptoSpace** est une application web innovante qui transforme l'expérience de suivi des cryptomonnaies en une aventure spatiale immersive. Au lieu d'afficher de simples tableaux de données, l'application projette l'utilisateur dans un **cockpit de vaisseau spatial** où chaque cryptomonnaie est représentée par une **planète** flottant dans l'espace.

L'interface combine la puissance de la **3D en temps réel** avec des **écrans holographiques** affichant les données financières, créant une expérience unique et engageante.

---

## 🌌 Concept & Univers Visuel

### L'idée principale

Imaginez un pilote de vaisseau spatial naviguant dans une galaxie où chaque planète représente une cryptomonnaie :

- **Bitcoin** → Une planète dorée
- **Ethereum** → Une planète bleutée
- **Solana** → Une planète verte luminescente
- etc.

Le pilote dispose d'un tableau de bord holographique avec plusieurs écrans affichant en temps réel :
- Les graphiques de prix
- Les statistiques de trading
- Les indicateurs de marché

### Pourquoi ce choix ?

1. **Engagement** : La 3D capte l'attention et rend l'exploration des données plus ludique
2. **Clarté** : Les écrans holographiques organisent l'information de manière intuitive
3. **Modernité** : L'esthétique futuriste reflète l'aspect innovant des cryptomonnaies

---

## 🎮 Fonctionnalités Principales

### 1. Navigation dans l'espace

L'utilisateur peut observer un champ de **planètes 3D** représentant différentes cryptomonnaies. Chaque planète est positionnée à différentes profondeurs, créant un effet de profondeur immersif.

**Cryptomonnaies disponibles :**
| Planète | Cryptomonnaie | Couleur caractéristique |
|---------|---------------|------------------------|
| 🟡 | Bitcoin (BTC) | Or |
| 🔵 | Ethereum (ETH) | Bleu |
| ⚪ | XRP | Gris foncé |
| 🟢 | Solana (SOL) | Vert |
| 🔵 | Cardano (ADA) | Bleu royal |
| 🔷 | Chainlink (LINK) | Bleu |
| 🔴 | Decentraland (MANA) | Rose |
| 🔴 | Avalanche (AVAX) | Rouge |
| 🟣 | Polygon (POLY) | Violet |

### 2. Interaction avec les planètes

En cliquant sur une planète, l'utilisateur sélectionne la cryptomonnaie correspondante. Les écrans holographiques se mettent alors à jour pour afficher les informations de cette crypto.

### 3. Écrans Holographiques

Cinq écrans flottants entourent le cockpit :

| Écran | Fonction | Position |
|-------|----------|----------|
| **Chart** (central) | Graphique de prix sur 24h, 30j ou 1 an | Centre |
| **Buy Crypto** | Prix actuel + Boutons Acheter/Vendre | Droite proche |
| **Altcoin Metrics** | Indice Fear & Greed + Altcoin Season | Droite éloigné |
| **Crypto Details** | Market Cap, Volume, Supply | Gauche proche |
| **BTC Dominance** | Part de marché Bitcoin vs Altcoins | Gauche éloigné |

### 4. Système de Zoom

Cliquer sur un écran déclenche une animation fluide de la caméra qui zoome vers cet écran, permettant une lecture détaillée des informations.

### 5. Notifications en temps réel

Des notifications holographiques apparaissent périodiquement sur le côté de l'écran, simulant des alertes de variation de prix.

---

## 🛠️ Architecture Technique

### Technologies utilisées

```
Frontend
├── React 18          → Interface utilisateur
├── TypeScript        → Typage et robustesse du code
├── Vite              → Build rapide et moderne
├── Three.js          → Moteur de rendu 3D
├── React Three Fiber → Intégration React + Three.js
├── @react-three/drei → Utilitaires 3D (Stars, Html, etc.)
└── Chart.js          → Graphiques interactifs
```

### Structure des fichiers

```
src/
├── main.tsx                    # Point d'entrée
├── App.tsx                     # Composant racine
├── index.css                   # Styles globaux
│
├── components/
│   ├── SpaceScene.tsx          # Scène principale 3D
│   ├── SpaceScene.css          # Styles du panneau de contrôle
│   ├── PriceNotifications.tsx  # Notifications holographiques
│   │
│   └── 3dObjects/
│       ├── Planet.tsx          # Planètes/Cryptos 3D
│       ├── Spaceship.tsx       # Vaisseau spatial
│       ├── ChartScreen.tsx     # Écran graphique principal
│       │
│       └── smallScreen/
│           ├── BuyCryptoScreen.tsx      # Écran trading
│           ├── AltcoinMetricsScreen.tsx # Indicateurs marché
│           ├── CryptoDetailsScreen.tsx  # Détails crypto
│           └── BitcoinDominanceScreen.tsx # Dominance BTC
│
└── utils/
    ├── mathUtils.ts            # Fonctions mathématiques 3D
    └── EditableObject.tsx      # Outil de positionnement
```

---

## 🎨 Comment fonctionne la 3D ?

### Three.js & React Three Fiber

**Three.js** est une bibliothèque JavaScript qui permet de créer des scènes 3D dans le navigateur web. **React Three Fiber** est une surcouche qui permet d'utiliser Three.js avec la syntaxe familière de React.

#### Exemple : Création de la scène spatiale

```tsx
// SpaceScene.tsx - Création du canvas 3D
<Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
  {/* Lumière ambiante pour éclairer toute la scène */}
  <ambientLight intensity={0.6} />
  
  {/* Lumière directionnelle (comme le soleil) */}
  <directionalLight position={[5, 8, 5]} intensity={2} />
  
  {/* Champ d'étoiles en arrière-plan */}
  <DreiStars radius={100} depth={50} count={5000} />
  
  {/* Vaisseau spatial */}
  <Spaceship position={[0, 0.2, 9]} />
  
  {/* Les planètes (cryptomonnaies) */}
  {planets.map((p) => (
    <Planet key={p.name} name={p.name} position={p.position} />
  ))}
</Canvas>
```

### Les Planètes 3D

Chaque planète est soit :
- Un **modèle 3D** (fichier .glb) pour les principales cryptos
- Une **sphère procédurale** avec une couleur aléatoire pour les autres

#### Exemple : Rotation automatique des planètes

```tsx
// Planet.tsx - Animation de rotation
useFrame((_, delta) => {
  // À chaque frame, on tourne la planète de 0.5 radian × temps écoulé
  if (groupRef.current) {
    groupRef.current.rotation.y += delta * 0.5;
  }
});
```

Le hook `useFrame` est appelé à chaque image (60 fois par seconde). Cela crée l'effet de rotation continue.

---

## 📊 Les Écrans Holographiques

### Principe technique

Les écrans combinent **géométrie 3D** et **HTML/CSS** :

1. **Le cadre** : Un plan 3D avec un matériau semi-transparent cyan
2. **Le contenu** : Du HTML injecté dans la scène 3D via `<Html>` de drei

#### Exemple : Structure d'un écran holographique

```tsx
// ChartScreen.tsx - Écran avec graphique
<group position={basePosition}>
  {/* Cadre lumineux cyan */}
  <mesh scale={[0.18, 0.15, 1]}>
    <planeGeometry args={[2.7, 1.7]} />
    <meshBasicMaterial color="cyan" transparent opacity={0.3} />
  </mesh>
  
  {/* Fond sombre */}
  <mesh scale={[0.18, 0.15, 1]}>
    <planeGeometry args={[2.5, 1.5]} />
    <meshBasicMaterial color="#000a1a" transparent opacity={0.85} />
  </mesh>
  
  {/* Contenu HTML (graphique, boutons, etc.) */}
  <Html transform distanceFactor={0.11}>
    <div className="chart-container">
      <Line data={chartData} options={chartOptions} />
    </div>
  </Html>
</group>
```

### Effet de scintillement

Pour donner un effet "holographique", l'opacité des écrans varie légèrement avec le temps :

```tsx
useFrame((state) => {
  const time = state.clock.elapsedTime;
  
  // Variation sinusoïdale de l'opacité : 0.85 ± 0.1
  meshMaterial.opacity = 0.85 + Math.sin(time * 2) * 0.1;
});
```

---

## 🎥 Animation de la Caméra

### Le système de zoom

Quand l'utilisateur clique sur un écran, la caméra se déplace en douceur vers celui-ci.

#### Principe de l'interpolation

```tsx
// CameraController.tsx - Animation fluide
useFrame((_, delta) => {
  if (isAnimating) {
    // Progression de 0 à 1
    progress += delta * 2;
    
    // Fonction ease-in-out pour un mouvement naturel
    const t = 0.5 - 0.5 * Math.cos(progress * Math.PI);
    
    // Interpolation de la position
    camera.position.lerpVectors(startPos, targetPos, t);
    
    // Interpolation de la direction du regard
    camera.lookAt(currentLookAt);
  }
});
```

L'interpolation utilise une courbe **cosinus** qui démarre doucement, accélère au milieu, et ralentit à la fin — créant un mouvement naturel et agréable.

---

## 📡 Données en Temps Réel

### Sources de données

L'application utilise deux sources :

1. **API Backend locale** (`http://localhost:5000/history/...`)
   - Historique des prix pour les graphiques

2. **API CoinGecko** (publique)
   - Prix actuels
   - Variations 24h
   - Market Cap, Volume, Supply

#### Exemple : Récupération des données

```tsx
// BuyCryptoScreen.tsx - Appel API
const fetchCoinData = async () => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${selectedApiId}`
  );
  const data = await response.json();
  setCoinData(data[0]);
};

// Appel automatique quand la crypto change
useEffect(() => {
  fetchCoinData();
}, [selectedApiId]);
```

---

## 🔧 Particularités Techniques

### 1. Optimisation des performances

L'application utilise `memo` et `useCallback` pour éviter les re-rendus inutiles :

```tsx
// Scene3D ne se re-rend JAMAIS sauf si ses props changent
const Scene3D = memo(({ onPlanetClick }) => {
  // ... contenu de la scène
});

// La fonction de callback est mémorisée
const handlePlanetClick = useCallback((name, apiId) => {
  setSelectedPlanet(name);
  setSelectedApiId(apiId);
}, []);
```

### 2. Positionnement des écrans inclinés

Les écrans latéraux sont inclinés vers l'utilisateur. Pour calculer leur orientation, on utilise des **quaternions** :

```tsx
// mathUtils.ts - Création d'une rotation composée
export const createScreenQuaternion = (tiltDeg, turnDeg) => {
  // Inclinaison (axe X)
  const tiltQ = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(1, 0, 0), degToRad(tiltDeg));
  
  // Rotation horizontale (axe Y)
  const turnQ = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(0, 1, 0), degToRad(turnDeg));
  
  // Combinaison des deux rotations
  return turnQ.multiply(tiltQ);
};
```

### 3. Chargement de modèles 3D

Le vaisseau et les pièces de crypto sont des modèles 3D (formats `.fbx` et `.glb`) :

```tsx
// Spaceship.tsx - Chargement du vaisseau
const FBXModel = () => {
  const fbx = useLoader(FBXLoader, "/models/Spaceship.fbx");
  
  // Centrage automatique du modèle
  const box = new THREE.Box3().setFromObject(fbx);
  const center = box.getCenter(new THREE.Vector3());
  fbx.position.sub(center);
  
  return <primitive object={fbx} />;
};
```

### 4. Mode développeur

Un panneau de contrôle permet aux développeurs de repositionner les écrans en temps réel :

- Activation du mode édition
- Sélection d'un écran
- Déplacement/Rotation via des gizmos 3D
- Copie des coordonnées dans le presse-papier

---

## 🎯 Points Forts du Projet

| Aspect | Réalisation |
|--------|-------------|
| **Innovation** | Métaphore spatiale unique pour visualiser les cryptos |
| **Immersion** | Environnement 3D avec effets holographiques |
| **Interactivité** | Clics, zoom caméra, notifications dynamiques |
| **Données réelles** | Intégration API pour des informations à jour |
| **Esthétique** | Design futuriste cohérent (cyan, transparence, animations) |
| **Performance** | Optimisations React (memo, useCallback) |

---

## 🚀 Conclusion

**CryptoSpace** démontre qu'il est possible de transformer des données financières abstraites en une expérience visuelle captivante. En combinant les technologies web modernes (React, Three.js) avec un concept créatif (cockpit spatial), le projet offre une nouvelle façon d'interagir avec le monde des cryptomonnaies.

L'utilisateur n'est plus un simple spectateur de tableaux — il devient un **explorateur de galaxie** découvrant des planètes/cryptos dans un univers immersif.

---

