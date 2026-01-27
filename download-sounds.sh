#!/bin/bash

# 🎵 Script pour télécharger des sons d'ambiance gratuits
# Utilise youtube-dl et ffmpeg pour convertir en MP3

# Vérifier les dépendances
command -v yt-dlp >/dev/null 2>&1 || { echo "yt-dlp n'est pas installé. Installation: pip install yt-dlp"; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg n'est pas installé."; exit 1; }

echo "🎵 Téléchargement des sons d'ambiance..."

# Créer le dossier si nécessaire
mkdir -p assets/sounds

# Exemples de liens YouTube (remplace par tes propres liens)
# Note: Assure-toi d'avoir les droits d'utilisation

# Rain sound (10h)
echo "📥 Téléchargement: Rain..."
yt-dlp -x --audio-format mp3 --audio-quality 5 \
  -o "assets/sounds/rain.%(ext)s" \
  "https://www.youtube.com/watch?v=q76bMs-NwRk" \
  --postprocessor-args "ffmpeg:-ss 00:00:30 -t 00:01:00"

# Fire sound
echo "📥 Téléchargement: Fire..."
yt-dlp -x --audio-format mp3 --audio-quality 5 \
  -o "assets/sounds/fire.%(ext)s" \
  "https://www.youtube.com/watch?v=UgHKb_7884o" \
  --postprocessor-args "ffmpeg:-ss 00:00:30 -t 00:01:00"

# Cafe ambiance
echo "📥 Téléchargement: Cafe..."
yt-dlp -x --audio-format mp3 --audio-quality 5 \
  -o "assets/sounds/cafe.%(ext)s" \
  "https://www.youtube.com/watch?v=gaJWH4Qb8KI" \
  --postprocessor-args "ffmpeg:-ss 00:00:30 -t 00:01:00"

# Wind sound
echo "📥 Téléchargement: Wind..."
yt-dlp -x --audio-format mp3 --audio-quality 5 \
  -o "assets/sounds/wind.%(ext)s" \
  "https://www.youtube.com/watch?v=w3b6ywU0zy4" \
  --postprocessor-args "ffmpeg:-ss 00:00:30 -t 00:01:00"

# Night ambiance
echo "📥 Téléchargement: Night..."
yt-dlp -x --audio-format mp3 --audio-quality 5 \
  -o "assets/sounds/night.%(ext)s" \
  "https://www.youtube.com/watch?v=nDq6TstdEi8" \
  --postprocessor-args "ffmpeg:-ss 00:00:30 -t 00:01:00"

echo "✅ Téléchargement terminé !"
echo ""
echo "📁 Fichiers créés dans assets/sounds/"
ls -lh assets/sounds/*.mp3

echo ""
echo "⚠️  Note: Vérifie les licences des sons téléchargés"
echo "🎵 Tu peux aussi télécharger des sons depuis:"
echo "   - https://freesound.org/"
echo "   - https://pixabay.com/music/"
echo "   - https://soundbible.com/"
