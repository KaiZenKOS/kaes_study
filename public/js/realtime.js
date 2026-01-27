(function () {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  let roomId = params.get("room");
  let socket = null;

  function getOrCreateClientId() {
    const key = "clientId";
    let id = localStorage.getItem(key);
    if (id) return id;
    id = (
      crypto?.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    )
      .toString()
      .slice(0, 64);
    localStorage.setItem(key, id);
    return id;
  }

  const clientId = getOrCreateClientId();

  async function createRoomId() {
    try {
      const res = await fetch("/api/room/new", { cache: "no-store" });
      const data = await res.json();
      if (data?.roomId) return String(data.roomId).slice(0, 64);
    } catch {
      // ignore
    }
    // fallback (still URL-safe)
    return (
      crypto?.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    )
      .replaceAll("-", "")
      .slice(0, 24);
  }

  function getInviteLink(rid) {
    const inviteUrl = new URL(window.location.href);
    inviteUrl.searchParams.set("room", rid);
    return inviteUrl.toString();
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function ensureRoomUi() {
    let container = document.getElementById("roomParticipants");
    if (!container) return null;
    return container;
  }

  function renderParticipants(participants) {
    const container = ensureRoomUi();
    if (!container) return;

    container.innerHTML = "";

    if (!participants || participants.length === 0) {
      container.classList.add("hidden");
      return;
    }

    container.classList.add("flex");

    (participants || []).slice(0, 8).forEach((p) => {
      const item = document.createElement("div");
      const displayName = (p?.name || "Guest").toString();

      item.className =
        "relative group size-9 border-2 border-foreground bg-card shadow-[2px_2px_0px_0px_var(--color-border)] flex items-center justify-center transition-transform hover:-translate-y-0.5";

      const avatarBox = document.createElement("div");
      avatarBox.className =
        "w-full h-full overflow-hidden flex items-center justify-center";

      if (p.avatar) {
        const img = document.createElement("img");
        img.src = p.avatar;
        img.alt = displayName;
        img.className = "w-full h-full object-cover";
        avatarBox.appendChild(img);
      } else {
        const span = document.createElement("span");
        span.className = "text-xs font-black";
        span.textContent = displayName.trim().slice(0, 1).toUpperCase();
        avatarBox.appendChild(span);
      }

      item.appendChild(avatarBox);

      // Tooltip (clean hover)
      const tooltip = document.createElement("div");
      tooltip.className =
        "pointer-events-none absolute right-0 -top-2 -translate-y-full hidden group-hover:block z-50 bg-card border-2 border-foreground px-2 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_var(--color-foreground)] whitespace-nowrap";
      tooltip.textContent = displayName;
      item.appendChild(tooltip);

      container.appendChild(item);
    });

    container.classList.remove("hidden");
  }

  function setSyncEnabled(enabled) {
    if (typeof window.setTimerSyncEnabled === "function") {
      window.setTimerSyncEnabled(!!enabled);
    }
  }

  function setHostPermissions(youAreHost) {
    if (typeof window.setRoomHost === "function") {
      window.setRoomHost(!!youAreHost);
    }
  }

  function connectIfNeeded() {
    if (!roomId) return;
    if (socket) return;
    if (typeof window.io !== "function") return;

    socket = window.io();

    socket.on("connect", () => {
      const profile =
        typeof profileManager !== "undefined"
          ? profileManager.loadProfile()
          : null;
      socket.emit("room:join", {
        roomId,
        clientId,
        profile: {
          name: profile?.name || "Guest",
          avatar: profile?.avatar || "",
        },
      });

      setSyncEnabled(true);
    });

    socket.on("room:state", (payload) => {
      if (!payload) return;
      renderParticipants(payload.participants);
      if (typeof payload.youAreHost !== "undefined") {
        setHostPermissions(payload.youAreHost);
      } else if (payload.hostClientId) {
        setHostPermissions(payload.hostClientId === clientId);
      }
      if (payload.timer && typeof window.applyRoomTimerState === "function") {
        window.applyRoomTimerState(payload.timer);
      }
    });

    socket.on("room:participants", (payload) => {
      if (!payload) return;
      renderParticipants(payload.participants);
      if (payload.hostClientId) {
        setHostPermissions(payload.hostClientId === clientId);
      }
    });

    socket.on("timer:state", (payload) => {
      if (!payload?.timer) return;
      if (typeof window.applyRoomTimerState === "function") {
        window.applyRoomTimerState(payload.timer);
      }
    });

    // Bridge UI -> server
    window.addEventListener("roomTimer:start", (e) => {
      if (!socket || !roomId) return;
      const detail = e.detail || {};
      socket.emit("timer:start", {
        roomId,
        mode: detail.mode,
        durationSec: detail.durationSec,
        resume: !!detail.resume,
      });
    });

    window.addEventListener("roomTimer:stop", () => {
      if (!socket || !roomId) return;
      socket.emit("timer:stop", { roomId });
    });

    window.addEventListener("roomTimer:reset", (e) => {
      if (!socket || !roomId) return;
      const detail = e.detail || {};
      socket.emit("timer:reset", {
        roomId,
        mode: detail.mode,
        durationSec: detail.durationSec,
      });
    });
  }

  function setupInviteButton() {
    const btn = document.getElementById("inviteBtn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      if (!roomId) {
        roomId = await createRoomId();
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("room", roomId);
        window.history.pushState({}, "", nextUrl);
        connectIfNeeded();
      }

      const link = getInviteLink(roomId);
      const ok = await copyToClipboard(link);
      if (typeof showNotification === "function") {
        showNotification(
          (ok ? "Invite link copied:\n" : "Copy this link:\n") + link,
          ok ? "success" : "info",
        );
      } else if (!ok) {
        window.prompt("Copy this link:", link);
      }
    });
  }

  // Boot
  setupInviteButton();

  if (roomId) {
    connectIfNeeded();
  } else {
    setSyncEnabled(false);
  }
})();
