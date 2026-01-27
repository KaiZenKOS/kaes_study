// ============================================
// GESTIONNAIRE DE PLANNING
// ============================================

const planningManager = {
  currentDate: new Date(),
  selectedDate: null,

  loadEvents() {
    return JSON.parse(localStorage.getItem("calendarEvents") || "[]");
  },

  saveEvents(events) {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  },

  addEvent(event) {
    const events = this.loadEvents();
    events.push({
      id: Date.now(),
      ...event,
      date: event.date || new Date().toISOString(),
    });
    this.saveEvents(events);
    this.renderWeekEvents();
    this.renderCalendar(); // Mettre à jour le calendrier aussi
  },

  deleteEvent(eventId) {
    const events = this.loadEvents();
    const updatedEvents = events.filter((e) => e.id !== eventId);
    this.saveEvents(updatedEvents);
    this.renderWeekEvents();
    this.renderCalendar(); // Mettre à jour le calendrier aussi
    showNotification("🗑️ Event deleted", "info");
  },

  getTodayEvents() {
    const events = this.loadEvents();
    const today = new Date().toDateString();
    return events.filter((e) => new Date(e.date).toDateString() === today);
  },

  getWeekEvents() {
    const events = this.loadEvents();
    const today = new Date();

    // Trouver le lundi de cette semaine
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Ajuster pour que lundi soit le premier jour
    monday.setDate(monday.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    // Trouver le dimanche de cette semaine
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Filtrer les événements de la semaine
    return events.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate >= monday && eventDate <= sunday;
    });
  },

  renderTodayEvents() {
    // Appeler renderWeekEvents pour afficher toute la semaine
    this.renderWeekEvents();
  },

  renderWeekEvents() {
    const container = document.getElementById("week-events");
    if (!container) return;

    const events = this.getWeekEvents();

    if (events.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-muted-foreground">
          <p class="text-sm">No events scheduled this week</p>
        </div>
      `;
      return;
    }

    // Grouper les événements par jour
    const eventsByDay = {};
    const today = new Date().toDateString();

    events.forEach((event) => {
      const eventDate = new Date(event.date);
      const dateKey = eventDate.toDateString();

      if (!eventsByDay[dateKey]) {
        eventsByDay[dateKey] = {
          date: eventDate,
          isToday: dateKey === today,
          events: [],
        };
      }
      eventsByDay[dateKey].events.push(event);
    });

    // Trier les jours par date
    const sortedDays = Object.values(eventsByDay).sort(
      (a, b) => a.date - b.date,
    );

    const daysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    container.innerHTML = sortedDays
      .map((day) => {
        const dayName = daysNames[day.date.getDay()];
        const dayNum = day.date.getDate();
        const monthName = monthNames[day.date.getMonth()];
        const todayBadge = day.isToday
          ? '<span class="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold ml-2">TODAY</span>'
          : "";

        return `
        <div class="border-2 border-border p-3 bg-background/50">
          <div class="flex items-center gap-2 mb-2 pb-2 border-b border-border">
            <span class="text-xs font-black text-muted-foreground">${dayName} ${dayNum} ${monthName}</span>
            ${todayBadge}
          </div>
          <div class="space-y-2">
            ${day.events
              .map(
                (event) => `
              <div class="flex items-center gap-3 p-2 bg-background border border-border hover:bg-muted/30 transition-colors">
                <div class="size-2 bg-${event.color || "primary"} rounded-full"></div>
                <div class="flex-1">
                  <p class="text-sm font-bold">${event.title}</p>
                  <p class="text-xs text-muted-foreground">${event.time}</p>
                </div>
                <button 
                  onclick="planningManager.deleteEvent(${event.id})"
                  class="size-6 bg-destructive border border-foreground flex items-center justify-center hover:scale-110 transition-transform"
                  title="Delete"
                >
                  <iconify-icon icon="solar:trash-bin-trash-bold" class="size-3 text-white"></iconify-icon>
                </button>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
      })
      .join("");
  },

  openAddEventModal(date = null) {
    const modal = document.getElementById("eventModal");
    modal.style.display = "flex";

    // Stocker la date sélectionnée
    if (date) {
      this.selectedDate = date;
    } else {
      this.selectedDate = new Date();
    }

    // Reset inputs
    document.getElementById("eventTitleInput").value = "";
    document.getElementById("eventTimeInput").value = "";

    // Reset color selection to primary
    document.querySelectorAll(".color-option").forEach((option) => {
      const checkbox = option.querySelector(".pixel-checkbox");
      if (option.dataset.color === "primary") {
        option.classList.add("selected");
        checkbox.classList.add("checked");
      } else {
        option.classList.remove("selected");
        checkbox.classList.remove("checked");
      }
    });
  },

  closeEventModal() {
    document.getElementById("eventModal").style.display = "none";
  },

  updateColorSelection(selectedColor) {
    document.querySelectorAll(".color-option").forEach((option) => {
      const checkbox = option.querySelector(".pixel-checkbox");
      if (option.dataset.color === selectedColor) {
        option.classList.add("selected");
        checkbox.classList.add("checked");
      } else {
        option.classList.remove("selected");
        checkbox.classList.remove("checked");
      }
    });
  },

  createEventFromModal() {
    const title = document.getElementById("eventTitleInput").value.trim();
    const time = document.getElementById("eventTimeInput").value.trim();
    const selectedOption = document.querySelector(".color-option.selected");
    const color = selectedOption ? selectedOption.dataset.color : "primary";

    if (!title) {
      showNotification("Title is required", "error");
      return;
    }

    if (!time) {
      showNotification("Time is required", "error");
      return;
    }

    // Utiliser la date sélectionnée
    const eventDate = this.selectedDate || new Date();
    this.addEvent({ title, time, color, date: eventDate.toISOString() });
    this.closeEventModal();
    showNotification("Event added.", "success");
  },

  loadGoals() {
    return JSON.parse(localStorage.getItem("weeklyGoals") || "[]");
  },

  saveGoals(goals) {
    localStorage.setItem("weeklyGoals", JSON.stringify(goals));
  },

  toggleGoal(goalIndex) {
    const goals = this.loadGoals();
    if (goals[goalIndex]) {
      goals[goalIndex].completed = !goals[goalIndex].completed;
      this.saveGoals(goals);
      this.renderGoals();
    }
  },

  openAddGoalModal() {
    const modal = document.getElementById("goalModal");
    modal.style.display = "flex";

    // Reset input
    document.getElementById("goalTextInput").value = "";

    // Focus sur l'input
    setTimeout(() => {
      document.getElementById("goalTextInput")?.focus();
    }, 100);
  },

  closeGoalModal() {
    document.getElementById("goalModal").style.display = "none";
  },

  addGoal() {
    this.openAddGoalModal();
  },

  createGoalFromModal() {
    const goalText = document.getElementById("goalTextInput").value.trim();

    if (!goalText) {
      showNotification("Goal text is required", "error");
      return;
    }

    const goals = this.loadGoals();
    goals.push({ text: goalText, completed: false });
    this.saveGoals(goals);
    this.renderGoals();
    this.closeGoalModal();
    showNotification("Goal added.", "success");
  },

  deleteGoal(goalIndex) {
    if (confirm("Delete this goal?")) {
      const goals = this.loadGoals();
      goals.splice(goalIndex, 1);
      this.saveGoals(goals);
      this.renderGoals();
      showNotification("Goal deleted.", "info");
    }
  },

  renderGoals() {
    const container = document.getElementById("weekly-goals");
    if (!container) return;

    let goals = this.loadGoals();

    // Si aucun objectif, afficher un message
    if (goals.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-muted-foreground">
          <p class="text-sm">No goals yet. Click + to add one!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = goals
      .map(
        (goal, index) => `
      <div class="flex items-center gap-3 p-2 -mx-2 rounded transition-colors group">
        <div class="pixel-checkbox ${goal.completed ? "checked" : ""} cursor-pointer" onclick="planningManager.toggleGoal(${index})"></div>
        <span class="text-sm font-bold ${goal.completed ? "line-through opacity-70" : ""} flex-1 cursor-pointer" onclick="planningManager.toggleGoal(${index})">${goal.text}</span>
        <button 
          onclick="planningManager.deleteGoal(${index})"
          class="size-5 bg-destructive border border-foreground flex items-center justify-center hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <iconify-icon icon="solar:trash-bin-trash-bold" class="size-3 text-white"></iconify-icon>
        </button>
      </div>
    `,
      )
      .join("");
  },

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Mettre à jour le titre du mois
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthTitle = document.getElementById("calendar-month");
    if (monthTitle) {
      monthTitle.textContent = `${monthNames[month]} ${year}`;
    }

    // Calculer le premier jour du mois (0 = dimanche, 1 = lundi, etc.)
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Ajuster pour que lundi soit le premier jour (0)
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;

    const container = document.getElementById("calendar-dates");
    if (!container) return;

    const today = new Date();
    const events = this.loadEvents();

    let html = "";

    // Jours du mois précédent
    for (let i = firstDayAdjusted - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      html += `
        <div class="aspect-square bg-muted/30 border border-border flex items-center justify-center text-xs text-muted-foreground">
          ${day}
        </div>
      `;
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const dateStr = date.toDateString();

      // Vérifier s'il y a des événements ce jour
      const hasEvents = events.some(
        (e) => new Date(e.date).toDateString() === dateStr,
      );

      const bgClass = isToday
        ? "bg-primary text-primary-foreground"
        : "bg-background";
      const fontClass = isToday ? "font-black" : "font-bold";

      html += `
        <div 
          class="aspect-square ${bgClass} border-2 border-foreground flex items-center justify-center text-xs ${fontClass} cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors relative"
          onclick="planningManager.selectDate(${year}, ${month}, ${day})"
        >
          ${day}
          ${hasEvents ? '<div class="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1.5 bg-chart-2 rounded-full"></div>' : ""}
        </div>
      `;
    }

    container.innerHTML = html;
  },

  selectDate(year, month, day) {
    const date = new Date(year, month, day);
    this.openAddEventModal(date);
  },

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.renderCalendar();
  },

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.renderCalendar();
  },
};

// Export pour utilisation dans d'autres modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = planningManager;
}
