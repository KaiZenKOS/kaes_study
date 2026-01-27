// ============================================
// GESTIONNAIRE DE STATISTIQUES
// ============================================

const statsManager = {
  calculateStats() {
    const totalSessions = parseInt(
      localStorage.getItem("totalSessions") || "0",
    );
    const totalFocusSeconds = parseInt(
      localStorage.getItem("totalFocusTime") || "0",
    );
    const completedQuests = quests.filter((q) => q.completed).length;
    const streak = this.calculateStreak();
    const weekData = this.getWeekData();

    return {
      sessions: totalSessions,
      totalTime: (totalFocusSeconds / 3600).toFixed(1),
      completedTasks: completedQuests,
      streak: streak,
      weekData: weekData,
    };
  },

  calculateStreak() {
    const streakData = JSON.parse(localStorage.getItem("streakData") || "[]");
    if (streakData.length === 0) return 0;

    let streak = 0;
    const today = new Date().toDateString();

    for (let i = streakData.length - 1; i >= 0; i--) {
      const date = new Date(streakData[i]).toDateString();
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - streak);

      if (date === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  getWeekData() {
    const weekData = JSON.parse(
      localStorage.getItem("weeklyFocusTime") || "{}",
    );
    const days = ["L", "M", "M", "J", "V", "S", "D"];
    const today = new Date().getDay();

    return days.map((day, index) => {
      const dayIndex = (index + 1) % 7;
      const hours = weekData[dayIndex] || 0;
      const percentage = Math.min((hours / 8) * 100, 100);
      const isToday = dayIndex === today;
      return { day, hours, percentage, isToday };
    });
  },

  recordSession() {
    const totalSessions = parseInt(
      localStorage.getItem("totalSessions") || "0",
    );
    localStorage.setItem("totalSessions", (totalSessions + 1).toString());

    // Ajouter au streak
    const streakData = JSON.parse(localStorage.getItem("streakData") || "[]");
    const today = new Date().toDateString();
    if (!streakData.includes(today)) {
      streakData.push(today);
      localStorage.setItem("streakData", JSON.stringify(streakData));
    }

    // Mettre à jour les données hebdomadaires
    const weekData = JSON.parse(
      localStorage.getItem("weeklyFocusTime") || "{}",
    );
    const dayIndex = new Date().getDay();
    weekData[dayIndex] = (weekData[dayIndex] || 0) + 0.5; // 25 min = 0.42h environ
    localStorage.setItem("weeklyFocusTime", JSON.stringify(weekData));

    this.updateStatsDisplay();
  },

  updateStatsDisplay() {
    const stats = this.calculateStats();

    // Mettre à jour les compteurs
    const sessionsEl = document.getElementById("stat-sessions");
    const timeEl = document.getElementById("stat-time");
    const tasksEl = document.getElementById("stat-tasks");
    const streakEl = document.getElementById("stat-streak");

    if (sessionsEl) sessionsEl.textContent = stats.sessions;
    if (timeEl) timeEl.textContent = stats.totalTime + "h";
    if (tasksEl) tasksEl.textContent = stats.completedTasks;
    if (streakEl) streakEl.textContent = stats.streak;

    // Mettre à jour le graphique hebdomadaire
    this.updateWeekChart(stats.weekData);

    // Mettre à jour les badges
    this.updateBadges(stats);
  },

  updateWeekChart(weekData) {
    const bars = document.querySelectorAll(".chart-bar");
    weekData.forEach((data, index) => {
      if (bars[index]) {
        bars[index].style.height = `${data.percentage}%`;
        if (data.isToday) {
          bars[index].classList.remove("bg-chart-2");
          bars[index].classList.add("bg-primary");
        }
      }
    });
  },

  updateBadges(stats) {
    const badgeFirst = document.getElementById("badge-first");
    const badgeWeek = document.getElementById("badge-week");
    const badgePro = document.getElementById("badge-pro");
    const badgeLegend = document.getElementById("badge-legend");

    // Badge 1: First Focus (débloqué si au moins 1 session)
    if (stats.sessions > 0 && badgeFirst) {
      badgeFirst.classList.remove("opacity-40");
    }

    // Badge 2: 7 Days (débloqué si streak >= 7)
    if (stats.streak >= 7 && badgeWeek) {
      badgeWeek.classList.remove("opacity-40");
    }

    // Badge 3: Pro (débloqué si 20h+ de focus)
    if (parseFloat(stats.totalTime) >= 20 && badgePro) {
      badgePro.classList.remove("opacity-40");
    }

    // Badge 4: Legend (débloqué si 100h+)
    if (parseFloat(stats.totalTime) >= 100 && badgeLegend) {
      badgeLegend.classList.remove("opacity-40");
    }
  },
};

// Export pour utilisation dans d'autres modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = statsManager;
}
