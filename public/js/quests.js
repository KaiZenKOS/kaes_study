// ============================================
// QUEST LOG (TODO LIST) LOGIC
// ============================================

let quests = [];

// Éléments DOM
const addQuestButton = document.querySelector(".size-8.bg-accent");
const questContainer = document.querySelector(".space-y-3");

// Charger les quêtes depuis localStorage
function loadQuests() {
  const savedQuests = localStorage.getItem("quests");
  quests = savedQuests ? JSON.parse(savedQuests) : [];
  renderQuests();
}

// Sauvegarder les quêtes dans localStorage
function saveQuests() {
  localStorage.setItem("quests", JSON.stringify(quests));
}

// Créer une nouvelle quête
function addQuest() {
  openTaskModal();
}

// ============================================
// MODAL DE CRÉATION DE TÂCHE
// ============================================

let selectedPriority = "MEDIUM";

function openTaskModal() {
  const modal = document.getElementById("taskModal");
  const input = document.getElementById("taskNameInput");

  // Réinitialiser le formulaire
  input.value = "";
  input.focus();
  selectedPriority = "MEDIUM";
  updatePrioritySelection("MEDIUM");

  // Afficher la modal
  modal.classList.add("active");
}

function closeTaskModal() {
  const modal = document.getElementById("taskModal");
  modal.classList.remove("active");
}

function updatePrioritySelection(priority) {
  selectedPriority = priority;

  // Mettre à jour les checkboxes
  document.querySelectorAll(".pixel-checkbox").forEach((checkbox) => {
    const cbPriority = checkbox.getAttribute("data-priority");
    if (cbPriority === priority) {
      checkbox.classList.add("checked");
    } else {
      checkbox.classList.remove("checked");
    }
  });

  // Mettre à jour les options
  document.querySelectorAll(".priority-option").forEach((option) => {
    const optPriority = option.getAttribute("data-priority");
    if (optPriority === priority) {
      option.classList.add("selected");
    } else {
      option.classList.remove("selected");
    }
  });
}

function createQuestFromModal() {
  const input = document.getElementById("taskNameInput");
  const taskName = input.value.trim();

  if (!taskName) {
    // Animation d'erreur
    input.style.borderColor = "var(--destructive)";
    input.placeholder = "Enter a task name!";
    setTimeout(() => {
      input.style.borderColor = "";
      input.placeholder = "e.g., Review React Hooks...";
    }, 2000);
    return;
  }

  const quest = {
    id: Date.now(),
    title: taskName,
    completed: false,
    priority: selectedPriority,
  };

  quests.push(quest);
  saveQuests();
  renderQuests();
  closeTaskModal();
}

// ============================================
// GESTION DES QUÊTES
// ============================================

// Basculer l'état complété d'une quête
function toggleQuest(id) {
  const quest = quests.find((q) => q.id === id);
  if (quest) {
    quest.completed = !quest.completed;
    saveQuests();
    renderQuests();
  }
}

// Supprimer une quête
function deleteQuest(id) {
  quests = quests.filter((q) => q.id !== id);
  saveQuests();
  renderQuests();
}

// Obtenir la couleur de priorité
function getPriorityColor(priority) {
  const colors = {
    HIGH: "bg-secondary text-secondary-foreground border-secondary-foreground",
    MEDIUM: "bg-chart-3 text-foreground border-foreground",
    LOW: "bg-muted text-muted-foreground border-muted-foreground",
  };
  return colors[priority] || colors["MEDIUM"];
}

// Obtenir la couleur de bordure de la carte
function getCardBorderColor(priority, completed) {
  if (completed) return "border-border";
  const colors = {
    HIGH: "border-primary",
    MEDIUM: "border-chart-2",
    LOW: "border-border",
  };
  return colors[priority] || colors["MEDIUM"];
}

// Rendre les quêtes
function renderQuests() {
  questContainer.innerHTML = "";

  quests.forEach((quest) => {
    const questCard = document.createElement("div");
    const borderColor = getCardBorderColor(quest.priority, quest.completed);
    const priorityColorClass = getPriorityColor(quest.priority);

    questCard.className = `group flex items-center gap-3 ${quest.completed ? "bg-muted/30 opacity-70" : "bg-card shadow-[4px_4px_0px_0px_var(--color-" + (quest.priority === "HIGH" ? "primary" : "border") + ")]"} p-3 border-2 ${borderColor} transition-all relative`;

    questCard.innerHTML = `
      <div class="size-6 border-2 border-foreground ${quest.completed ? "bg-primary" : "bg-background"} flex items-center justify-center cursor-pointer hover:bg-muted" data-action="toggle" data-id="${quest.id}">
        ${quest.completed ? '<iconify-icon icon="solar:check-read-bold" class="size-4 text-primary-foreground"></iconify-icon>' : ""}
      </div>
      <div class="flex-1">
        <p class="font-bold text-sm ${quest.completed ? "line-through text-muted-foreground" : ""}">${quest.title}</p>
      </div>
      ${!quest.completed && quest.priority !== "LOW" ? `<div class="px-2 py-0.5 ${priorityColorClass} text-[10px] font-bold border">${quest.priority}</div>` : ""}
      <button class="size-6 bg-destructive border border-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-action="delete" data-id="${quest.id}">
        <iconify-icon icon="solar:trash-bin-trash-bold" class="size-3 text-white"></iconify-icon>
      </button>
    `;

    questContainer.appendChild(questCard);
  });

  // Event listeners sur les boutons
  document.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.getAttribute("data-id"));
      toggleQuest(id);
    });
  });

  // Gestion modale de confirmation personnalisée
  const confirmModal = document.getElementById("confirmDeleteModal");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");
  let pendingDeleteId = null;

  document.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      pendingDeleteId = parseInt(e.currentTarget.getAttribute("data-id"));
      confirmModal.classList.add("active");
    });
  });

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      confirmModal.classList.remove("active");
      pendingDeleteId = null;
    };
  }
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      if (pendingDeleteId != null) {
        deleteQuest(pendingDeleteId);
      }
      confirmModal.classList.remove("active");
      pendingDeleteId = null;
    };
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Event Listeners pour la modal de tâches
document
  .getElementById("closeModal")
  ?.addEventListener("click", closeTaskModal);
document
  .getElementById("cancelTask")
  ?.addEventListener("click", closeTaskModal);
document
  .getElementById("createTask")
  ?.addEventListener("click", createQuestFromModal);

// Event Listeners pour la modal d'événements
document
  .getElementById("closeEventModal")
  ?.addEventListener("click", () => planningManager.closeEventModal());
document
  .getElementById("cancelEventBtn")
  ?.addEventListener("click", () => planningManager.closeEventModal());
document
  .getElementById("createEventBtn")
  ?.addEventListener("click", () => planningManager.createEventFromModal());

// Event Listeners pour la modal d'objectifs
document
  .getElementById("closeGoalModal")
  ?.addEventListener("click", () => planningManager.closeGoalModal());
document
  .getElementById("cancelGoalBtn")
  ?.addEventListener("click", () => planningManager.closeGoalModal());
document
  .getElementById("createGoalBtn")
  ?.addEventListener("click", () => planningManager.createGoalFromModal());

// Fermer avec Escape
document.addEventListener("keydown", (e) => {
  const taskModalOpen =
    document.getElementById("taskModal").style.display === "flex";
  const eventModalOpen =
    document.getElementById("eventModal").style.display === "flex";
  const goalModalOpen =
    document.getElementById("goalModal")?.style.display === "flex";
  const profileModalOpen =
    document.getElementById("profileModal")?.style.display === "flex";

  if (e.key === "Escape") {
    if (taskModalOpen) closeTaskModal();
    if (eventModalOpen) planningManager.closeEventModal();
    if (goalModalOpen) planningManager.closeGoalModal();
    if (profileModalOpen) profileManager.closeProfileModal();
  }

  // Enter pour créer
  if (e.key === "Enter" && taskModalOpen) {
    createQuestFromModal();
  }
  if (e.key === "Enter" && eventModalOpen) {
    planningManager.createEventFromModal();
  }
  if (e.key === "Enter" && goalModalOpen) {
    planningManager.createGoalFromModal();
  }
  if (e.key === "Enter" && profileModalOpen) {
    profileManager.saveProfileFromModal();
  }
});

// Fermer en cliquant sur l'overlay
document.getElementById("taskModal")?.addEventListener("click", (e) => {
  if (e.target.id === "taskModal") {
    closeTaskModal();
  }
});

document.getElementById("eventModal")?.addEventListener("click", (e) => {
  if (e.target.id === "eventModal") {
    planningManager.closeEventModal();
  }
});

document.getElementById("goalModal")?.addEventListener("click", (e) => {
  if (e.target.id === "goalModal") {
    planningManager.closeGoalModal();
  }
});

// Gestion des clics sur les options de priorité
document.querySelectorAll(".priority-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    const priority = e.currentTarget.getAttribute("data-priority");
    updatePrioritySelection(priority);
  });
});

// Gestion des clics sur les options de couleur
document.querySelectorAll(".color-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    const color = e.currentTarget.getAttribute("data-color");
    planningManager.updateColorSelection(color);
  });
});

// Event Listeners pour la modal de profil
document
  .getElementById("closeProfileModal")
  ?.addEventListener("click", () => profileManager.closeProfileModal());
document
  .getElementById("cancelProfileBtn")
  ?.addEventListener("click", () => profileManager.closeProfileModal());
document
  .getElementById("saveProfileBtn")
  ?.addEventListener("click", () => profileManager.saveProfileFromModal());

// Upload d'avatar depuis PC
document.getElementById("avatarUpload")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      // Créer une option temporaire pour l'avatar uploadé
      const customAvatar = event.target.result;

      // Désélectionner tous les autres
      document.querySelectorAll(".avatar-option").forEach((opt) => {
        opt.classList.remove("selected");
        opt.querySelector(".pixel-checkbox").classList.remove("checked");
      });

      // Stocker l'avatar custom temporairement
      profileManager.customAvatar = customAvatar;

      showNotification("Avatar uploaded. Click SAVE.", "success");
    };
    reader.readAsDataURL(file);
  }
});

// Fermer profileModal en cliquant sur l'overlay
document.getElementById("profileModal")?.addEventListener("click", (e) => {
  if (e.target.id === "profileModal") {
    profileManager.closeProfileModal();
  }
});

// Event Listener pour le bouton +
addQuestButton?.addEventListener("click", addQuest);

// Export pour utilisation dans d'autres modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadQuests,
    saveQuests,
    quests,
    openTaskModal,
  };
}
