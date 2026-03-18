import { Handle, Position, NodeResizer } from "reactflow";
import "./CloudNode.css";

export default function CloudNode({ data, selected }) {
  const color = data.color || "#2563eb";

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={70}
        handleStyle={{
          width: 10, height: 10, borderRadius: 3,
          background: "#fff",
          border: `2px solid ${color}`,
          boxShadow: `0 0 0 1px ${color}`,
        }}
        lineStyle={{ borderColor: color, borderWidth: 1.5, borderStyle: "dashed" }}
      />
      <div
        className="cf-cloud-node"
        style={{
          border: `1.5px solid ${selected ? color : "#e2e8f0"}`,
          boxShadow: selected
            ? `0 0 0 2px ${color}30, 0 4px 16px ${color}15`
            : `0 1px 4px rgba(0,0,0,0.08)`,
        }}
      >
        <div className="cf-cloud-node-shimmer" style={{ background: color }} />

        <Handle type="target" position={Position.Top}    style={hs(color)} />
        <Handle type="target" position={Position.Left}   style={hs(color)} />
        <Handle type="source" position={Position.Bottom} style={hs(color)} />
        <Handle type="source" position={Position.Right}  style={hs(color)} />

        <div className="cf-cloud-node-icon">{data.icon}</div>
        <div className="cf-cloud-node-label">{data.label}</div>
        <div className="cf-cloud-node-cost" style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
          ${data.cost}/mo
        </div>
        <div className="cf-cloud-node-dot" style={{ background: color }} />
      </div>
    </>
  );
}

function hs(color) {
  return {
    background: color,
    border: "2px solid #fff",
    width: 10, height: 10,
    borderRadius: "50%",
    boxShadow: `0 0 0 1px ${color}`,
  };
}