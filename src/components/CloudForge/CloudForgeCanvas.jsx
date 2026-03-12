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

const SHAPE_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#ec4899","#06b6d4"];

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

  const saveStatusStyle = {
    idle:   { bg: "linear-gradient(135deg,#1d6fff,#4f46e5)", shadow: "0 4px 16px #1d6fff44" },
    saving: { bg: "linear-gradient(135deg,#1d4fbb,#3730a3)", shadow: "none" },
    saved:  { bg: "linear-gradient(135deg,#10b981,#059669)", shadow: "0 4px 16px #10b98144" },
    error:  { bg: "linear-gradient(135deg,#ef4444,#dc2626)", shadow: "0 4px 16px #ef444444" },
  };
  const ss = saveStatusStyle[saveStatus] || saveStatusStyle.idle;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", width:"100vw", background:"#03070f", fontFamily:"'JetBrains Mono','Fira Code',monospace", overflow:"hidden" }}>

      {/* ══════════════════════════════════════════════════════
          TOP NAVBAR — always visible, never hidden
      ══════════════════════════════════════════════════════ */}
      <div style={{
        height: 54,
        background: "#080f1eee",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #0e1f3a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        flexShrink: 0,
        zIndex: 100,
        gap: 12,
      }}>

        {/* LEFT — logo + sidebar toggle */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            title="Toggle Sidebar"
            style={{
              width:32, height:32, borderRadius:7,
              background:"transparent", border:"1px solid #0e1f3a",
              color:"#3a5a80", cursor:"pointer", fontSize:16,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#1d6fff55"; e.currentTarget.style.color="#7bafd4"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#0e1f3a"; e.currentTarget.style.color="#3a5a80"; }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{
              width:28, height:28, borderRadius:7,
              background:"linear-gradient(135deg,#1d6fff,#6366f1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:14, boxShadow:"0 0 12px #1d6fff44",
            }}>☁</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:"#e2eaf4", letterSpacing:"-0.3px" }}>
              CloudForge
            </span>
          </div>

          {/* Divider */}
          <div style={{ width:1, height:20, background:"#0e1f3a" }} />

          {/* Diagram name pill */}
          <div style={{
            display:"flex", alignItems:"center", gap:6,
            background:"#0e1f3a55", border:"1px solid #0e1f3a",
            borderRadius:6, padding:"4px 10px",
            fontSize:12, color:"#3a5a80", maxWidth:220,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>
            <span>📄</span>
            <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>
              {diagramName || "Untitled Architecture"}
            </span>
          </div>
        </div>

        {/* CENTER — cost indicator */}
        <div style={{
          display:"flex", alignItems:"center", gap:6,
          background:"#052e1622", border:"1px solid #10b98122",
          borderRadius:8, padding:"5px 14px",
        }}>
          <span style={{ fontSize:11, color:"#1e5c3a" }}>EST/MO</span>
          <span style={{ fontSize:14, fontWeight:800, color:"#10b981" }}>${totalCost.toLocaleString()}</span>
          <span style={{ fontSize:11, color:"#1e3a2d" }}>·</span>
          <span style={{ fontSize:11, color:"#1e5c3a" }}>{nodes.length} components</span>
        </div>

        {/* RIGHT — My Diagrams + Save + User */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>

          {/* My Diagrams button */}
          <button
            onClick={() => navigate("/diagrams")}
            style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"7px 14px", borderRadius:7,
              background:"transparent", border:"1px solid #0e1f3a",
              color:"#3a5a80", cursor:"pointer", fontSize:12,
              fontFamily:"'JetBrains Mono',monospace", transition:"all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#1d6fff44"; e.currentTarget.style.color="#7bafd4"; e.currentTarget.style.background="#1d6fff0a"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#0e1f3a"; e.currentTarget.style.color="#3a5a80"; e.currentTarget.style.background="transparent"; }}
          >
            🗂 My Diagrams
          </button>

          {/* SAVE BUTTON — big and obvious */}
          <button
            onClick={openSaveModal}
            disabled={saveStatus === "saving"}
            style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"8px 20px", borderRadius:7, border:"none",
              background: ss.bg,
              color:"#fff", cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
              fontSize:13, fontWeight:700,
              fontFamily:"'JetBrains Mono',monospace",
              boxShadow: ss.shadow,
              transition:"all 0.2s",
              opacity: saveStatus === "saving" ? 0.75 : 1,
              letterSpacing:"0.02em",
            }}
            onMouseEnter={e => { if (saveStatus === "idle") { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 24px #1d6fff66"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow = ss.shadow; }}
          >
            {saveStatus === "saving" && <span style={{ fontSize:12 }}>⏳</span>}
            {saveStatus === "saved"  && <span style={{ fontSize:12 }}>✓</span>}
            {saveStatus === "error"  && <span style={{ fontSize:12 }}>✗</span>}
            {saveStatus === "idle"   && <span style={{ fontSize:12 }}>💾</span>}
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Failed" : "Save Diagram"}
          </button>

          {/* Divider */}
          <div style={{ width:1, height:20, background:"#0e1f3a" }} />

          {/* User avatar + name */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{
              width:30, height:30, borderRadius:"50%",
              background:"linear-gradient(135deg,#1d6fff,#6366f1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:700, color:"#fff",
              boxShadow:"0 0 10px #1d6fff33", flexShrink:0,
            }}>
              {initials}
            </div>
            <span style={{ fontSize:12, color:"#2a4a6a" }}>
              {user?.firstName}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate("/login"); }}
            style={{
              padding:"7px 12px", borderRadius:7,
              background:"transparent", border:"1px solid #0e1f3a",
              color:"#3a5a80", cursor:"pointer", fontSize:11,
              fontFamily:"'JetBrains Mono',monospace", transition:"all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#ef444444"; e.currentTarget.style.color="#ef4444"; e.currentTarget.style.background="#ef444410"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#0e1f3a"; e.currentTarget.style.color="#3a5a80"; e.currentTarget.style.background="transparent"; }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* ── Main canvas area (sidebar + canvas side by side) ── */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
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
        <div style={{
          position:"fixed", inset:0, background:"#03070fcc", backdropFilter:"blur(8px)",
          zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",
        }} onClick={() => setShowSaveModal(false)}>
          <div style={{
            background:"#080f1e", border:"1px solid #0e1f3a", borderRadius:16,
            padding:32, width:440, maxWidth:"90vw",
            boxShadow:"0 24px 80px rgba(0,0,0,0.7)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:6, color:"#e2eaf4" }}>
              Save Diagram
            </div>
            <div style={{ fontSize:12, color:"#2a4a6a", marginBottom:24 }}>
              Give your architecture a name before saving.
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <div style={{ fontSize:10, color:"#1e3a5f", letterSpacing:"0.1em", marginBottom:6 }}>DIAGRAM NAME</div>
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Production Architecture"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(saveName, saveDesc); }}
                  style={{
                    width:"100%", padding:"10px 14px", borderRadius:8,
                    background:"#03070f", border:"1px solid #0e1f3a", color:"#e2eaf4",
                    fontFamily:"'JetBrains Mono',monospace", fontSize:13, outline:"none",
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize:10, color:"#1e3a5f", letterSpacing:"0.1em", marginBottom:6 }}>DESCRIPTION (optional)</div>
                <input
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  placeholder="Brief description..."
                  style={{
                    width:"100%", padding:"10px 14px", borderRadius:8,
                    background:"#03070f", border:"1px solid #0e1f3a", color:"#e2eaf4",
                    fontFamily:"'JetBrains Mono',monospace", fontSize:13, outline:"none",
                  }}
                />
              </div>
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button
                  onClick={() => handleSave(saveName || "Untitled Architecture", saveDesc)}
                  disabled={saveStatus === "saving"}
                  style={{
                    flex:1, padding:"11px", borderRadius:8, border:"none",
                    background:"linear-gradient(135deg,#1d6fff,#4f46e5)",
                    color:"#fff", fontSize:13, fontWeight:700,
                    fontFamily:"'JetBrains Mono',monospace", cursor:"pointer",
                    boxShadow:"0 4px 16px #1d6fff33", opacity: saveStatus === "saving" ? 0.7 : 1,
                  }}
                >
                  {saveStatus === "saving" ? "Saving..." : "💾 Save"}
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  style={{
                    padding:"11px 20px", borderRadius:8, border:"1px solid #0e1f3a",
                    background:"transparent", color:"#3a5a80", fontSize:13,
                    fontFamily:"'JetBrains Mono',monospace", cursor:"pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={wrapperRef} style={{ flex:1, position:"relative", cursor: cursorMap[activeTool] || "default" }}
        onMouseDown={onMouseDownCanvas} onMouseMove={onMouseMoveCanvas} onMouseUp={onMouseUpCanvas}>

        <DrawingToolbar activeTool={activeTool} onToolChange={setActiveTool} />

        {/* Color palette */}
        <div style={{
          position:"absolute", bottom:88, left:"50%", transform:"translateX(-50%)",
          zIndex:20, display:"flex", gap:8, alignItems:"center",
          background:"#080f1e", border:"1px solid #0e1f3a",
          borderRadius:40, padding:"8px 18px",
          boxShadow:"0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px #ffffff06",
        }}>
          <span style={{ fontSize:11, color:"#1e3a5f", letterSpacing:"0.1em", marginRight:4 }}>COLOR</span>
          {SHAPE_COLORS.map((c) => (
            <button key={c} onClick={() => setActiveColor(c)} style={{
              width:22, height:22, borderRadius:"50%", background:c,
              border: activeColor===c ? "2px solid #fff" : "2px solid transparent",
              cursor:"pointer",
              boxShadow: activeColor===c ? `0 0 10px ${c}, 0 0 20px ${c}66` : "none",
              transition:"all 0.15s",
              transform: activeColor===c ? "scale(1.2)" : "scale(1)",
            }} />
          ))}
        </div>

        {/* Tool hint bar */}
        <div style={{
          position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)",
          zIndex:20, background:"#080f1ecc", backdropFilter:"blur(12px)",
          border:"1px solid #0e1f3a", borderRadius:8,
          padding:"7px 18px", fontSize:12, color:"#2a4a6a",
          letterSpacing:"0.08em", pointerEvents:"none",
          display:"flex", alignItems:"center", gap:10,
          boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
        }}>
          <span style={{ color:"#1d6fff", fontWeight:700 }}>{activeTool.toUpperCase()}</span>
          <span style={{ color:"#0e1f3a" }}>—</span>
          <span>{
            activeTool==="select"   ? "Click to select · Drag to move · Scroll to zoom" :
            activeTool==="pencil"   ? "Hold and drag to draw freehand" :
            activeTool==="arrow" || activeTool==="line" ? "Drag between node handles to connect" :
            "Click anywhere on the canvas to place"
          }</span>
        </div>

        {nodes.length === 0 && pencilLines.length === 0 && (
          <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",zIndex:0,pointerEvents:"none" }}>
            <div style={{ fontSize:72, marginBottom:20, opacity:0.06, filter:"blur(1px)" }}>☁</div>
            <div style={{ color:"#0e1f3a", fontSize:16, fontWeight:700, letterSpacing:"-0.3px" }}>
              Drag components to start designing
            </div>
            <div style={{ color:"#080f1e", fontSize:12, marginTop:8, letterSpacing:"0.04em" }}>
              Shortcuts: R · O · T · F · C · D — toolbar on the left
            </div>
          </div>
        )}

        {/* Pencil SVG overlay */}
        <svg style={{ position:"absolute",inset:0,pointerEvents:"none",zIndex:activeTool==="pencil"?15:5,width:"100%",height:"100%" }}>
          {pencilLines.map((line, i) => (
            <path key={i} d={pathToSVG(line.points)} stroke={line.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
          ))}
          {isDrawing && pencilPath.length > 1 && (
            <path d={pathToSVG(pencilPath)} stroke={activeColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
          )}
        </svg>

        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onInit={setRfInstance}
          onDrop={onDrop} onDragOver={onDragOver} onPaneClick={onPaneClick}
          nodeTypes={nodeTypes} fitView
          style={{ background:"#03070f" }}
          nodesDraggable={activeTool==="select"}
          panOnDrag={activeTool==="select"}
          zoomOnScroll={activeTool==="select"||activeTool==="arrow"}
          defaultEdgeOptions={{ animated:true, style:{ stroke:"#1d6fff", strokeWidth:2.5 } }}
          connectionLineStyle={{ stroke:"#1d6fff", strokeWidth:2.5 }}
        >
          <Background variant={BackgroundVariant.Dots} color="#0e1f3a" gap={28} size={1.5} />
          <Controls style={{
            background:"#080f1e", border:"1px solid #0e1f3a",
            borderRadius:10, overflow:"hidden",
            boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
          }} />
          <MiniMap
            style={{
              background:"#080f1e", border:"1px solid #0e1f3a",
              borderRadius:10, boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
            }}
            nodeColor={(n) => n.data?.color || COLOR_MAP[n.data?.type] || "#1d6fff"}
            maskColor="#03070faa"
          />
          <Panel position="top-right">
            <div style={{
              background:"#080f1ecc", backdropFilter:"blur(12px)",
              border:"1px solid #0e1f3a", borderRadius:8,
              padding:"10px 16px", fontSize:12, color:"#1e3a5f",
              letterSpacing:"0.08em", display:"flex", alignItems:"center", gap:8,
              boxShadow:"0 4px 16px rgba(0,0,0,0.4)",
            }}>
              <span style={{ color:"#1d6fff" }}>☁</span>
              DRAG · SHAPE · DRAW · CONNECT · EXPORT
            </div>
          </Panel>
        </ReactFlow>
      </div>
      </div>  {/* end main canvas area */}
    </div>
  );
}