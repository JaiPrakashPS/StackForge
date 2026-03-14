import { Handle, Position, NodeResizer } from "reactflow";
import "./CloudNode.css";

export default function CloudNode({ data, selected }) {
  const color = data.color || "#2563eb";

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={180} minHeight={110}
        handleStyle={{ width:11, height:11, borderRadius:4, background:"#fff", border:`2px solid ${color}`, boxShadow:`0 0 4px ${color}55` }}
        lineStyle={{ borderColor:`${color}66`, borderWidth:1.5 }}
      />
      <div
        className="cf-cloud-node"
        style={{
          border: `1.5px solid ${selected ? color : "#e2e8f0"}`,
          boxShadow: selected
            ? `0 0 0 3px ${color}22, 0 8px 24px ${color}18, 0 4px 12px rgba(0,0,0,0.08)`
            : `0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)`,
        }}
      >
        {/* Top accent line */}
        <div className="cf-cloud-node-shimmer" style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />

        <Handle type="target" position={Position.Top}    style={hs(color)} />
        <Handle type="target" position={Position.Left}   style={hs(color)} />
        <Handle type="source" position={Position.Bottom} style={hs(color)} />
        <Handle type="source" position={Position.Right}  style={hs(color)} />

        <div className="cf-cloud-node-icon">{data.icon}</div>

        <div className="cf-cloud-node-label">{data.label}</div>

        <div className="cf-cloud-node-cost" style={{ background:`${color}12`, border:`1px solid ${color}33`, color }}>
          ${data.cost}/mo
        </div>

        <div className="cf-cloud-node-dot" style={{ background: color, boxShadow:`0 0 5px ${color}` }} />
      </div>
    </>
  );
}

function hs(color) {
  return { background: color, border: "2px solid #fff", width:12, height:12, borderRadius:"50%", boxShadow:`0 0 0 1.5px ${color}44` };
}