# 🎮 PIXEL FOCUS - Study Session App

Une application de productivité One-Page avec design **Neo-Brutaliste / Pixel Art**.

## ✨ Fonctionnalités

### ⏰ Timer Pomodoro

- **3 modes** : Pomodoro (25min), Short Break (5min), Long Break (15min)
- Boutons START/STOP et RESTART fonctionnels
- Compte à rebours avec mise à jour en temps réel
- Calcul automatique du temps de focus quotidien
- Barre de progression XP (objectif 8h/jour)

### 📝 Quest Log (Système de tâches)

- Ajouter des tâches avec priorité (HIGH/MEDIUM/LOW)
- Cocher/décocher pour marquer comme complété
- Supprimer des tâches
- Couleurs dynamiques selon la priorité
- Sauvegarde automatique dans localStorage

### 🎵 Ambiance Sonore

- 5 ambiances sonores : Rain, Fire, Cafe, Wind, Night
- Activation/désactivation par clic
- Lecture en boucle avec volume réglable
- État sauvegardé entre les sessions

### 🌤️ Météo

- Affichage de la température en temps réel
- Icônes dynamiques selon la météo
- Changement de ville par clic
- Mise à jour automatique toutes les 30 minutes
- Support API OpenWeather (optionnel)

### 💭 Citations Motivantes

- Citations dynamiques via API ZenQuotes
- Fallback sur base locale de citations
- Rafraîchissement automatique toutes les 10 minutes

### 👤 Profil Utilisateur

- Nom/pseudo personnalisable
- Avatar personnalisé (URL)
- Ville configurable
- Sauvegarde dans localStorage

## 🛠️ Technologies

- **HTML5** + **CSS3** (Tailwind CSS v4)
- **JavaScript Vanilla** (No frameworks)
- **Iconify** pour les icônes
- **localStorage** pour la persistance
- **100% Front-end** (No backend required)

## 🎨 Design

- **Style** : Neo-Brutaliste / Pixel Art
- **Palette** : Warm & cozy colors
- **Typographies** :
  - Space Grotesk (UI)
  - JetBrains Mono (Code)
  - Playfair Display (Serif)

## 📦 Installation

1. Clone ou télécharge le projet
2. Ouvre `index.html` dans un navigateur moderne
3. (Optionnel) Ajoute tes fichiers audio dans `assets/sounds/`
4. (Optionnel) Configure ta clé API OpenWeather dans le code

## 🔧 Configuration

### API Météo (Optionnel)

Pour activer la météo réelle :

1. Crée un compte sur [OpenWeather](https://openweathermap.org/)
2. Obtiens ta clé API gratuite
3. Dans [index.html](index.html#L800), remplace :
   ```javascript
   apiKey: '', // Ta clé API ici
   ```

### Fichiers Audio

Place tes fichiers audio dans `assets/sounds/` avec les noms :

- `rain.mp3`
- `fire.mp3`
- `cafe.mp3`
- `wind.mp3`
- `night.mp3`

Voir [assets/sounds/README.md](assets/sounds/README.md) pour plus de détails.

## 📱 Responsive

L'application est optimisée pour :

- 📱 Mobile (320px+)
- 💻 Desktop
- Design centré avec `max-w-md`

## 💾 Données Sauvegardées

Toutes les données sont stockées dans le **localStorage** :

- `totalFocusTime` - Temps de focus cumulé (réinitialisé chaque jour)
- `lastSaveDate` - Date de dernière sauvegarde
- `quests` - Liste des tâches
- `userProfile` - Profil utilisateur
- `userCity` - Ville pour la météo
- `activeSounds` - Sons actifs

## 🎯 Roadmap / Améliorations futures

- [ ] Statistiques détaillées (graphiques)
- [ ] Historique des sessions Pomodoro
- [ ] Export/Import des données
- [ ] Thèmes de couleurs personnalisables
- [ ] Animations pixel art avec spritesheets
- [ ] Notifications desktop
- [ ] Mode hors-ligne (PWA)
- [ ] Synchronisation cloud (optionnelle)

## 📄 Licence

Projet personnel - Free to use and modify

## 🙏 Crédits

- Design & Development : [Ton nom]
- Icons : [Iconify](https://iconify.design/)
- Fonts : Google Fonts
- Weather API : [OpenWeather](https://openweathermap.org/)
- Quotes API : [ZenQuotes](https://zenquotes.io/)

---

**Made with ❤️ and ☕ | Kaizen approach to productivity**
