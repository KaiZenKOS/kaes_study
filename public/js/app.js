// ============================================
// TIMER POMODORO LOGIC
// ============================================

// Charger les durées personnalisées
function getTimerDurations() {
  const saved = localStorage.getItem("timerDurations");
  return saved ? JSON.parse(saved) : { pomodoro: 25, short: 5, long: 15 };
}

let durations = getTimerDurations();

const TIMER_MODES = {
  POMODORO: { duration: durations.pomodoro * 60, label: "POMODORO" },
  SHORT_BREAK: { duration: durations.short * 60, label: "SHORT BREAK" },
  LONG_BREAK: { duration: durations.long * 60, label: "LONG BREAK" },
};

// Fonction pour mettre à jour les modes depuis les réglages
function updateTimerModes() {
  durations = getTimerDurations();
  TIMER_MODES.POMODORO.duration = durations.pomodoro * 60;
  TIMER_MODES.SHORT_BREAK.duration = durations.short * 60;
  TIMER_MODES.LONG_BREAK.duration = durations.long * 60;

  // Réinitialiser le timer si non actif
  if (!isRunning) {
    timeRemaining = TIMER_MODES[currentMode].duration;
    updateDisplay();
  }
}

let currentMode = "POMODORO";
let timeRemaining = TIMER_MODES.POMODORO.duration;
let timerInterval = null;
let isRunning = false;
let isSyncEnabled = false;
let syncedEndTimeMs = null;
let isRoomHost = true;
let lastSyncedFocusSecond = null;
let totalFocusTime = 0; // En secondes
let pomodoroCount = 0; // Compteur de sessions Pomodoro

// Éléments DOM
const timerDisplay = document.querySelector(".text-7xl");
const startButton = document.querySelector(
  ".bg-primary.text-primary-foreground",
);
const restartButton = document.querySelector(".size-14.bg-muted");
const modeButtons = document.querySelectorAll(
  ".flex.justify-center.gap-4.mb-8 button",
);

// Formater le temps en MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Mettre à jour l'affichage du timer
function updateDisplay() {
  timerDisplay.textContent = formatTime(timeRemaining);
}

function clearTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function setStartButtonRunning(running) {
  startButton.innerHTML = running
    ? `
      <iconify-icon icon="solar:stop-bold" class="size-6"></iconify-icon>STOP
    `
    : `
      <iconify-icon icon="solar:play-bold" class="size-6"></iconify-icon>START
    `;
}

function startSyncedInterval() {
  clearTimerInterval();
  if (!syncedEndTimeMs) return;

  lastSyncedFocusSecond = Math.floor(Date.now() / 1000);

  timerInterval = setInterval(() => {
    const remaining = Math.max(
      0,
      Math.ceil((syncedEndTimeMs - Date.now()) / 1000),
    );
    timeRemaining = remaining;
    updateDisplay();

    // Incrémenter le temps de focus seulement en mode POMODORO
    if (isRunning && currentMode === "POMODORO" && remaining > 0) {
      const nowSec = Math.floor(Date.now() / 1000);
      if (lastSyncedFocusSecond == null) lastSyncedFocusSecond = nowSec;
      const delta = Math.max(0, nowSec - lastSyncedFocusSecond);
      if (delta > 0) {
        totalFocusTime += delta;
        lastSyncedFocusSecond = nowSec;
        updateXP();
        saveFocusTime();
      }
    }

    if (remaining <= 0) {
      clearTimerInterval();
      isRunning = false;
      syncedEndTimeMs = null;
      lastSyncedFocusSecond = null;
      setStartButtonRunning(false);
      showNotification("Session complete!", "success");
    }
  }, 250);
}

// Démarrer/Arrêter le timer
function toggleTimer() {
  if (isSyncEnabled) {
    if (!isRoomHost) {
      showNotification("Only the host can control the timer.", "info");
      return;
    }

    if (isRunning) {
      window.dispatchEvent(new CustomEvent("roomTimer:stop"));
    } else {
      const fullDuration = TIMER_MODES[currentMode].duration;
      const resume = timeRemaining > 0 && timeRemaining < fullDuration;
      window.dispatchEvent(
        new CustomEvent("roomTimer:start", {
          detail: {
            mode: currentMode,
            durationSec: TIMER_MODES[currentMode].duration,
            resume,
          },
        }),
      );
    }
    return;
  }

  if (isRunning) {
    // STOP
    clearTimerInterval();
    isRunning = false;
    setStartButtonRunning(false);
  } else {
    // START
    isRunning = true;
    setStartButtonRunning(true);

    timerInterval = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        updateDisplay();

        // Incrémenter le temps de focus seulement en mode POMODORO
        if (currentMode === "POMODORO") {
          totalFocusTime++;
          updateXP();
          saveFocusTime();
        }
      } else {
        // Timer terminé
        clearTimerInterval();
        isRunning = false;
        setStartButtonRunning(false);

        // Passer automatiquement au mode suivant
        autoSwitchMode();

        // Notification
        showNotification("Session complete!", "success");
      }
    }, 1000);
  }
}

// Redémarrer le timer
function restartTimer() {
  if (isSyncEnabled) {
    if (!isRoomHost) {
      showNotification("Only the host can control the timer.", "info");
      return;
    }
    window.dispatchEvent(
      new CustomEvent("roomTimer:reset", {
        detail: {
          mode: currentMode,
          durationSec: TIMER_MODES[currentMode].duration,
        },
      }),
    );
    return;
  }

  clearTimerInterval();
  isRunning = false;
  timeRemaining = TIMER_MODES[currentMode].duration;
  updateDisplay();
  setStartButtonRunning(false);
}

// Changer de mode
function switchMode(mode) {
  if (isSyncEnabled) {
    if (!isRoomHost) {
      showNotification("Only the host can control the timer.", "info");
      return;
    }
    currentMode = mode;
    updateModeButtons();
    setStartButtonRunning(false);
    window.dispatchEvent(
      new CustomEvent("roomTimer:reset", {
        detail: {
          mode,
          durationSec: TIMER_MODES[mode].duration,
        },
      }),
    );
    return;
  }

  clearTimerInterval();
  isRunning = false;
  currentMode = mode;
  timeRemaining = TIMER_MODES[mode].duration;
  updateDisplay();
  setStartButtonRunning(false);

  // Mettre à jour les boutons de mode
  updateModeButtons();
}

// Passer automatiquement au mode suivant selon le cycle
function autoSwitchMode() {
  if (isSyncEnabled) {
    // In room mode we avoid local auto-switching to prevent desync.
    return;
  }

  if (currentMode === "POMODORO") {
    // Incrémenter le compteur après un Pomodoro
    pomodoroCount++;

    // Après 4 Pomodoros, prendre une longue pause
    if (pomodoroCount >= 4) {
      switchMode("LONG_BREAK");
      pomodoroCount = 0; // Réinitialiser le compteur
      showNotification(
        "Time for a long break! (" + durations.long + " min)",
        "info",
      );
    } else {
      // Sinon, courte pause
      switchMode("SHORT_BREAK");
      showNotification(
        "Short break! (" +
          durations.short +
          " min) - Session " +
          pomodoroCount +
          "/4",
        "info",
      );
    }
  } else if (currentMode === "SHORT_BREAK" || currentMode === "LONG_BREAK") {
    // Après une pause, retour au Pomodoro
    switchMode("POMODORO");
    showNotification(
      "Back to a Pomodoro! (" + durations.pomodoro + " min)",
      "success",
    );
  }
}

// Room sync bridge (called by realtime.js)
window.setTimerSyncEnabled = function (enabled) {
  isSyncEnabled = !!enabled;

  if (!isSyncEnabled) {
    syncedEndTimeMs = null;
    clearTimerInterval();
  }
};

window.setRoomHost = function (isHost) {
  isRoomHost = !!isHost;

  if (!isSyncEnabled) return;

  const disabled = !isRoomHost;
  try {
    startButton.disabled = disabled;
    restartButton.disabled = disabled;
    modeButtons.forEach((b) => (b.disabled = disabled));

    const offClass = "opacity-60 cursor-not-allowed";
    if (disabled) {
      startButton.classList.add(...offClass.split(" "));
      restartButton.classList.add(...offClass.split(" "));
      modeButtons.forEach((b) => b.classList.add(...offClass.split(" ")));
    } else {
      startButton.classList.remove(...offClass.split(" "));
      restartButton.classList.remove(...offClass.split(" "));
      modeButtons.forEach((b) => b.classList.remove(...offClass.split(" ")));
    }
  } catch {
    // ignore
  }
};

window.applyRoomTimerState = function (timer) {
  if (!timer) return;

  // Adopt server mode
  if (timer.mode && TIMER_MODES[timer.mode]) {
    currentMode = timer.mode;
    updateModeButtons();
  }

  const duration =
    Number(timer.durationSec) || TIMER_MODES[currentMode].duration;
  TIMER_MODES[currentMode].duration = duration;

  isRunning = !!timer.running;
  setStartButtonRunning(isRunning);

  if (isRunning && timer.endTimeMs) {
    syncedEndTimeMs = Number(timer.endTimeMs);
    startSyncedInterval();
  } else {
    syncedEndTimeMs = null;
    clearTimerInterval();
    const remaining = Number(timer.remainingSec);
    timeRemaining = Number.isFinite(remaining) ? remaining : duration;
    updateDisplay();
  }
};

// Mettre à jour les boutons de mode actif
function updateModeButtons() {
  // Mettre à jour le style des boutons
  modeButtons.forEach((btn, index) => {
    const modes = ["POMODORO", "SHORT_BREAK", "LONG_BREAK"];
    if (modes[index] === currentMode) {
      btn.className =
        "px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold border-2 border-secondary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]";
    } else {
      btn.className =
        "px-3 py-1 bg-transparent text-muted-foreground text-xs font-bold border-2 border-transparent hover:border-border";
    }
  });
}

// Mettre à jour l'XP (temps de focus)
function updateXP() {
  const hours = (totalFocusTime / 3600).toFixed(1);
  const xpDisplay = document.querySelector(
    ".text-3xl.font-black.text-foreground",
  );
  xpDisplay.textContent = hours;

  // Mettre à jour la barre de progression (objectif: 8h)
  const percentage = Math.min((totalFocusTime / (8 * 3600)) * 100, 100);
  const progressBar = document.querySelector(".bg-accent.h-full");
  progressBar.style.width = `${percentage}%`;
}

// Sauvegarder le temps de focus dans localStorage
function saveFocusTime() {
  localStorage.setItem("totalFocusTime", totalFocusTime);
  localStorage.setItem("lastSaveDate", new Date().toDateString());
  localStorage.setItem("pomodoroCount", pomodoroCount); // Sauvegarder le cycle
}

// Charger le temps de focus depuis localStorage
function loadFocusTime() {
  const savedTime = localStorage.getItem("totalFocusTime");
  const lastDate = localStorage.getItem("lastSaveDate");
  const savedPomodoroCount = localStorage.getItem("pomodoroCount");
  const today = new Date().toDateString();

  if (lastDate === today && savedTime) {
    totalFocusTime = parseInt(savedTime);
    pomodoroCount = savedPomodoroCount ? parseInt(savedPomodoroCount) : 0;
  } else {
    totalFocusTime = 0;
    pomodoroCount = 0;
    saveFocusTime();
  }
  updateXP();
}

// Event Listeners
startButton.addEventListener("click", toggleTimer);
restartButton.addEventListener("click", restartTimer);

modeButtons[0].addEventListener("click", () => switchMode("POMODORO"));
modeButtons[1].addEventListener("click", () => switchMode("SHORT_BREAK"));
modeButtons[2].addEventListener("click", () => switchMode("LONG_BREAK"));

// Export pour utilisation dans d'autres modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadFocusTime,
    updateDisplay,
    totalFocusTime,
  };
}
