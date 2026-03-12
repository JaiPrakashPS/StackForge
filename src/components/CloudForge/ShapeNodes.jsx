import { useState, useRef, useEffect } from "react";
import { Handle, Position, useReactFlow, NodeResizer } from "reactflow";

// ── Shared resize handle styles ───────────────────────────────────────────────
function resizerProps(color, selected) {
  return {
    isVisible: selected,
    minWidth: 80,
    minHeight: 60,
    handleStyle: {
      width: 10, height: 10, borderRadius: 3,
      background: "#0f172a",
      border: `2px solid ${color}`,
    },
    lineStyle: {
      borderColor: `${color}66`,
      borderWidth: 1,
    },
  };
}

function handleStyle(color) {
  return { background: color, border: "2px solid #0f172a", width: 8, height: 8 };
}

// ── Inline editable label ─────────────────────────────────────────────────────
function EditableLabel({ nodeId, value, color, fontSize = 13, placeholder = "Type here..." }) {
  const { setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value || "");
  const textareaRef           = useRef(null);

  useEffect(() => { setDraft(value || ""); }, [value]);
  useEffect(() => {
    if (editing) { textareaRef.current?.focus(); textareaRef.current?.select(); }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    setNodes((nds) =>
      nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, label: draft } } : n)
    );
  };

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Escape") commit(); }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%", flex: 1,
          background: "transparent", border: "none", outline: "none",
          color: color || "#f1f5f9", fontSize,
          fontFamily: "'JetBrains Mono', monospace",
          resize: "none", textAlign: "center",
          cursor: "text", lineHeight: 1.5,
          padding: "2px 4px", caretColor: color || "#f1f5f9",
        }}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      style={{
        color: draft ? (color || "#f1f5f9") : "#334155",
        fontSize, fontFamily: "'JetBrains Mono', monospace",
        textAlign: "center", cursor: "text",
        minHeight: 22, lineHeight: 1.5,
        wordBreak: "break-word", whiteSpace: "pre-wrap",
        userSelect: "none", padding: "2px 4px", width: "100%",
      }}
      title="Double-click to edit"
    >
      {draft || <span style={{ opacity: 0.35 }}>{placeholder}</span>}
    </div>
  );
}

// ── Rectangle ─────────────────────────────────────────────────────────────────
export function RectangleNode({ id, data, selected }) {
  const color = data.color || "#3b82f6";
  return (
    <>
      <NodeResizer {...resizerProps(color, selected)} minWidth={100} minHeight={60} />
      <div style={{
        width: "100%", height: "100%",
        background: `${color}11`,
        border: `2px solid ${selected ? "#fff" : color}`,
        borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "10px 14px",
        boxShadow: selected ? `0 0 0 2px ${color}55` : `0 2px 12px ${color}22`,
        transition: "border 0.15s, box-shadow 0.15s",
        position: "relative", overflow: "hidden",
      }}>
        <Handle type="target" position={Position.Top}    style={handleStyle(color)} />
        <Handle type="target" position={Position.Left}   style={handleStyle(color)} />
        <Handle type="source" position={Position.Bottom} style={handleStyle(color)} />
        <Handle type="source" position={Position.Right}  style={handleStyle(color)} />
        <EditableLabel nodeId={id} value={data.label} color={color} placeholder="Label..." />
      </div>
    </>
  );
}

// ── Circle ────────────────────────────────────────────────────────────────────
export function CircleNode({ id, data, selected }) {
  const color = data.color || "#8b5cf6";
  return (
    <>
      <NodeResizer {...resizerProps(color, selected)} minWidth={80} minHeight={80} />
      <div style={{
        width: "100%", height: "100%",
        borderRadius: "50%",
        background: `${color}11`,
        border: `2px solid ${selected ? "#fff" : color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: selected ? `0 0 0 2px ${color}55` : `0 2px 12px ${color}22`,
        transition: "border 0.15s, box-shadow 0.15s",
        position: "relative", overflow: "hidden",
      }}>
        <Handle type="target" position={Position.Top}    style={handleStyle(color)} />
        <Handle type="target" position={Position.Left}   style={handleStyle(color)} />
        <Handle type="source" position={Position.Bottom} style={handleStyle(color)} />
        <Handle type="source" position={Position.Right}  style={handleStyle(color)} />
        <EditableLabel nodeId={id} value={data.label} color={color} fontSize={11} placeholder="Label..." />
      </div>
    </>
  );
}

// ── Text ──────────────────────────────────────────────────────────────────────
export function TextNode({ id, data, selected }) {
  const color = data.color || "#f1f5f9";
  return (
    <>
      <NodeResizer {...resizerProps("#3b82f6", selected)} minWidth={80} minHeight={30} />
      <div style={{
        width: "100%", height: "100%",
        border: selected ? "1px dashed #3b82f666" : "1px dashed transparent",
        borderRadius: 4, padding: "4px 8px",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "border 0.15s",
        overflow: "hidden",
      }}>
        <EditableLabel
          nodeId={id} value={data.label} color={color}
          fontSize={data.fontSize || 14}
          placeholder="Double-click to type..."
        />
      </div>
    </>
  );
}

// ── Frame ─────────────────────────────────────────────────────────────────────
export function FrameNode({ id, data, selected }) {
  const color = data.color || "#475569";
  return (
    <>
      <NodeResizer {...resizerProps(color, selected)} minWidth={160} minHeight={120} />
      <div style={{
        width: "100%", height: "100%",
        border: `2px dashed ${selected ? "#94a3b8" : color}`,
        borderRadius: 10,
        background: `${color}08`,
        position: "relative",
        padding: "28px 12px 12px",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: `${color}22`,
          borderRadius: "8px 8px 0 0",
          padding: "3px 12px",
          borderBottom: `1px solid ${color}44`,
        }}>
          <EditableLabel nodeId={id} value={data.label} color={color} fontSize={11} placeholder="Frame name" />
        </div>
        <Handle type="target" position={Position.Top}    style={handleStyle(color)} />
        <Handle type="target" position={Position.Left}   style={handleStyle(color)} />
        <Handle type="source" position={Position.Bottom} style={handleStyle(color)} />
        <Handle type="source" position={Position.Right}  style={handleStyle(color)} />
      </div>
    </>
  );
}

// ── Comment ───────────────────────────────────────────────────────────────────
export function CommentNode({ id, data, selected }) {
  const color = "#fbbf24";
  return (
    <>
      <NodeResizer {...resizerProps(color, selected)} minWidth={120} minHeight={70} />
      <div style={{
        width: "100%", height: "100%",
        background: "#fbbf2415",
        border: `2px solid ${selected ? "#fde68a" : color}`,
        borderRadius: "8px 8px 8px 0px",
        padding: "8px 12px 10px",
        position: "relative",
        boxShadow: selected ? `0 0 0 2px ${color}44` : `0 2px 12px ${color}22`,
        transition: "border 0.15s, box-shadow 0.15s",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", bottom: -10, left: 0,
          width: 0, height: 0,
          borderLeft: "10px solid transparent",
          borderTop: `10px solid ${color}`,
        }} />
        <div style={{ fontSize: 9, color: "#fbbf24", marginBottom: 4, opacity: 0.5, letterSpacing: "0.08em", flexShrink: 0 }}>
          💬 COMMENT
        </div>
        <EditableLabel nodeId={id} value={data.label} color="#fde68a" fontSize={11} placeholder="Add a comment..." />
        <Handle type="source" position={Position.Right} style={handleStyle(color)} />
      </div>
    </>
  );
}