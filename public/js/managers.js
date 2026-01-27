// ============================================
// AMBIANCE SONORE (AUDIO MANAGER) - DÉSACTIVÉ
// ============================================

/*
const audioManager = {
  sounds: {
    rain: null,
    fire: null,
    cafe: null,
    wind: null,
    night: null,
  },
  activeSounds: new Set(),

  init() {
    // Créer des objets Audio pour chaque son
    this.sounds.rain = new Audio("assets/sounds/rain.mp3");
    this.sounds.fire = new Audio("assets/sounds/fire.mp3");
    this.sounds.cafe = new Audio("assets/sounds/cafe.mp3");
    this.sounds.wind = new Audio("assets/sounds/wind.mp3");
    this.sounds.night = new Audio("assets/sounds/night.mp3");

    // Configurer tous les sons en loop
    Object.values(this.sounds).forEach((audio) => {
      if (audio) {
        audio.loop = true;
        audio.volume = 0.5;
      }
    });

    // Charger l'état sauvegardé
    this.loadState();
  },

  toggle(soundName) {
    const audio = this.sounds[soundName];
    if (!audio) return;

    if (this.activeSounds.has(soundName)) {
      // Désactiver le son
      audio.pause();
      audio.currentTime = 0;
      this.activeSounds.delete(soundName);
      this.updateButtonState(soundName, false);
    } else {
      // Activer le son
      audio.play().catch((err) => {
        console.warn(`Impossible de jouer ${soundName}:`, err);
      });
      this.activeSounds.add(soundName);
      this.updateButtonState(soundName, true);
    }

    this.saveState();
  },

  updateButtonState(soundName, active) {
    const button = document.querySelector(`[data-sound="${soundName}"]`);
    if (!button) return;

    if (active) {
      button.classList.add("bg-secondary");
      button.classList.remove("bg-card");
    } else {
      button.classList.remove("bg-secondary");
      button.classList.add("bg-card");
    }
  },

  saveState() {
    localStorage.setItem(
      "activeSounds",
      JSON.stringify([...this.activeSounds]),
    );
  },

  loadState() {
    const saved = localStorage.getItem("activeSounds");
    if (saved) {
      const activeSounds = JSON.parse(saved);
      activeSounds.forEach((soundName) => {
        // Ne pas auto-play au chargement pour éviter les erreurs de navigateur
        this.updateButtonState(soundName, true);
      });
    }
  },
};

// Event Listeners pour les boutons de son
document.querySelectorAll(".sound-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const soundName = e.currentTarget.getAttribute("data-sound");
    audioManager.toggle(soundName);
  });
});
*/

// ============================================
// CITATIONS DYNAMIQUES (QUOTES)
// ============================================

const quotesManager = {
  localQuotes: [
    "The secret of getting ahead is getting started.",
    "Focus is the gateway to thinking clearly.",
    "Small daily improvements over time lead to stunning results.",
    "You don't have to be great to start, but you have to start to be great.",
    "Success is the sum of small efforts repeated day in and day out.",
    "The only way to do great work is to love what you do.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Stay focused and never give up.",
  ],

  async fetchQuote() {
    try {
      // Essayer l'API ZenQuotes
      const response = await fetch("https://zenquotes.io/api/random");
      const data = await response.json();

      if (data && data[0]) {
        return `"${data[0].q}"`;
      }
    } catch (error) {
      console.warn("API de citation non disponible, utilisation locale");
    }

    // Fallback sur les citations locales
    return this.getRandomLocalQuote();
  },

  getRandomLocalQuote() {
    const index = Math.floor(Math.random() * this.localQuotes.length);
    return `"${this.localQuotes[index]}"`;
  },

  async updateQuote() {
    const quoteElement = document.getElementById("quoteText");
    if (!quoteElement) return;

    const quote = await this.fetchQuote();
    quoteElement.textContent = quote;
  },
};

// ============================================
// SYSTÈME DE NOTIFICATIONS
// ============================================

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("hiding");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// PROFIL UTILISATEUR
// ============================================

const profileManager = {
  customAvatar: null,
  defaultProfile: {
    name: "Student",
    title: "Future Winner",
    avatar: "",
    city: "Paris",
    level: 1,
    darkMode: false,
    notificationsEnabled: true,
    soundsEnabled: true,
  },

  getRandomDefaultAvatar() {
    const options = ["pfps/1.jpg", "pfps/2.jpg", "pfps/3.jpg"];
    const index = Math.floor(Math.random() * options.length);
    return options[index];
  },

  loadProfile() {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      const profile = JSON.parse(saved);
      this.updateDisplay(profile);
      return profile;
    }

    const profile = {
      ...this.defaultProfile,
      avatar: this.getRandomDefaultAvatar(),
    };
    this.saveProfile(profile);
    return profile;
  },

  saveProfile(profile) {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    this.updateDisplay(profile);
  },

  updateDisplay(profile) {
    // Header
    const nameElement = document.getElementById("userName");
    const avatarElement = document.getElementById("profileImage");
    if (nameElement) nameElement.textContent = profile.name;
    if (avatarElement) {
      if (profile.avatar) {
        avatarElement.src = profile.avatar;
        avatarElement.style.display = "block";
      } else {
        avatarElement.style.display = "none";
      }
    }

    // Page Profile
    const nameLarge = document.getElementById("userNameLarge");
    const imageLarge = document.getElementById("profileImageLarge");
    const iconPlaceholder = document.getElementById("profileIconPlaceholder");

    if (nameLarge) nameLarge.textContent = profile.name;
    if (imageLarge) {
      if (profile.avatar) {
        imageLarge.src = profile.avatar;
        imageLarge.style.display = "block";
        if (iconPlaceholder) iconPlaceholder.style.display = "none";
      } else {
        imageLarge.style.display = "none";
        if (iconPlaceholder) iconPlaceholder.style.display = "block";
      }
    }

    // Titre
    const titleElements = document.querySelectorAll(".user-title");
    const streak = this.calculateStreak();
    const calculatedTitle = this.getTitleByStreak(streak);
    titleElements.forEach((el) => {
      if (el) el.textContent = profile.title || calculatedTitle;
    });

    // Niveau
    const levelDisplay = document.querySelector(
      "#pageProfile .text-2xl.font-black.text-primary",
    );
    if (levelDisplay) levelDisplay.textContent = profile.level || 1;

    // Dark mode
    if (profile.darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }

    // Mettre à jour les toggles dans la page Profile
    updateProfileToggles(profile);
  },

  editProfile() {
    const currentProfile = this.loadProfile();
    const modal = document.getElementById("profileModal");
    modal.style.display = "flex";

    // Remplir les champs avec les valeurs actuelles
    document.getElementById("profileNameInput").value = currentProfile.name;
    document.getElementById("profileCityInput").value = currentProfile.city;

    // Calculer et afficher le titre basé sur le streak
    const streak = this.calculateStreak();
    const title = this.getTitleByStreak(streak);
    document.getElementById("profileTitleInput").value = title;

    // Sélectionner l'avatar actuel
    this.updateAvatarSelection(currentProfile.avatar || "");
  },

  closeProfileModal() {
    document.getElementById("profileModal").style.display = "none";
  },

  saveProfileFromModal() {
    const name = document.getElementById("profileNameInput").value.trim();
    const city = document.getElementById("profileCityInput").value.trim();

    // Gérer l'avatar (sélection ou upload custom)
    let avatar = "";
    if (this.customAvatar) {
      avatar = this.customAvatar;
      this.customAvatar = null; // Reset après utilisation
    } else {
      const selectedAvatar = document.querySelector(".avatar-option.selected");
      avatar = selectedAvatar ? selectedAvatar.dataset.avatar : "";
    }

    if (!name) {
      showNotification("Name is required", "error");
      return;
    }

    // Filtrer les noms inappropriés
    if (this.isInappropriateName(name)) {
      showNotification("This name isn't allowed", "error");
      return;
    }

    // Calculer le titre basé sur le streak
    const streak = this.calculateStreak();
    const title = this.getTitleByStreak(streak);

    const currentProfile = this.loadProfile();
    const newProfile = {
      ...currentProfile,
      name,
      title,
      avatar,
      city: city || "Paris",
    };

    this.saveProfile(newProfile);
    this.closeProfileModal();
    syncProfileDisplay();

    showNotification("Profile updated.", "success");
  },

  updateAvatarSelection(selectedAvatar) {
    document.querySelectorAll(".avatar-option").forEach((option) => {
      const checkbox = option.querySelector(".pixel-checkbox");
      if (option.dataset.avatar === selectedAvatar) {
        option.classList.add("selected");
        checkbox.classList.add("checked");
      } else {
        option.classList.remove("selected");
        checkbox.classList.remove("checked");
      }
    });
  },

  calculateStreak() {
    const streakData = JSON.parse(localStorage.getItem("streakData") || "[]");
    if (streakData.length === 0) return 0;

    let streak = 1;
    const sortedDates = streakData
      .map((d) => new Date(d))
      .sort((a, b) => b - a);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Vérifier si la dernière date est aujourd'hui ou hier
    if (
      sortedDates[0].toDateString() !== today &&
      sortedDates[0].toDateString() !== yesterday
    ) {
      return 0;
    }

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = Math.floor((sortedDates[i - 1] - sortedDates[i]) / 86400000);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  getTitleByStreak(streak) {
    if (streak === 0) return "Beginner";
    if (streak < 3) return "Apprentice";
    if (streak < 7) return "Motivated";
    if (streak < 14) return "Consistent";
    if (streak < 30) return "Disciplined";
    if (streak < 60) return "Champion";
    if (streak < 100) return "Legend";
    return "Ultimate Master";
  },

  isInappropriateName(name) {
    const inappropriateWords = [
      "merde",
      "con",
      "connard",
      "salaud",
      "putain",
      "pute",
      "bite",
      "couille",
      "chier",
      "enculer",
      "fuck",
      "shit",
      "ass",
      "bitch",
      "damn",
      "hell",
      "nazi",
      "hitler",
      "pd",
      "fdp",
      "ntm",
      "mort",
      "tue",
      "kill",
    ];

    const lowerName = name.toLowerCase();
    return inappropriateWords.some((word) => lowerName.includes(word));
  },

  updateTimerDuration(type, change) {
    const durations = this.getTimerDurations();

    if (type === "pomodoro") {
      durations.pomodoro = Math.max(
        1,
        Math.min(60, durations.pomodoro + change),
      );
    } else if (type === "short") {
      durations.short = Math.max(1, Math.min(30, durations.short + change));
    } else if (type === "long") {
      durations.long = Math.max(1, Math.min(60, durations.long + change));
    }

    this.saveTimerDurations(durations);
    this.updateTimerDisplay();

    // Mettre à jour le timer si non actif
    if (typeof updateTimerModes === "function") {
      updateTimerModes();
    }
  },

  getTimerDurations() {
    const saved = localStorage.getItem("timerDurations");
    return saved ? JSON.parse(saved) : { pomodoro: 25, short: 5, long: 15 };
  },

  saveTimerDurations(durations) {
    localStorage.setItem("timerDurations", JSON.stringify(durations));
  },

  updateTimerDisplay() {
    const durations = this.getTimerDurations();
    const pomodoroEl = document.getElementById("pomodoroDuration");
    const shortEl = document.getElementById("shortBreakDuration");
    const longEl = document.getElementById("longBreakDuration");

    if (pomodoroEl) pomodoroEl.textContent = durations.pomodoro;
    if (shortEl) shortEl.textContent = durations.short;
    if (longEl) longEl.textContent = durations.long;
  },

  toggleDarkMode() {
    const profile = this.loadProfile();
    profile.darkMode = !profile.darkMode;
    this.saveProfile(profile);

    // Apply immediately
    if (profile.darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }

    updateProfileToggles();

    showNotification(
      profile.darkMode ? "🌙 Focus mode enabled" : "☀️ Light mode enabled",
      "info",
    );
  },

  toggleNotifications() {
    const profile = this.loadProfile();
    profile.notificationsEnabled = !profile.notificationsEnabled;
    this.saveProfile(profile);

    updateProfileToggles();

    showNotification(
      profile.notificationsEnabled
        ? "🔔 Notifications enabled (events & timer)"
        : "🔕 Notifications disabled",
      "info",
    );
  },

  exportData() {
    // Récupérer toutes les données du localStorage
    const data = {
      profile: this.loadProfile(),
      quests: JSON.parse(localStorage.getItem("quests") || "[]"),
      stats: {
        totalSessions: localStorage.getItem("totalSessions") || "0",
        totalFocusTime: localStorage.getItem("totalFocusTime") || "0",
        streakData: JSON.parse(localStorage.getItem("streakData") || "[]"),
        weeklyFocusTime: JSON.parse(
          localStorage.getItem("weeklyFocusTime") || "[]",
        ),
      },
      planning: {
        events: JSON.parse(localStorage.getItem("calendarEvents") || "[]"),
        goals: JSON.parse(localStorage.getItem("weeklyGoals") || "[]"),
      },
      exportDate: new Date().toISOString(),
    };

    // Créer un blob JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Créer un lien de téléchargement
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-session-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification("📥 Data exported successfully!", "success");
  },

  resetData() {
    if (
      !confirm(
        "⚠️ Are you sure you want to reset all data?\n\nThis action cannot be undone!",
      )
    ) {
      return;
    }

    // Clear localStorage
    const keysToRemove = [
      "quests",
      "totalSessions",
      "totalFocusTime",
      "streakData",
      "weeklyFocusTime",
      "calendarEvents",
      "weeklyGoals",
      "lastSaveDate",
      "lastActivePage",
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Reset profile to default
    const defaultProfile = {
      name: "Student",
      title: "Future Winner",
      level: 1,
      avatar: "",
      darkMode: false,
      notificationsEnabled: true,
      city: "Paris",
    };
    this.saveProfile(defaultProfile);

    showNotification("🔄 Data reset!", "info");

    // Recharger la page
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  },
};

function updateProfileToggles(profile) {
  // Si pas de profil passé, charger depuis localStorage directement
  if (!profile) {
    const saved = localStorage.getItem("userProfile");
    profile = saved ? JSON.parse(saved) : profileManager.defaultProfile;
  }

  const toggles = {
    notifications: profile.notificationsEnabled,
    darkMode: profile.darkMode,
  };

  Object.entries(toggles).forEach(([key, value]) => {
    const toggle = document.querySelector(`[data-toggle="${key}"]`);
    if (toggle) {
      if (value) {
        toggle.classList.remove("bg-muted", "border-border");
        toggle.classList.add("active");
      } else {
        toggle.classList.remove("active");
        toggle.classList.add("bg-muted", "border-border");
      }
    }
  });

  // Apply dark mode to document
  if (profile.darkMode) {
    document.documentElement.classList.add("dark-mode");
  } else {
    document.documentElement.classList.remove("dark-mode");
  }

  // Update profile stats in Profile page
  const profileLevel = document.getElementById("profileLevel");
  const profileTasks = document.getElementById("profileTasks");
  const profileFocusTime = document.getElementById("profileFocusTime");

  if (profileLevel) {
    profileLevel.textContent = profile.level;
  }

  if (profileTasks) {
    // Compter les tâches complétées depuis localStorage
    const savedQuests = JSON.parse(localStorage.getItem("quests") || "[]");
    const completedTasks = savedQuests.filter((q) => q.completed).length;
    profileTasks.textContent = completedTasks;
  }

  if (profileFocusTime) {
    const totalSeconds = parseInt(
      localStorage.getItem("totalFocusTime") || "0",
    );
    const hours = Math.floor(totalSeconds / 3600);
    profileFocusTime.textContent = `${hours}h`;
  }

  // Update timer durations display
  if (profileManager && profileManager.updateTimerDisplay) {
    profileManager.updateTimerDisplay();
  }
}

// Event Listeners
document.getElementById("profileBtn")?.addEventListener("click", () => {
  profileManager.editProfile();
});

function openInfoModal() {
  const modal = document.getElementById("infoModal");
  if (modal) {
    modal.classList.add("active");
    return;
  }
  if (typeof showNotification === "function") {
    showNotification("Info panel not found.", "info");
  }
}

// Capture-phase handler to override any older listeners (e.g., cached alert handlers)
document.getElementById("settingsBtn")?.addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    openInfoModal();
  },
  { capture: true },
);

function closeInfoModal() {
  const modal = document.getElementById("infoModal");
  if (modal) modal.classList.remove("active");
}

document
  .getElementById("closeInfoModal")
  ?.addEventListener("click", closeInfoModal);
document
  .getElementById("closeInfoModalFooter")
  ?.addEventListener("click", closeInfoModal);

document.getElementById("infoModal")?.addEventListener("click", (e) => {
  if (e.target && e.target.id === "infoModal") closeInfoModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeInfoModal();
});
