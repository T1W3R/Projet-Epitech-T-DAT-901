# Script simple pour tester l'API RSS
$uri = "http://localhost:5000/rss/articles?limit=5"
Write-Host "Test de l'API: $uri" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $uri -Method GET
    Write-Host "`nReponse JSON:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Red
}
