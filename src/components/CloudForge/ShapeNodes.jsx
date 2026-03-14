import { useState, useRef, useEffect } from "react";
import { Handle, Position, useReactFlow, NodeResizer } from "reactflow";
import "./ShapeNodes.css";

function resizerProps(color, selected, minW=80, minH=60) {
  return {
    isVisible: selected, minWidth: minW, minHeight: minH,
    handleStyle: { width:10, height:10, borderRadius:3, background:"#fff", border:`2px solid ${color}` },
    lineStyle: { borderColor:`${color}55`, borderWidth:1.5 },
  };
}
function hs(color) {
  return { background: color, border:"2px solid #fff", width:10, height:10, borderRadius:"50%", boxShadow:`0 0 0 1.5px ${color}44` };
}

function EditableLabel({ nodeId, value, color, fontSize=13, placeholder="Type here..." }) {
  const { setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value || "");
  const ref = useRef(null);

  useEffect(() => { setDraft(value || ""); }, [value]);
  useEffect(() => { if (editing) { ref.current?.focus(); ref.current?.select(); } }, [editing]);

  const commit = () => {
    setEditing(false);
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, label: draft } } : n));
  };

  if (editing) {
    return (
      <textarea
        ref={ref} value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Escape") commit(); }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="cf-node-textarea"
        style={{ fontSize, color: color || "#0f172a" }}
        placeholder={placeholder}
      />
    );
  }
  return (
    <div
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      className="cf-node-label"
      style={{ fontSize, color: draft ? (color || "#334155") : "#94a3b8" }}
      title="Double-click to edit"
    >
      {draft || <span className="cf-node-placeholder">{placeholder}</span>}
    </div>
  );
}

export function RectangleNode({ id, data, selected }) {
  const color = data.color || "#3b82f6";
  return (
    <>
      <NodeResizer {...resizerProps(color, selected, 100, 60)} />
      <div className="cf-node-rect" style={{
        background: `${color}0d`, border:`2px solid ${selected?"#64748b":color}44`,
        boxShadow: selected ? `0 0 0 2px ${color}22` : `0 2px 8px ${color}10`,
      }}>
        <Handle type="target" position={Position.Top}    style={hs(color)} />
        <Handle type="target" position={Position.Left}   style={hs(color)} />
        <Handle type="source" position={Position.Bottom} style={hs(color)} />
        <Handle type="source" position={Position.Right}  style={hs(color)} />
        <EditableLabel nodeId={id} value={data.label} color={color} placeholder="Label..." />
      </div>
    </>
  );
}

export function CircleNode({ id, data, selected }) {
  const color = data.color || "#8b5cf6";
  return (
    <>
      <NodeResizer {...resizerProps(color, selected, 80, 80)} />
      <div className="cf-node-circle" style={{
        background:`${color}0d`, border:`2px solid ${selected?"#64748b":color}44`,
        boxShadow: selected ? `0 0 0 2px ${color}22` : `0 2px 8px ${color}10`,
      }}>
        <Handle type="target" position={Position.Top}    style={hs(color)} />
        <Handle type="target" position={Position.Left}   style={hs(color)} />
        <Handle type="source" position={Position.Bottom} style={hs(color)} />
        <Handle type="source" position={Position.Right}  style={hs(color)} />
        <EditableLabel nodeId={id} value={data.label} color={color} fontSize={11} placeholder="Label..." />
      </div>
    </>
  );
}

export function TextNode({ id, data, selected }) {
  const color = data.color || "#334155";
  return (
    <>
      <NodeResizer {...resizerProps("#3b82f6", selected, 80, 30)} />
      <div className="cf-node-text" style={{ border: selected ? "1.5px dashed #93c5fd" : "1.5px dashed transparent" }}>
        <EditableLabel nodeId={id} value={data.label} color={color} fontSize={data.fontSize||14} placeholder="Double-click to type..." />
      </div>
    </>
  );
}

export function FrameNode({ id, data, selected }) {
  const color = data.color || "#64748b";
  return (
    <>
      <NodeResizer {...resizerProps(color, selected, 160, 120)} />
      <div className="cf-node-frame" style={{
        border:`2px dashed ${selected?"#94a3b8":color}55`, background:`${color}06`,
      }}>
        <div className="cf-node-frame-header" style={{ background:`${color}12`, borderBottomColor:`${color}33` }}>
          <EditableLabel nodeId={id} value={data.label} color={color} fontSize={11} placeholder="Frame name" />
        </div>
        <Handle type="target" position={Position.Top}    style={hs(color)} />
        <Handle type="target" position={Position.Left}   style={hs(color)} />
        <Handle type="source" position={Position.Bottom} style={hs(color)} />
        <Handle type="source" position={Position.Right}  style={hs(color)} />
      </div>
    </>
  );
}

export function CommentNode({ id, data, selected }) {
  const color = "#f59e0b";
  return (
    <>
      <NodeResizer {...resizerProps(color, selected, 120, 70)} />
      <div className="cf-node-comment" style={{
        background:"#fffbeb", border:`2px solid ${selected?"#fbbf24":"#fde68a"}`,
        boxShadow: selected ? "0 0 0 2px #fde68a44" : "0 2px 8px #f59e0b10",
      }}>
        <div className="cf-node-comment-tail" style={{ borderTop:`10px solid #fde68a` }} />
        <div className="cf-node-comment-badge" style={{ color:"#d97706" }}>💬 COMMENT</div>
        <EditableLabel nodeId={id} value={data.label} color="#92400e" fontSize={11} placeholder="Add a comment..." />
        <Handle type="source" position={Position.Right} style={hs(color)} />
      </div>
    </>
  );
}