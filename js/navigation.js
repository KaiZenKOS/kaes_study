// ============================================
// NAVIGATION MULTI-PAGES
// ============================================

let currentPage = "focus";

function navigateToPage(pageName) {
  // Cacher toutes les pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  // Afficher la page demandée
  const targetPage = document.getElementById(
    `page${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`,
  );
  if (targetPage) {
    targetPage.classList.add("active");
    currentPage = pageName;
  }

  // Mettre à jour les boutons de navigation
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    if (btn.getAttribute("data-page") === pageName) {
      btn.classList.add("active");
      btn.classList.remove("text-muted-foreground");
      btn.classList.add("text-primary");
    } else {
      btn.classList.remove("active");
      btn.classList.remove("text-primary");
      btn.classList.add("text-muted-foreground");
    }
  });

  // Sauvegarder la page active
  localStorage.setItem("lastActivePage", pageName);

  // Mettre à jour les stats du profil si on navigue vers la page Profile
  if (pageName === "profile") {
    updateProfileToggles();
  }
}

// Synchroniser le nom et l'avatar entre les pages
function syncProfileDisplay() {
  const profile = profileManager.loadProfile();
  const nameLarge = document.getElementById("userNameLarge");
  const imageLarge = document.getElementById("profileImageLarge");

  if (nameLarge) nameLarge.textContent = profile.name;
  if (imageLarge && profile.avatar) imageLarge.src = profile.avatar;
}

// Restaurer la dernière page visitée au chargement
function restoreLastPage() {
  const lastPage = localStorage.getItem("lastActivePage");
  if (lastPage && lastPage !== "focus") {
    navigateToPage(lastPage);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Event Listeners pour la navigation
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const pageName = e.currentTarget.getAttribute("data-page");
    navigateToPage(pageName);
  });
});

// Bouton central "+" ouvre la modal de création de tâche
document
  .getElementById("quickAddBtn")
  ?.addEventListener("click", openTaskModal);

// Export pour utilisation dans d'autres modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    navigateToPage,
    syncProfileDisplay,
    restoreLastPage,
  };
}
