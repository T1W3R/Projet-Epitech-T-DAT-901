# Script pour tester l'API RSS et visualiser les données

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "🔍 Diagnostic des données RSS" -ForegroundColor Cyan
Write-Host "=" * 80
Write-Host ""

# Test de l'endpoint de debug
Write-Host "1️⃣ Vérification de l'état de la base de données..." -ForegroundColor Yellow
try {
    $debug = Invoke-RestMethod -Uri "http://localhost:5000/rss/debug" -Method GET
    Write-Host "✅ Endpoint de debug accessible" -ForegroundColor Green
    Write-Host "📊 Nombre total d'articles: $($debug.total_articles)" -ForegroundColor Cyan
    Write-Host ""
    
    if ($debug.articles_by_source) {
        Write-Host "📰 Articles par source:" -ForegroundColor Yellow
        foreach ($source in $debug.articles_by_source) {
            Write-Host "   - $($source.source): $($source.count) articles" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    if ($debug.recent_articles -and $debug.recent_articles.Count -gt 0) {
        Write-Host "📄 Derniers articles:" -ForegroundColor Yellow
        foreach ($article in $debug.recent_articles) {
            Write-Host "   • $($article.title)" -ForegroundColor Gray
            Write-Host "     Source: $($article.source) | Publié: $($article.published)" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "❌ Erreur lors de l'accès à l'endpoint de debug: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "2️⃣ Récupération des articles..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/rss/articles?limit=5" -Method GET
    Write-Host "✅ API accessible" -ForegroundColor Green
    Write-Host "📊 Articles retournés: $($response.count)" -ForegroundColor Cyan
    
    if ($response.articles -and $response.articles.Count -gt 0) {
        Write-Host ""
        Write-Host "📰 Exemples d'articles:" -ForegroundColor Yellow
        foreach ($article in $response.articles) {
            Write-Host ""
            Write-Host "   Titre: $($article.title)" -ForegroundColor Cyan
            Write-Host "   Source: $($article.source)" -ForegroundColor Gray
        }
    } else {
        Write-Host ""
        Write-Host "⚠️  Aucun article dans la réponse" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 Actions à vérifier:" -ForegroundColor Yellow
        Write-Host "   1. Vérifier les logs du service RSS:" -ForegroundColor Gray
        Write-Host "      docker compose logs rss-service" -ForegroundColor DarkGray
        Write-Host "   2. Vérifier les logs du service analytics:" -ForegroundColor Gray
        Write-Host "      docker compose logs analytics-service | Select-String 'rss'" -ForegroundColor DarkGray
        Write-Host "   3. Redémarrer le service RSS pour forcer une récupération:" -ForegroundColor Gray
        Write-Host "      docker compose restart rss-service" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 80 -ForegroundColor Cyan
