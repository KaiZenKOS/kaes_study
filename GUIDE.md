# 📖 Guide d'utilisation - Pixel Focus

## 🚀 Démarrage rapide

1. **Ouvre** `index.html` dans ton navigateur
2. **Configure** ton profil en cliquant sur l'avatar en haut à droite
3. **Démarre** une session Pomodoro avec le bouton START
4. **Ajoute** tes tâches avec le bouton + dans Quest Log

---

## ⏰ Utiliser le Timer Pomodoro

### Modes disponibles

- **POMODORO** (25 min) - Session de travail focalisé
- **SHORT BREAK** (5 min) - Courte pause
- **LONG BREAK** (15 min) - Longue pause

### Actions

- **START** : Démarre le timer
- **STOP** : Met en pause
- **RESTART** (↻) : Réinitialise au temps de départ

### Basculer de mode

Clique sur les onglets **POMODORO**, **SHORT BREAK** ou **LONG BREAK** pour changer.

### XP Daily

- Ton temps de focus est calculé automatiquement
- Objectif : 8 heures par jour
- La barre de progression se remplit au fur et à mesure
- Les données se réinitialisent chaque jour

---

## 📝 Gérer tes Quêtes (Tâches)

### Ajouter une tâche

1. Clique sur le bouton **+** (cyan)
2. Entre le nom de la tâche
3. Choisis la priorité : **HIGH**, **MEDIUM**, ou **LOW**

### Marquer comme complétée

- Clique sur la **checkbox** (carré vide) à gauche de la tâche
- La tâche sera barrée et en opacité réduite

### Supprimer une tâche

- Survole la tâche
- Clique sur l'icône **poubelle** (rouge) qui apparaît à droite

### Couleurs de priorité

- 🔴 **HIGH** : Bordure orange/rouge + badge jaune
- 🟢 **MEDIUM** : Bordure cyan
- ⚪ **LOW** : Bordure grise, sans badge

---

## 🎵 Ambiance Sonore

### Activer un son

Clique sur l'un des boutons d'ambiance :

- ☔ **Rain** - Pluie douce
- 🔥 **Fire** - Feu de cheminée
- ☕ **Cafe** - Ambiance café
- 💨 **Wind** - Vent léger
- 🌙 **Night** - Sons nocturnes

### États

- **Inactif** : Fond gris/blanc
- **Actif** : Fond jaune avec animation de pulsation

### Notes

- Les sons sont en **loop** (bouclent automatiquement)
- Tu peux activer plusieurs sons en même temps
- L'état est **sauvegardé** (restauré au prochain chargement)
- Si les fichiers audio ne sont pas présents, ça ne bloquera pas l'app

---

## 🌤️ Widget Météo

### Changer de ville

1. Clique sur le **widget météo** (en haut à droite)
2. Entre le nom de ta ville
3. La température se met à jour

### Configuration API (optionnel)

Pour avoir la météo en temps réel :

1. Crée un compte sur [OpenWeather](https://openweathermap.org/api)
2. Obtiens ta clé API gratuite
3. Ajoute-la dans le code (voir README.md)

Sans API, une température aléatoire est affichée.

---

## 👤 Profil Utilisateur

### Modifier ton profil

1. Clique sur ton **avatar** (en haut à droite)
2. Entre ton **nom/pseudo**
3. (Optionnel) Entre l'**URL de ton avatar**
4. Entre ta **ville**

### Ce qui est sauvegardé

- Ton nom
- Ton avatar
- Ta ville (utilisée pour la météo)

---

## 💭 Citations Motivantes

- Une nouvelle citation apparaît à chaque chargement
- Se rafraîchit automatiquement toutes les **10 minutes**
- Récupérées depuis une API ou base locale

---

## ⚙️ Paramètres

Clique sur l'icône **⚙️** en haut à droite pour voir les infos d'aide.

---

## 💾 Sauvegarde des données

### Où sont stockées les données ?

Tout est sauvegardé dans le **localStorage** de ton navigateur :

- Temps de focus quotidien
- Liste des tâches
- Profil utilisateur
- Ville pour la météo
- Sons actifs

### Effacer les données

**Option 1** : Ouvre la console du navigateur (F12) et tape :

```javascript
localStorage.clear();
location.reload();
```

**Option 2** : Efface l'historique/cookies du navigateur

---

## 🎮 Raccourcis Clavier (À venir)

Prochainement :

- `Espace` : START/STOP timer
- `R` : RESTART timer
- `N` : Nouvelle tâche
- `1-5` : Activer sons 1 à 5

---

## ❓ FAQ

### Le timer ne démarre pas

- Vérifie que JavaScript est activé
- Rafraîchis la page (F5)

### Les sons ne marchent pas

- C'est normal si tu n'as pas ajouté de fichiers audio
- Consulte `assets/sounds/README.md` pour les instructions

### La météo affiche "--"

- Tu n'as pas configuré l'API OpenWeather
- Entre ta ville en cliquant sur le widget

### Mes données disparaissent

- Vérifie que tu n'es pas en **navigation privée**
- Le localStorage ne fonctionne pas en mode privé

---

## 📞 Support

Pour toute question ou bug :

1. Vérifie la **console du navigateur** (F12)
2. Consulte le [README.md](README.md)
3. Ouvre une issue sur GitHub (si applicable)

---

**Bon focus ! 🚀**
