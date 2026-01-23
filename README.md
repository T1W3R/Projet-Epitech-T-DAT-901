# T-DAT-901-LIL_3 - CryptoSpace

## 🌌 Vue d'ensemble

**CryptoSpace** est une application de visualisation 3D immersive des cryptomonnaies. Le projet combine une architecture microservices avec streaming de données en temps réel et une interface utilisateur 3D innovante utilisant React Three Fiber.

### Concept

L'application transforme l'expérience de suivi des cryptomonnaies en une aventure spatiale où chaque crypto est représentée par une planète flottant dans l'espace. L'utilisateur navigue dans un cockpit de vaisseau spatial avec des écrans holographiques affichant les données financières en temps réel.
 
## 🏗️ Architecture

Le projet est organisé en microservices communiquant via **Redpanda** (compatible Kafka) :

```
┌─────────────────┐
│  scraper-service│ ──┐
│  (CoinGecko)    │   │
└─────────────────┘   │
                      ├──> Redpanda ──> analytics-service ──> DuckDB
┌─────────────────┐   │                    │
│   rss-service   │ ──┘                    │
│  (RSS Feeds)    │                        │
└─────────────────┘                        │
                                          │
                                    ┌─────▼─────┐
                                    │  frontend  │
                                    │  (React 3D)│
                                    └────────────┘
```

### Services

#### 1. **scraper-service**
- **Rôle** : Récupère les prix de cryptomonnaies depuis l'API CoinGecko
- **Fréquence** : Toutes les 60 secondes
- **Topic Kafka** : `crypto_prices`
- **Données** : Prix, market cap, volume pour les 100 principales cryptos

#### 2. **rss-service**
- **Rôle** : Récupère les articles RSS de sources crypto populaires
- **Sources** : CoinTelegraph, CoinDesk, Decrypt
- **Fréquence** : Toutes les heures
- **Topic Kafka** : `rss_articles`
- **Données** : Titre, lien, description, date de publication

#### 3. **analytics-service**
- **Rôle** : Consomme les données Kafka et expose une API REST
- **Base de données** : DuckDB (stockage local)
- **Port** : 5000
- **Endpoints** :
  - `GET /price/<symbol>` - Dernier prix d'une crypto
  - `GET /history/<period>/<symbol>` - Historique (day/month/year)
  - `GET /rss/articles` - Articles RSS stockés
  - `GET /rss/debug` - État du système RSS

#### 4. **frontend**
- **Rôle** : Interface utilisateur 3D immersive
- **Technologies** : React, TypeScript, Three.js, React Three Fiber
- **Port** : 5173
- **Fonctionnalités** :
  - Visualisation 3D des cryptomonnaies (planètes)
  - Écrans holographiques avec graphiques et métriques
  - Navigation interactive et animations de caméra
  - Notifications en temps réel

#### 5. **redpanda**
- **Rôle** : Broker de messages (alternative à Kafka)
- **Ports** :
  - 19092 : Kafka external
  - 18082 : HTTP Proxy
  - 18081 : Schema Registry
  - 19644 : Admin API

## 🚀 Démarrage rapide

### Prérequis

- Docker et Docker Compose installés
- Pour le frontend en développement : Node.js 18+ (optionnel si vous utilisez Docker)

### Installation

1. **Cloner le projet** (si nécessaire)

2. **Configurer les variables d'environnement**

   Créer un fichier `.env` dans `analytics-service/` :
   ```env
   API_KEY=votre_clé_api_coingecko
   ```

3. **Lancer tous les services**

   ```bash
   docker compose up
   ```

   Ou en arrière-plan :
   ```bash
   docker compose up -d
   ```

4. **Accéder à l'application**

   - Frontend : http://localhost:5173
   - API Analytics : http://localhost:5000
   - Redpanda Admin : http://localhost:19644

### Développement

Pour développer le frontend localement (sans Docker) :

```bash
cd frontend
npm install
npm run dev
```

## 📁 Structure du projet

```
T-DAT-901-LIL_3/
├── analytics-service/      # Service Flask + DuckDB
│   ├── app.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env
├── scraper-service/        # Scraper CoinGecko
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── rss-service/            # Service RSS
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Application React 3D
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml      # Orchestration des services
```

## 🔧 Technologies utilisées

### Backend
- **Python 3.11+**
- **Flask** - API REST
- **DuckDB** - Base de données analytique
- **Kafka/Redpanda** - Streaming de données
- **CoinGecko API** - Données crypto

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Three.js** - Moteur 3D
- **React Three Fiber** - Intégration React/Three.js
- **Chart.js** - Graphiques

### Infrastructure
- **Docker** - Containerisation
- **Docker Compose** - Orchestration

## 📊 Flux de données

1. **Scraper** → Récupère les prix toutes les 60s → Envoie à Kafka
2. **RSS Service** → Récupère les articles toutes les heures → Envoie à Kafka
3. **Analytics** → Consomme Kafka → Stocke dans DuckDB → Expose API REST
4. **Frontend** → Interroge l'API Analytics → Affiche en 3D

## 🎮 Utilisation

1. Ouvrir http://localhost:5173 dans votre navigateur
2. Naviguer dans l'espace 3D avec la souris
3. Cliquer sur une planète pour sélectionner une cryptomonnaie
4. Les écrans holographiques se mettent à jour automatiquement
5. Cliquer sur un écran pour zoomer et voir les détails

## 📝 Documentation supplémentaire

- **Frontend** : Voir `frontend/DOCUMENTATION_FRONTEND.md` pour les détails techniques de l'interface 3D
- **RSS** : Voir `VISUALISER_RSS.md` pour la visualisation des données RSS

## 🐛 Dépannage

### Les services ne démarrent pas
- Vérifier que Docker est bien lancé
- Vérifier que les ports ne sont pas déjà utilisés
- Consulter les logs : `docker compose logs <service-name>`

### Le frontend ne charge pas les données
- Vérifier que `analytics-service` est accessible sur le port 5000
- Vérifier les logs du service analytics
- Vérifier la connexion à Redpanda dans les logs

### Pas de données dans DuckDB
- Vérifier que les services scraper et rss sont bien connectés à Redpanda
- Vérifier les logs Kafka/Redpanda
- Attendre quelques minutes pour que les données s'accumulent

## 📄 Licence

Ce projet est développé dans le cadre du cours T-DAT-901-LIL_3.

