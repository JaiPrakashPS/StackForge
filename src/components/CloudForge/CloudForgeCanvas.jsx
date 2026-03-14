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
} from "reactflow";
import "reactflow/dist/style.css";

import CloudNode from "./CloudNode";
import Sidebar from "./Sidebar";
import DrawingToolbar from "./DrawingToolbar";
import { RectangleNode, CircleNode, TextNode, FrameNode, CommentNode } from "./ShapeNodes";
import { COMPONENTS, COLOR_MAP } from "./constants";
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

export default function CloudForgeCanvas() {
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

  // Keyboard shortcuts
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

  const onConnect = useCallback((params) => {
    const isLine = activeTool === "line";
    setEdges((eds) => addEdge({
      ...params,
      animated: !isLine,
      style: { stroke: activeColor, strokeWidth: 2, strokeDasharray: isLine ? "6 3" : "none" },
      markerEnd: isLine ? undefined : { type: "arrowclosed", color: activeColor },
    }, eds));
  }, [activeTool, activeColor, setEdges]);

  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }, []);

  // Initial sizes — NodeResizer needs style.width/height to persist resize
  const INITIAL_SIZE = {
    cloud:     { width: 180, height: 120 },
    rectangle: { width: 200, height: 110 },
    circle:    { width: 140, height: 140 },
    textNode:  { width: 200, height: 60  },
    frame:     { width: 340, height: 220 },
    comment:   { width: 220, height: 110 },
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
    if (pencilPath.length > 1) setPencilLines((ls) => [...ls, { points: pencilPath, color: activeColor }]);
    setPencilPath([]);
    setActiveTool("select");
  };

  const pathToSVG = (pts) => pts.reduce((d, p, i) => d + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");

  const totalCost = nodes.filter((n) => n.type === "cloud").reduce((s, n) => s + (n.data?.cost || 0), 0);

  const handleClear = () => { setNodes([]); setEdges([]); setPencilLines([]); idCounter = 1; setDiagramName("Untitled Architecture"); };
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify({ nodes, edges, pencilLines }, null, 2)], { type: "application/json" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "cloudforge.json" }).click();
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
    const lines = ["# CloudForge Terraform", `# Est. Cost: $${totalCost}/mo`, "", ...nodes.filter((n) => n.type === "cloud").map((n) => `resource "aws_${n.data.type}" "${n.id}" {\n  tags = { Name = "cloudforge-${n.id}" }\n}`)].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "main.tf" }).click();
  };

  const cursorMap = { select:"default",rectangle:"crosshair",circle:"crosshair",arrow:"default",line:"default",pencil:"crosshair",text:"text",frame:"crosshair",comment:"crosshair" };

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
          onMouseMove={onMouseMoveCanvas}
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
              activeTool === "arrow" || activeTool === "line" ? "Drag between node handles to connect" :
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
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onInit={setRfInstance}
            onDrop={onDrop} onDragOver={onDragOver} onPaneClick={onPaneClick}
            nodeTypes={nodeTypes} fitView
            style={{ background:"#f1f5f9" }}
            nodesDraggable={activeTool === "select"}
            panOnDrag={activeTool === "select"}
            zoomOnScroll={activeTool === "select" || activeTool === "arrow"}
            defaultEdgeOptions={{ animated:true, style:{ stroke:"#2563eb", strokeWidth:2 } }}
            connectionLineStyle={{ stroke:"#2563eb", strokeWidth:2 }}
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
        </div>
      </div>
    </div>
  );
}