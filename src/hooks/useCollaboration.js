// useCollaboration.js — Socket.IO real-time collaboration
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export function useCollaboration({ diagramId, user, onNodesUpdate, onEdgesUpdate, onPencilUpdate }) {
  const socketRef   = useRef(null);
  const suppressRef = useRef(false); // true while applying a remote update → don't echo back

  const [connected, setConnected] = useState(false);
  const [presence,  setPresence]  = useState([]);
  const [cursors,   setCursors]   = useState({});

  useEffect(() => {
    // Only connect when we have a saved diagram (has an id)
    if (!diagramId || !user) return;

    const token = localStorage.getItem("cf_token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-diagram", { diagramId });
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setPresence([]);
      setCursors({});
    });

    socket.on("connect_error", () => setConnected(false));

    // On join — server sends the authoritative diagram state
    socket.on("diagram-state", ({ nodes, edges, pencilLines }) => {
      suppressRef.current = true;
      onNodesUpdate(nodes   || []);
      onEdgesUpdate(edges   || []);
      onPencilUpdate(pencilLines || []);
      // Release suppress after React has processed the updates
      requestAnimationFrame(() => { suppressRef.current = false; });
    });

    // Incoming changes from other collaborators
    socket.on("nodes-update",  ({ nodes })       => {
      suppressRef.current = true;
      onNodesUpdate(nodes);
      requestAnimationFrame(() => { suppressRef.current = false; });
    });
    socket.on("edges-update",  ({ edges })       => {
      suppressRef.current = true;
      onEdgesUpdate(edges);
      requestAnimationFrame(() => { suppressRef.current = false; });
    });
    socket.on("pencil-update", ({ pencilLines }) => {
      suppressRef.current = true;
      onPencilUpdate(pencilLines);
      requestAnimationFrame(() => { suppressRef.current = false; });
    });

    // Presence list (excludes self — server already filters)
    socket.on("presence-update", (users) => {
      setPresence(users.filter(u => u.socketId !== socket.id));
    });

    // Live cursor positions from other users
    socket.on("cursor-update", ({ socketId, firstName, color, x, y }) => {
      setCursors(prev => ({ ...prev, [socketId]: { firstName, color, x, y } }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setPresence([]);
      setCursors({});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramId, user?._id]);

  // ── Emit helpers — only emit if this is a LOCAL change (not echoing remote) ─
  const emitNodes = useCallback((nodes) => {
    if (!socketRef.current?.connected || suppressRef.current || !diagramId) return;
    socketRef.current.emit("nodes-change", { diagramId, nodes });
  }, [diagramId]);

  const emitEdges = useCallback((edges) => {
    if (!socketRef.current?.connected || suppressRef.current || !diagramId) return;
    socketRef.current.emit("edges-change", { diagramId, edges });
  }, [diagramId]);

  const emitPencil = useCallback((pencilLines) => {
    if (!socketRef.current?.connected || suppressRef.current || !diagramId) return;
    socketRef.current.emit("pencil-change", { diagramId, pencilLines });
  }, [diagramId]);

  const emitCursor = useCallback((x, y) => {
    if (!socketRef.current?.connected || !diagramId) return;
    socketRef.current.emit("cursor-move", { diagramId, x, y });
  }, [diagramId]);

  return {
    connected,
    presence,
    cursors,
    suppressRef, // exposed so canvas can read it before emitting
    emitNodes,
    emitEdges,
    emitPencil,
    emitCursor,
  };
}