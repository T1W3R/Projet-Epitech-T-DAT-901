# Script PowerShell pour visualiser les données RSS
Write-Host "🔍 Vérification des données RSS..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/rss/articles?limit=10" -Method GET
    
    Write-Host "✅ API accessible" -ForegroundColor Green
    Write-Host "📊 Nombre d'articles: $($response.count)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($response.articles -and $response.articles.Count -gt 0) {
        Write-Host "📰 Articles trouvés:" -ForegroundColor Green
        Write-Host ("=" * 80)
        
        foreach ($article in $response.articles) {
            Write-Host ""
            Write-Host "Titre: $($article.title)" -ForegroundColor Cyan
            Write-Host "Source: $($article.source)" -ForegroundColor Gray
            Write-Host "Publié: $($article.published)" -ForegroundColor Gray
            Write-Host "Lien: $($article.link)" -ForegroundColor Blue
            if ($article.description) {
                $desc = $article.description -replace '<[^>]+>', ''
                Write-Host "Description: $($desc.Substring(0, [Math]::Min(100, $desc.Length)))..." -ForegroundColor DarkGray
            }
            Write-Host ("-" * 80)
        }
    } else {
        Write-Host "❌ Aucun article trouvé dans la base de données" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Vérifiez:" -ForegroundColor Yellow
        Write-Host "   1. Le service RSS récupère-t-il les flux? (docker compose logs rss-service)" -ForegroundColor Gray
        Write-Host "   2. Les articles sont-ils envoyés vers Kafka?" -ForegroundColor Gray
        Write-Host "   3. Le service analytics consomme-t-il les messages? (docker compose logs analytics-service | Select-String 'rss')" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifiez que le service analytics-service est démarré:" -ForegroundColor Yellow
    Write-Host "  docker compose ps" -ForegroundColor Gray
}
