import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { diagramAPI } from "../../services/api";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";

import CloudNode from "./CloudNode";
import Sidebar from "./Sidebar";
import DrawingToolbar from "./DrawingToolbar";
import { RectangleNode, CircleNode, TextNode, FrameNode, CommentNode } from "./ShapeNodes";
import { COMPONENTS, COLOR_MAP } from "./constants";
import { scanDiagram } from "./scanner";
import ScanPanel from "./ScanPanel";
import CollabPanel from "./CollabPanel";
import { useCollaboration } from "../../hooks/useCollaboration";
import "./CloudForgeCanvas.css";

const SHAPE_COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#dc2626","#db2777","#0891b2"];

const nodeTypes = {
  cloud: CloudNode,
  rectangle: RectangleNode,
  circle: CircleNode,
  textNode: TextNode,
  frame: FrameNode,
  comment: CommentNode,
};

let idCounter = 1;
const getId = () => `node_${idCounter++}`;

export default function StackForgeCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance]     = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [activeTool, setActiveTool]     = useState("select");
  const [activeColor, setActiveColor]   = useState(SHAPE_COLORS[0]);
  const [isDrawing, setIsDrawing]       = useState(false);
  const [pencilPath, setPencilPath]     = useState([]);
  const [pencilLines, setPencilLines]   = useState([]);
  const wrapperRef    = useRef(null);
  const { id: diagramId } = useParams();       // present when editing existing diagram
  const navigate          = useNavigate();
  const { user, logout }  = useAuth();
  const [diagramName, setDiagramName]   = useState("Untitled Architecture");
  const [saveStatus, setSaveStatus]     = useState("idle"); // idle | saving | saved | error
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName]         = useState("");
  const [saveDesc, setSaveDesc]         = useState("");
  const [scanOpen, setScanOpen]         = useState(false);
  const [isScanning, setIsScanning]     = useState(false);
  const [scanResult, setScanResult]     = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [collabOpen, setCollabOpen]             = useState(false);

  // ── Collaboration (Socket.IO) ────────────────────────────────────────────────
  const {
    connected: collabConnected,
    presence,
    cursors,
    suppressRef,
    emitNodes,
    emitEdges,
    emitPencil,
    emitCursor,
  } = useCollaboration({
    diagramId,
    user,
    onNodesUpdate:  (n) => setNodes(n),
    onEdgesUpdate:  (e) => setEdges(e),
    onPencilUpdate: (p) => setPencilLines(p),
  });

  // ── Keyboard shortcuts
  useEffect(() => {
    const map = { s:"select",r:"rectangle",o:"circle",a:"arrow",l:"line",d:"pencil",t:"text",f:"frame",c:"comment" };
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const tool = map[e.key.toLowerCase()];
      if (tool) setActiveTool(tool);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  // Load existing diagram if /canvas/:id
  useEffect(() => {
    if (!diagramId) return;
    diagramAPI.getOne(diagramId)
      .then(({ diagram }) => {
        setDiagramName(diagram.name);
        setNodes(diagram.nodes || []);
        setEdges(diagram.edges || []);
        setPencilLines(diagram.pencilLines || []);
      })
      .catch(() => {});
  }, [diagramId]);

  // ── Emit canvas changes to collaborators ────────────────────────────────────
  // suppressRef is true when a remote update is being applied — skip emit to
  // prevent echo loops. We use a debounce ref to batch rapid changes.
  const emitDebounce = useRef(null);

  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    if (suppressRef.current) return; // remote update — don't echo
    clearTimeout(emitDebounce.current);
    emitDebounce.current = setTimeout(() => {
      setNodes(nds => { emitNodes(nds); return nds; });
    }, 40);
  }, [onNodesChange, emitNodes, suppressRef]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    if (suppressRef.current) return;
    clearTimeout(emitDebounce.current);
    emitDebounce.current = setTimeout(() => {
      setEdges(eds => { emitEdges(eds); return eds; });
    }, 40);
  }, [onEdgesChange, emitEdges, suppressRef]);

  const onConnect = useCallback((params) => {
    const isLine = activeTool === "line";
    setEdges((eds) => addEdge({
      ...params,
      type: "smoothstep",
      animated: !isLine,
      style: {
        stroke: activeColor,
        strokeWidth: 2.5,
        strokeDasharray: isLine ? "8 4" : undefined,
      },
      markerEnd: isLine ? undefined : { type: "arrowclosed", color: activeColor, width: 16, height: 16 },
    }, eds));
  }, [activeTool, activeColor, setEdges]);

  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }, []);

  // Initial sizes — NodeResizer needs style.width/height to persist resize
  const INITIAL_SIZE = {
    cloud:     { width: 140, height: 90  },
    rectangle: { width: 150, height: 80  },
    circle:    { width: 100, height: 100 },
    textNode:  { width: 160, height: 44  },
    frame:     { width: 260, height: 180 },
    comment:   { width: 180, height: 80  },
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/cloudforge");
    if (!type || !rfInstance) return;
    const bounds = wrapperRef.current.getBoundingClientRect();
    const position = rfInstance.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    const comp = COMPONENTS.find((c) => c.type === type);
    const id = getId();
    const sz = INITIAL_SIZE["cloud"];
    setNodes((nds) => [...nds, {
      id, type: "cloud", position,
      style: { width: sz.width, height: sz.height },
      data: { type: comp.type, label: comp.label, icon: comp.icon, color: comp.color, cost: comp.cost },
    }]);
  }, [rfInstance, setNodes]);

  const onPaneClick = useCallback((e) => {
    if (["select","arrow","line","pencil"].includes(activeTool)) return;
    const bounds = wrapperRef.current.getBoundingClientRect();
    const position = rfInstance?.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    if (!position) return;
    const id = getId();
    const base = { label: "", color: activeColor };
    const typeMap = { rectangle:"rectangle", circle:"circle", text:"textNode", frame:"frame", comment:"comment" };
    const rfType = typeMap[activeTool];
    if (!rfType) return;
    const extra = activeTool === "frame" ? { label: "Frame" } : activeTool === "text" ? { fontSize: 14 } : {};
    const sz = INITIAL_SIZE[rfType] || { width: 160, height: 90 };
    setNodes((nds) => [...nds, {
      id, type: rfType, position,
      style: { width: sz.width, height: sz.height },
      data: { ...base, ...extra },
    }]);
    setActiveTool("select");
  }, [activeTool, activeColor, rfInstance, setNodes]);

  const onMouseDownCanvas = (e) => {
    if (activeTool !== "pencil") return;
    e.preventDefault();
    setIsDrawing(true);
    const bounds = wrapperRef.current.getBoundingClientRect();
    setPencilPath([{ x: e.clientX - bounds.left, y: e.clientY - bounds.top }]);
  };
  const onMouseMoveCanvas = (e) => {
    if (!isDrawing || activeTool !== "pencil") return;
    const bounds = wrapperRef.current.getBoundingClientRect();
    setPencilPath((p) => [...p, { x: e.clientX - bounds.left, y: e.clientY - bounds.top }]);
  };
  const onMouseUpCanvas = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (pencilPath.length > 1) {
      setPencilLines((ls) => {
        const updated = [...ls, { points: pencilPath, color: activeColor }];
        emitPencil(updated);
        return updated;
      });
    }
    setPencilPath([]);
    setActiveTool("select");
  };

  const pathToSVG = (pts) => pts.reduce((d, p, i) => d + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");

  const totalCost = nodes.filter((n) => n.type === "cloud").reduce((s, n) => s + (n.data?.cost || 0), 0);

  const handleClear = () => { setNodes([]); setEdges([]); setPencilLines([]); idCounter = 1; setDiagramName("Untitled Architecture"); };
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify({ nodes, edges, pencilLines }, null, 2)], { type: "application/json" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "stackforge.json" }).click();
  };

  // Save to MongoDB
  const handleSave = async (name, description) => {
    setSaveStatus("saving");
    try {
      const payload = { name, description, nodes, edges, pencilLines };
      if (diagramId) {
        await diagramAPI.update(diagramId, payload);
      } else {
        const { diagram } = await diagramAPI.create(payload);
        // Update URL to /canvas/:id without re-mounting
        navigate(`/canvas/${diagram._id}`, { replace: true });
      }
      setDiagramName(name);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
    setShowSaveModal(false);
  };

  const openSaveModal = () => {
    setSaveName(diagramName);
    setSaveDesc("");
    setShowSaveModal(true);
  };

  const handleExportTerraform = () => {
    const lines = ["# StackForge Terraform", `# Est. Cost: $${totalCost}/mo`, "", ...nodes.filter((n) => n.type === "cloud").map((n) => `resource "aws_${n.data.type}" "${n.id}" {\n  tags = { Name = "stackforge-${n.id}" }\n}`)].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "main.tf" }).click();
  };

  const handleScan = () => {
    setScanOpen(true);
    setIsScanning(true);
    setScanResult(null);
    // Small delay so spinner renders before heavy computation
    setTimeout(() => {
      const result = scanDiagram(nodes, edges);
      setScanResult(result);
      setIsScanning(false);
    }, 600);
  };

  const handleNewDiagram = () => {
    if (nodes.length > 0) {
      if (!window.confirm("Start a new diagram? Unsaved changes will be lost.")) return;
    }
    setNodes([]);
    setEdges([]);
    setPencilLines([]);
    setDiagramName("Untitled Architecture");
    setScanResult(null);
    setHighlightedNodes([]);
    idCounter = 1;
    navigate("/canvas", { replace: true });
  };

  const handleHighlightNodes = (nodeIds) => {
    setHighlightedNodes(nodeIds);
    // Flash highlight then clear after 3s
    setTimeout(() => setHighlightedNodes([]), 3000);
  };

  const cursorMap = { select:"default",rectangle:"crosshair",circle:"crosshair",arrow:"crosshair",line:"crosshair",pencil:"crosshair",text:"text",frame:"crosshair",comment:"crosshair" };

  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "?";

  const saveBtnClass = `cf-nav-btn-save cf-nav-btn-save-${saveStatus === "idle" ? "idle" : saveStatus}`;

  return (
    <div className="cf-canvas-wrap">

      {/* ── Top Navbar ── */}
      <nav className="cf-navbar">
        <div className="cf-navbar-left">
          <button className="cf-nav-toggle" onClick={() => setSidebarOpen((o) => !o)} title="Toggle Sidebar">
            {sidebarOpen ? "◀" : "▶"}
          </button>
          <div className="cf-nav-logo">
            <div className="cf-nav-logo-mark">☁</div>
            <span className="cf-nav-logo-name">StackForge</span>
          </div>
          <div className="cf-nav-divider" />
          <div className="cf-nav-diagram-name">
            <span>📄</span>
            <span>{diagramName || "Untitled Architecture"}</span>
          </div>
        </div>

        <div className="cf-navbar-center">
          <div className="cf-nav-cost">
            <span className="cf-nav-cost-label">EST/MO</span>
            <span className="cf-nav-cost-value">${totalCost.toLocaleString()}</span>
            <span className="cf-nav-cost-sep">·</span>
            <span className="cf-nav-cost-meta">{nodes.length} components</span>
          </div>
        </div>

        <div className="cf-navbar-right">
          <button className="cf-nav-btn-ghost" onClick={() => navigate("/diagrams")}>
            🗂 My Diagrams
          </button>
          <button className="cf-nav-btn-new" onClick={handleNewDiagram}>
            ＋ New
          </button>
          <button
            className={`cf-nav-btn-collab${collabOpen ? " cf-nav-btn-collab-active" : ""}${collabConnected && !collabOpen ? " cf-nav-btn-collab-live" : ""}`}
            onClick={() => {
              setCollabOpen(o => !o);
              if (scanOpen) setScanOpen(false); // close scan when opening collab
            }}
            title="Collaborate"
          >
            👥 Collaborate
            {presence.length > 0 && (
              <span className="cf-nav-collab-badge">{presence.length + 1}</span>
            )}
          </button>
          <button
            className={`cf-nav-btn-scan${scanOpen ? " cf-nav-btn-scan-active" : ""}${scanResult && !scanOpen ? (scanResult.summary.errors > 0 ? " cf-nav-btn-scan-error" : scanResult.summary.warnings > 0 ? " cf-nav-btn-scan-warn" : " cf-nav-btn-scan-pass") : ""}`}
            onClick={() => {
              if (scanOpen) {
                setScanOpen(false); // close if already open
              } else {
                handleScan(); // open and run scan
              }
            }}
          >
            🔍 Scan
            {scanResult && !scanOpen && scanResult.summary.errors > 0 && (
              <span className="cf-nav-scan-badge cf-nav-scan-badge-error">{scanResult.summary.errors}</span>
            )}
            {scanResult && !scanOpen && scanResult.summary.errors === 0 && scanResult.summary.warnings > 0 && (
              <span className="cf-nav-scan-badge cf-nav-scan-badge-warn">{scanResult.summary.warnings}</span>
            )}
            {scanResult && !scanOpen && scanResult.summary.errors === 0 && scanResult.summary.warnings === 0 && scanResult.summary.total === 0 && (
              <span className="cf-nav-scan-badge cf-nav-scan-badge-pass">✓</span>
            )}
          </button>
          <button
            className={saveBtnClass}
            onClick={openSaveModal}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving" && <span>⏳</span>}
            {saveStatus === "saved"  && <span>✓</span>}
            {saveStatus === "error"  && <span>✗</span>}
            {saveStatus === "idle"   && <span>💾</span>}
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Failed" : "Save Diagram"}
          </button>
          <div className="cf-nav-divider" />
          <div className="cf-nav-avatar">{initials}</div>
          <span className="cf-nav-username">{user?.firstName}</span>
          <button className="cf-nav-btn-logout" onClick={() => { logout(); navigate("/login"); }}>
            Log Out
          </button>
        </div>
      </nav>

      {/* ── Main area ── */}
      <div className="cf-main">
        {sidebarOpen && (
          <Sidebar
            totalCost={totalCost}
            nodeCount={nodes.length}
            edgeCount={edges.length}
            onClear={handleClear}
            onExportJSON={handleExportJSON}
            onExportTerraform={handleExportTerraform}
            onSave={openSaveModal}
            saveStatus={saveStatus}
            diagramName={diagramName}
            user={user}
            onLogout={() => { logout(); navigate("/login"); }}
            onMyDiagrams={() => navigate("/diagrams")}
          />
        )}

        {/* ── Save Modal ── */}
        {showSaveModal && (
          <div className="cf-modal-overlay" onClick={() => setShowSaveModal(false)}>
            <div className="cf-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cf-modal-title">Save Diagram</div>
              <div className="cf-modal-sub">Give your architecture a name before saving.</div>
              <div className="cf-modal-fields">
                <div>
                  <label className="cf-modal-label">DIAGRAM NAME</label>
                  <input
                    className="cf-modal-input"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="e.g. Production Architecture"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleSave(saveName, saveDesc); }}
                  />
                </div>
                <div>
                  <label className="cf-modal-label">DESCRIPTION (optional)</label>
                  <input
                    className="cf-modal-input"
                    value={saveDesc}
                    onChange={(e) => setSaveDesc(e.target.value)}
                    placeholder="Brief description..."
                  />
                </div>
                <div className="cf-modal-actions">
                  <button
                    className="cf-modal-btn-save"
                    onClick={() => handleSave(saveName || "Untitled Architecture", saveDesc)}
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? "Saving..." : "💾 Save"}
                  </button>
                  <button className="cf-modal-btn-cancel" onClick={() => setShowSaveModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Canvas pane ── */}
        <div
          ref={wrapperRef}
          className="cf-canvas-pane"
          style={{ cursor: cursorMap[activeTool] || "default" }}
          onMouseDown={onMouseDownCanvas}
          onMouseMove={(e) => {
            onMouseMoveCanvas(e);
            const bounds = wrapperRef.current?.getBoundingClientRect();
            if (bounds) emitCursor(e.clientX - bounds.left, e.clientY - bounds.top);
          }}
          onMouseUp={onMouseUpCanvas}
        >
          <DrawingToolbar activeTool={activeTool} onToolChange={setActiveTool} />

          {/* Color palette */}
          <div className="cf-palette">
            <span className="cf-palette-label">COLOR</span>
            {SHAPE_COLORS.map((c) => (
              <button
                key={c}
                className="cf-palette-dot"
                onClick={() => setActiveColor(c)}
                style={{
                  background: c,
                  border: activeColor === c ? "2px solid #1e293b" : "2px solid transparent",
                  boxShadow: activeColor === c ? `0 0 0 2px ${c}, 0 2px 8px ${c}66` : "none",
                  transform: activeColor === c ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>

          {/* Tool hint */}
          <div className="cf-hint-bar">
            <span className="cf-hint-tool">{activeTool.toUpperCase()}</span>
            <span className="cf-hint-sep">—</span>
            <span>{
              activeTool === "select"  ? "Click to select · Drag to move · Scroll to zoom" :
              activeTool === "pencil"  ? "Hold and drag to draw freehand" :
              activeTool === "arrow" || activeTool === "line" ? "Hover a node → grab the coloured dot → drag to another node" :
              "Click anywhere on the canvas to place"
            }</span>
          </div>

          {/* Empty state */}
          {nodes.length === 0 && pencilLines.length === 0 && (
            <div className="cf-empty-state">
              <div className="cf-empty-icon">☁</div>
              <div className="cf-empty-title">Drag components to start designing</div>
              <div className="cf-empty-hint">Shortcuts: R · O · T · F · C · D — toolbar on the left</div>
            </div>
          )}

          {/* Pencil SVG overlay */}
          <svg style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex: activeTool==="pencil" ? 15 : 5, width:"100%", height:"100%" }}>
            {pencilLines.map((line, i) => (
              <path key={i} d={pathToSVG(line.points)} stroke={line.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.9} />
            ))}
            {isDrawing && pencilPath.length > 1 && (
              <path d={pathToSVG(pencilPath)} stroke={activeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.9} />
            )}
          </svg>

          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={handleNodesChange} onEdgesChange={handleEdgesChange}
            onConnect={onConnect} onInit={setRfInstance}
            onDrop={onDrop} onDragOver={onDragOver} onPaneClick={onPaneClick}
            nodeTypes={nodeTypes} fitView
            style={{ background:"#f1f5f9" }}
            nodesDraggable={["select"].includes(activeTool)}
            panOnDrag={activeTool === "select"}
            zoomOnScroll={activeTool === "select" || activeTool === "arrow" || activeTool === "line"}
            nodesConnectable={true}
            connectOnClick={false}
            connectionRadius={30}
            defaultEdgeOptions={{
              animated: activeTool !== "line",
              style: { stroke: activeColor, strokeWidth: 2.5 },
              markerEnd: activeTool !== "line" ? { type: "arrowclosed", color: activeColor } : undefined,
            }}
            connectionLineStyle={{ stroke: activeColor, strokeWidth: 2.5 }}
            connectionLineType="smoothstep" 
          >
            <Background variant={BackgroundVariant.Dots} color="#cbd5e1" gap={24} size={1.2} />
            <Controls />
            <MiniMap
              nodeColor={(n) => n.data?.color || COLOR_MAP[n.data?.type] || "#2563eb"}
              maskColor="rgba(241,245,249,0.7)"
            />
            <Panel position="top-right">
              <div style={{
                background:"rgba(255,255,255,0.9)", backdropFilter:"blur(8px)",
                border:"1px solid #e2e8f0", borderRadius:8,
                padding:"8px 14px", fontSize:12, color:"#94a3b8",
                letterSpacing:"0.07em", display:"flex", alignItems:"center", gap:8,
                boxShadow:"0 2px 8px rgba(0,0,0,0.06)", fontFamily:"'JetBrains Mono',monospace",
              }}>
                <span style={{ color:"#2563eb" }}>☁</span>
                DRAG · SHAPE · DRAW · CONNECT · EXPORT
              </div>
            </Panel>
          </ReactFlow>

          {/* ── Scan Panel — overlays canvas ── */}
          <ScanPanel
            isOpen={scanOpen}
            onClose={() => setScanOpen(false)}
            scanResult={scanResult}
            isScanning={isScanning}
            onScan={handleScan}
            onNewDiagram={handleNewDiagram}
            onHighlightNodes={handleHighlightNodes}
            highlightedNodes={highlightedNodes}
          />

          {/* ── Collaboration Panel — overlays canvas ── */}
          <CollabPanel
            isOpen={collabOpen}
            onClose={() => setCollabOpen(false)}
            diagramId={diagramId}
            currentUser={user}
            presence={presence}
          />

          {/* ── Live cursors ── */}
          {Object.entries(cursors).map(([sid, c]) => (
            <div
              key={sid}
              className="cf-live-cursor"
              style={{ left: c.x, top: c.y }}
            >
              <svg width="16" height="20" viewBox="0 0 16 20">
                <path d="M0 0 L0 16 L4 12 L7 19 L9 18 L6 11 L11 11 Z" fill={c.color} stroke="#fff" strokeWidth="1"/>
              </svg>
              <span className="cf-cursor-label" style={{ background: c.color }}>
                {c.firstName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}