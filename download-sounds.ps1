# 🎵 Script PowerShell pour télécharger des sons d'ambiance
# Nécessite yt-dlp et ffmpeg

Write-Host "🎵 Téléchargement des sons d'ambiance..." -ForegroundColor Cyan

# Vérifier les dépendances
$ytDlpPath = Get-Command yt-dlp -ErrorAction SilentlyContinue
$ffmpegPath = Get-Command ffmpeg -ErrorAction SilentlyContinue

if (-not $ytDlpPath) {
    Write-Host "❌ yt-dlp n'est pas installé." -ForegroundColor Red
    Write-Host "Installation: pip install yt-dlp" -ForegroundColor Yellow
    Write-Host "Ou télécharge depuis: https://github.com/yt-dlp/yt-dlp" -ForegroundColor Yellow
    exit 1
}

if (-not $ffmpegPath) {
    Write-Host "❌ ffmpeg n'est pas installé." -ForegroundColor Red
    Write-Host "Télécharge depuis: https://ffmpeg.org/download.html" -ForegroundColor Yellow
    exit 1
}

# Créer le dossier
$soundsDir = "assets\sounds"
if (-not (Test-Path $soundsDir)) {
    New-Item -ItemType Directory -Path $soundsDir -Force | Out-Null
}

# Fonction de téléchargement
function Download-Sound {
    param(
        [string]$Name,
        [string]$Url
    )
    
    Write-Host "📥 Téléchargement: $Name..." -ForegroundColor Green
    
    $outputPath = Join-Path $soundsDir "$Name.mp3"
    
    try {
        & yt-dlp -x --audio-format mp3 --audio-quality 5 `
            -o "$outputPath" `
            "$Url" `
            --postprocessor-args "ffmpeg:-ss 00:00:30 -t 00:01:00" `
            --quiet --progress
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Name téléchargé avec succès" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Erreur lors du téléchargement de $Name" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Erreur: $_" -ForegroundColor Red
    }
}

# Liste des sons à télécharger
# Note: Remplace ces URLs par tes propres sources (avec licence appropriée)
$sounds = @{
    "rain" = "https://www.youtube.com/watch?v=q76bMs-NwRk"
    "fire" = "https://www.youtube.com/watch?v=UgHKb_7884o"
    "cafe" = "https://www.youtube.com/watch?v=gaJWH4Qb8KI"
    "wind" = "https://www.youtube.com/watch?v=w3b6ywU0zy4"
    "night" = "https://www.youtube.com/watch?v=nDq6TstdEi8"
}

# Télécharger tous les sons
foreach ($sound in $sounds.GetEnumerator()) {
    Download-Sound -Name $sound.Key -Url $sound.Value
}

Write-Host ""
Write-Host "✅ Téléchargement terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Fichiers créés dans $soundsDir\" -ForegroundColor Cyan

# Lister les fichiers
Get-ChildItem -Path $soundsDir -Filter "*.mp3" | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "   $($_.Name) - ${size} MB" -ForegroundColor Gray
}

Write-Host ""
Write-Host "⚠️  Note: Vérifie les licences des sons téléchargés" -ForegroundColor Yellow
Write-Host "🎵 Tu peux aussi télécharger des sons depuis:" -ForegroundColor Cyan
Write-Host "   - https://freesound.org/" -ForegroundColor Gray
Write-Host "   - https://pixabay.com/music/" -ForegroundColor Gray
Write-Host "   - https://soundbible.com/" -ForegroundColor Gray
Write-Host "   - https://www.zapsplat.com/" -ForegroundColor Gray

Write-Host ""
Write-Host "🔊 Pour tester dans l'app, ouvre index.html dans ton navigateur !" -ForegroundColor Green
