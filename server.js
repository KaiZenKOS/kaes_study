const path = require("path");
const http = require("http");
const crypto = require("crypto");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require("express");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const app = express();
app.use(express.static(PUBLIC_DIR));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

/**
 * Room state stored in-memory.
 * If the server restarts, rooms/timers reset.
 */
const rooms = new Map();

function generateRoomId() {
  // URL-safe, hard to guess
  return crypto.randomBytes(12).toString("base64url");
}

function getOrCreateRoom(roomId) {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      // Keyed by stable clientId (localStorage) to avoid duplicate roster spam
      participants: new Map(),
      hostClientId: null,
      timer: {
        running: false,
        mode: "POMODORO",
        durationSec: 25 * 60,
        endTimeMs: null,
        remainingSec: 25 * 60,
      },
      timerTimeout: null,
    };
    rooms.set(roomId, room);
  }
  return room;
}
app.get("/api/quote", async (req, res) => {
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Impossible de récupérer la citation" });
  }
});
function roomParticipantsPayload(room) {
  return Array.from(room.participants.values()).map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
  }));
}

function broadcastParticipants(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit("room:participants", {
    roomId,
    hostClientId: room.hostClientId,
    participants: roomParticipantsPayload(room),
  });
}

function isHost(socket, room) {
  const clientId = socket?.data?.clientId;
  return !!clientId && room?.hostClientId === clientId;
}

function scheduleTimerEnd(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.timerTimeout) {
    clearTimeout(room.timerTimeout);
    room.timerTimeout = null;
  }

  if (!room.timer.running || !room.timer.endTimeMs) return;

  const delay = Math.max(0, room.timer.endTimeMs - Date.now());
  room.timerTimeout = setTimeout(() => {
    const currentRoom = rooms.get(roomId);
    if (!currentRoom) return;

    currentRoom.timer.running = false;
    currentRoom.timer.remainingSec = 0;
    currentRoom.timer.endTimeMs = null;

    io.to(roomId).emit("timer:state", {
      roomId,
      serverNowMs: Date.now(),
      timer: { ...currentRoom.timer },
    });
  }, delay);
}

app.get("/api/room/new", (req, res) => {
  const roomId = generateRoomId();
  // Do not reserve memory here (prevents room-creation abuse)
  res.json({ roomId });
});

io.on("connection", (socket) => {
  socket.on("room:join", ({ roomId, clientId, profile }) => {
    if (!roomId) return;

    const safeRoomId = String(roomId).slice(0, 64);
    const safeClientId = String(clientId || "").slice(0, 64) || socket.id;
    const room = getOrCreateRoom(safeRoomId);

    // If same client joins again, replace old socket to prevent roster spam
    const existing = room.participants.get(safeClientId);
    if (existing?.socketId && existing.socketId !== socket.id) {
      const oldSocket = io.sockets.sockets.get(existing.socketId);
      if (oldSocket) {
        try {
          oldSocket.disconnect(true);
        } catch {
          // ignore
        }
      }
    }

    socket.data.roomId = safeRoomId;
    socket.data.clientId = safeClientId;
    socket.join(safeRoomId);

    const participant = {
      id: safeClientId,
      socketId: socket.id,
      name: (profile?.name || "Guest").toString().slice(0, 40),
      avatar: (profile?.avatar || "").toString().slice(0, 500),
    };

    room.participants.set(safeClientId, participant);

    if (!room.hostClientId) {
      room.hostClientId = safeClientId;
    }

    // Send full room state to the joiner
    socket.emit("room:state", {
      roomId: safeRoomId,
      serverNowMs: Date.now(),
      hostClientId: room.hostClientId,
      youAreHost: room.hostClientId === safeClientId,
      participants: roomParticipantsPayload(room),
      timer: { ...room.timer },
    });

    broadcastParticipants(safeRoomId);
  });

  socket.on("timer:start", ({ roomId, mode, durationSec, resume }) => {
    if (!roomId) return;

    const safeRoomId = String(roomId).slice(0, 64);
    const room = getOrCreateRoom(safeRoomId);

    if (!isHost(socket, room)) return;

    if (room.timer.running && room.timer.endTimeMs) {
      // Already running; ignore duplicate starts
      return;
    }

    const requestedMode = (mode || "POMODORO").toString().slice(0, 20);
    const requestedDuration = Math.max(
      1,
      Math.min(24 * 60 * 60, Number(durationSec) || 0),
    );

    const pausedState =
      room.timer.running === false &&
      room.timer.endTimeMs === null &&
      Number.isFinite(Number(room.timer.remainingSec)) &&
      Number(room.timer.remainingSec) > 0;

    // Resume is default if we have paused state; otherwise start a fresh timer.
    const shouldResume = !!resume || pausedState;

    if (!shouldResume) {
      room.timer.mode = requestedMode;
      room.timer.durationSec = requestedDuration;
      room.timer.remainingSec = requestedDuration;
    }

    // If remainingSec is 0 (or invalid), start fresh.
    const remaining = Number(room.timer.remainingSec);
    const startFromSec =
      Number.isFinite(remaining) && remaining > 0
        ? remaining
        : room.timer.durationSec || requestedDuration;

    room.timer.running = true;
    room.timer.endTimeMs = Date.now() + startFromSec * 1000;
    room.timer.remainingSec = startFromSec;

    io.to(safeRoomId).emit("timer:state", {
      roomId: safeRoomId,
      serverNowMs: Date.now(),
      timer: { ...room.timer },
    });

    scheduleTimerEnd(safeRoomId);
  });

  socket.on("timer:stop", ({ roomId }) => {
    if (!roomId) return;

    const safeRoomId = String(roomId).slice(0, 64);
    const room = getOrCreateRoom(safeRoomId);

    if (!isHost(socket, room)) return;

    if (room.timerTimeout) {
      clearTimeout(room.timerTimeout);
      room.timerTimeout = null;
    }

    if (room.timer.running && room.timer.endTimeMs) {
      const remaining = Math.max(
        0,
        Math.ceil((room.timer.endTimeMs - Date.now()) / 1000),
      );
      room.timer.running = false;
      room.timer.remainingSec = remaining;
      room.timer.endTimeMs = null;

      io.to(safeRoomId).emit("timer:state", {
        roomId: safeRoomId,
        serverNowMs: Date.now(),
        timer: { ...room.timer },
      });
    }
  });

  socket.on("timer:reset", ({ roomId, mode, durationSec }) => {
    if (!roomId) return;

    const safeRoomId = String(roomId).slice(0, 64);
    const room = getOrCreateRoom(safeRoomId);

    if (!isHost(socket, room)) return;

    if (room.timerTimeout) {
      clearTimeout(room.timerTimeout);
      room.timerTimeout = null;
    }

    const safeMode = (mode || room.timer.mode || "POMODORO")
      .toString()
      .slice(0, 20);
    const safeDuration = Math.max(
      1,
      Math.min(
        24 * 60 * 60,
        Number(durationSec) || room.timer.durationSec || 0,
      ),
    );

    room.timer.mode = safeMode;
    room.timer.durationSec = safeDuration;
    room.timer.running = false;
    room.timer.remainingSec = safeDuration;
    room.timer.endTimeMs = null;

    io.to(safeRoomId).emit("timer:state", {
      roomId: safeRoomId,
      serverNowMs: Date.now(),
      timer: { ...room.timer },
    });
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    const clientId = socket.data.clientId;
    if (!roomId || !clientId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const existing = room.participants.get(clientId);
    if (existing?.socketId === socket.id) {
      room.participants.delete(clientId);

      if (room.hostClientId === clientId) {
        const nextHost = room.participants.keys().next().value || null;
        room.hostClientId = nextHost;
      }

      broadcastParticipants(roomId);
    }

    if (room.participants.size === 0) {
      if (room.timerTimeout) clearTimeout(room.timerTimeout);
      rooms.delete(roomId);
    }
  });
});

httpServer.listen(PORT, () => {
  // Intentionally no console.log (per your preference)
});
