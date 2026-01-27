// ============================================
// INITIALISATION DE L'APPLICATION
// ============================================

// Charger les données au démarrage
loadFocusTime();
loadQuests();
updateDisplay();

// Initialiser les modules
quotesManager.updateQuote();
profileManager.loadProfile();
syncProfileDisplay();
restoreLastPage();

// Initialiser Stats et Planning
statsManager.updateStatsDisplay();
planningManager.renderTodayEvents();
planningManager.renderGoals();
planningManager.renderCalendar();

// Mettre à jour les stats du profil
updateProfileToggles();

// Initialiser les event listeners pour les avatars
setTimeout(() => {
  // Event Listener pour éditer le profil depuis la page Profile
  document.getElementById("editProfileBtn")?.addEventListener("click", () => {
    profileManager.editProfile();
  });

  // Event Listener pour ajouter un objectif
  document.getElementById("addGoalBtn")?.addEventListener("click", () => {
    planningManager.addGoal();
  });

  // Event Listeners pour la navigation du calendrier
  document.getElementById("prev-month")?.addEventListener("click", () => {
    planningManager.previousMonth();
  });

  document.getElementById("next-month")?.addEventListener("click", () => {
    planningManager.nextMonth();
  });

  document.querySelectorAll(".avatar-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      const avatar = e.currentTarget.getAttribute("data-avatar");
      profileManager.updateAvatarSelection(avatar);
    });
  });

  // Upload d'avatar depuis PC
  document.getElementById("avatarUpload")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const customAvatar = event.target.result;

        document.querySelectorAll(".avatar-option").forEach((opt) => {
          opt.classList.remove("selected");
          opt.querySelector(".pixel-checkbox").classList.remove("checked");
        });

        profileManager.customAvatar = customAvatar;
        showNotification("Avatar uploaded. Click SAVE.", "success");
      };
      reader.readAsDataURL(file);
    }
  });
}, 100);

// Mettre à jour la date d'aujourd'hui
const today = new Date();
const todayDateEl = document.getElementById("today-date");
if (todayDateEl) {
  todayDateEl.textContent = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

// Rafraîchir la citation toutes les 10 minutes
setInterval(() => quotesManager.updateQuote(), 10 * 60 * 1000);
