import express       from "express";
import cors          from "cors";
import dotenv        from "dotenv";
import mongoose      from "mongoose";
import { createServer } from "http";
import { Server }    from "socket.io";
import jwt           from "jsonwebtoken";

import authRoutes    from "./routes/auth.js";
import diagramRoutes from "./routes/diagrams.js";
import User          from "./models/User.js";
import Diagram       from "./models/Diagram.js";

dotenv.config();

const app        = express();
const httpServer = createServer(app);
const PORT       = process.env.PORT || 5000;

// ── Socket.IO setup ───────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin:      process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// ── Express middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── REST routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/diagrams", diagramRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CloudForge API is running.", timestamp: new Date() });
});
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ── Socket.IO: JWT auth middleware ────────────────────────────────────────────
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Auth failed"));
  }
});

// ── In-memory presence: rooms[diagramId] = Map<socketId, userInfo> ───────────
const rooms = {};
const USER_COLORS = ["#2563eb","#dc2626","#059669","#d97706","#7c3aed","#db2777","#0891b2","#ea580c"];

function pickColor(diagramId) {
  const used = rooms[diagramId] ? new Set([...rooms[diagramId].values()].map(u => u.color)) : new Set();
  return USER_COLORS.find(c => !used.has(c)) || USER_COLORS[0];
}

// ── Socket.IO: Events ─────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`Socket+ ${socket.user.firstName} (${socket.id})`);

  socket.on("join-diagram", async ({ diagramId }) => {
    try {
      const diagram = await Diagram.findById(diagramId);
      if (!diagram) return socket.emit("collab-error", { message: "Diagram not found" });

      const uid      = socket.user._id.toString();
      const isOwner  = diagram.user.toString() === uid;
      const isCollab = diagram.collaborators.some(c => c.user.toString() === uid);
      if (!isOwner && !isCollab) return socket.emit("collab-error", { message: "Access denied" });

      socket.join(diagramId);
      socket.currentDiagram = diagramId;

      if (!rooms[diagramId]) rooms[diagramId] = new Map();
      rooms[diagramId].set(socket.id, {
        socketId: socket.id, userId: uid,
        firstName: socket.user.firstName, lastName: socket.user.lastName,
        color: pickColor(diagramId), cursor: null,
      });

      // Send current state to the new joiner
      socket.emit("diagram-state", {
        nodes: diagram.nodes, edges: diagram.edges, pencilLines: diagram.pencilLines,
      });

      // Broadcast updated presence list to everyone in the room
      io.to(diagramId).emit("presence-update", [...rooms[diagramId].values()]);
      console.log(`Room ${diagramId}: ${rooms[diagramId].size} user(s)`);
    } catch (err) {
      socket.emit("collab-error", { message: "Failed to join" });
    }
  });

  // Canvas changes — broadcast to everyone except sender
  socket.on("nodes-change",  ({ diagramId, nodes })       => socket.to(diagramId).emit("nodes-update",  { nodes }));
  socket.on("edges-change",  ({ diagramId, edges })       => socket.to(diagramId).emit("edges-update",  { edges }));
  socket.on("pencil-change", ({ diagramId, pencilLines }) => socket.to(diagramId).emit("pencil-update", { pencilLines }));

  // Live cursors
  socket.on("cursor-move", ({ diagramId, x, y }) => {
    if (!rooms[diagramId]?.has(socket.id)) return;
    const u = rooms[diagramId].get(socket.id);
    u.cursor = { x, y };
    socket.to(diagramId).emit("cursor-update", {
      socketId: socket.id, userId: u.userId,
      firstName: u.firstName, color: u.color, x, y,
    });
  });

  socket.on("disconnect", () => {
    const did = socket.currentDiagram;
    if (did && rooms[did]) {
      rooms[did].delete(socket.id);
      if (rooms[did].size === 0) delete rooms[did];
      else io.to(did).emit("presence-update", [...rooms[did].values()]);
    }
    console.log(`Socket- ${socket.user?.firstName} (${socket.id})`);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected");
    httpServer.listen(PORT, () => console.log(`🚀  CloudForge + Socket.IO → http://localhost:${PORT}`));
  })
  .catch(err => { console.error("❌  MongoDB failed:", err.message); process.exit(1); });