import { Handle, Position, NodeResizer } from "reactflow";

export default function CloudNode({ id, data, selected }) {
  const color = data.color || "#3b82f6";

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={180}
        minHeight={110}
        handleStyle={{
          width: 12,
          height: 12,
          borderRadius: 4,
          background: "#0f172a",
          border: `2px solid ${color}`,
          boxShadow: `0 0 6px ${color}88`,
        }}
        lineStyle={{
          borderColor: `${color}99`,
          borderWidth: 1.5,
        }}
      />

      <div style={{
        width: "100%",
        height: "100%",
        minWidth: 180,
        minHeight: 110,
        background: "linear-gradient(145deg, #0f172a 0%, #1a2744 60%, #1e293b 100%)",
        border: `2px solid ${selected ? "#ffffff" : color}`,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "18px 22px",
        boxShadow: selected
          ? `0 0 0 3px ${color}55, 0 0 40px ${color}44, 0 12px 40px rgba(0,0,0,0.7)`
          : `0 0 24px ${color}33, 0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 #ffffff08`,
        cursor: "grab",
        position: "relative",
        transition: "border 0.15s ease, box-shadow 0.15s ease",
        userSelect: "none",
        overflow: "hidden",
      }}>

        {/* Top shimmer line */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%",
          height: 1,
          background: `linear-gradient(90deg, transparent, ${color}66, transparent)`,
        }} />

        {/* Connection handles */}
        <Handle type="target" position={Position.Top}    style={handleStyle(color)} />
        <Handle type="target" position={Position.Left}   style={handleStyle(color)} />
        <Handle type="source" position={Position.Bottom} style={handleStyle(color)} />
        <Handle type="source" position={Position.Right}  style={handleStyle(color)} />

        {/* Icon */}
        <div style={{
          fontSize: 36,
          lineHeight: 1,
          filter: `drop-shadow(0 0 8px ${color}66)`,
          flexShrink: 0,
        }}>
          {data.icon}
        </div>

        {/* Label */}
        <div style={{
          color: "#f1f5f9",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 13,
          textAlign: "center",
          fontWeight: 700,
          letterSpacing: "0.03em",
          wordBreak: "break-word",
          lineHeight: 1.3,
        }}>
          {data.label}
        </div>

        {/* Cost badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: `${color}18`,
          border: `1px solid ${color}44`,
          borderRadius: 20,
          padding: "3px 10px",
          color: color,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          flexShrink: 0,
        }}>
          ${data.cost}/mo
        </div>

        {/* Glow dot */}
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: color, borderRadius: "50%",
          width: 7, height: 7,
          boxShadow: `0 0 6px ${color}, 0 0 12px ${color}88`,
        }} />
      </div>
    </>
  );
}

function handleStyle(color) {
  return {
    background: color,
    border: "2px solid #0a0f1e",
    width: 12,
    height: 12,
    borderRadius: "50%",
    boxShadow: `0 0 6px ${color}88`,
  };
}