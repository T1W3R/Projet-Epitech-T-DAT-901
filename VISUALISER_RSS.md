# 📰 Guide pour visualiser les données RSS

## ✅ Vérification rapide

### 1. Vérifier que les articles sont stockés

```powershell
# Test simple de l'API
.\test-api-simple.ps1
```

### 2. Vérifier les logs des services

```powershell
# Logs du service RSS (récupération des flux)
docker compose logs rss-service

# Logs du service analytics (insertion en base)
docker compose logs analytics-service | Select-String "rss"
```

### 3. Tester l'API directement

```powershell
# Via PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/rss/articles?limit=5" | ConvertTo-Json

# Ou via le script
.\test-api-simple.ps1
```

## 🔍 Endpoints disponibles

### Récupérer les articles
```
GET http://localhost:5000/rss/articles?limit=20
```

### Endpoint de debug
```
GET http://localhost:5000/rss/debug
```

Retourne :
- Nombre total d'articles
- Articles par source
- Derniers articles

## 🐛 Diagnostic des problèmes

### Problème : "Aucune actualité disponible" dans le frontend

1. **Vérifier que l'API fonctionne** :
   ```powershell
   .\test-api-simple.ps1
   ```

2. **Vérifier les logs du frontend** :
   - Ouvrir la console du navigateur (F12)
   - Chercher les messages de log commençant par 🔄, 📰, ✅ ou ❌

3. **Vérifier CORS** :
   - Le service analytics doit avoir CORS activé (déjà fait)
   - Vérifier dans la console du navigateur s'il y a des erreurs CORS

4. **Forcer une récupération RSS** :
   ```powershell
   # Redémarrer le service RSS pour forcer une récupération immédiate
   docker compose restart rss-service
   
   # Attendre 10-15 secondes puis vérifier les logs
   docker compose logs --tail=30 rss-service
   ```

### Problème : Aucun article dans la base de données

1. **Vérifier que le service RSS fonctionne** :
   ```powershell
   docker compose ps rss-service
   docker compose logs rss-service
   ```

2. **Vérifier la connexion à Kafka** :
   ```powershell
   docker compose logs rss-service | Select-String "connected|Error"
   ```

3. **Vérifier que le consumer RSS fonctionne** :
   ```powershell
   docker compose logs analytics-service | Select-String "rss_articles|Consumer connected"
   ```

## 📊 Commandes utiles

### Compter les articles par source
```sql
-- Via DuckDB (si vous avez accès à la base)
SELECT source, COUNT(*) as count 
FROM rss_articles 
GROUP BY source;
```

### Voir les derniers articles insérés
```powershell
docker compose logs analytics-service | Select-String "Inserted RSS" | Select-Object -Last 10
```

### Forcer une récupération immédiate
Le service RSS récupère maintenant les articles immédiatement au démarrage, puis toutes les heures.

Pour forcer une nouvelle récupération :
```powershell
docker compose restart rss-service
```

## 🎯 Résumé

- **Service RSS** : Récupère les flux toutes les heures (et au démarrage)
- **Service Analytics** : Consomme les messages Kafka et les stocke dans DuckDB
- **API** : `http://localhost:5000/rss/articles` retourne les articles stockés
- **Frontend** : Affiche les articles avec rotation automatique toutes les 8 secondes

Si vous voyez "Aucune actualité disponible" :
1. Vérifiez la console du navigateur (F12) pour les erreurs
2. Testez l'API avec `.\test-api-simple.ps1`
3. Vérifiez les logs avec les commandes ci-dessus
