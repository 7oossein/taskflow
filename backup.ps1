# Créer le dossier de sauvegarde s'il n'existe pas
New-Item -ItemType Directory -Force -Path "backups" | Out-Null

# Récupérer la date actuelle
$date = Get-Date -Format "yyyy-MM-dd_HH-mm"

# Construire le nom du fichier
$fichier = "backups/sauvegarde_$date.sql"

Write-Host "Preparation de la sauvegarde..."
# Effectuer la sauvegarde PostgreSQL
cmd /c "docker compose exec -T db pg_dump -U postgres -d gestion_taches > `"$fichier`""
# Vérifier si la sauvegarde a réussi
if ($LASTEXITCODE -eq 0) {
    Write-Host "Sauvegarde reussie : $fichier" -ForegroundColor Green
}
else {
    Write-Host "Erreur pendant la sauvegarde !" -ForegroundColor Red
}