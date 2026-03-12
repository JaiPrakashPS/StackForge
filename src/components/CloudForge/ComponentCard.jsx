export default function ComponentCard({ comp }) {
  const onDragStart = (e) => {
    e.dataTransfer.setData("application/cloudforge", comp.type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 10,
        cursor: "grab",
        background: "#080f1e",
        border: `1px solid ${comp.color}1a`,
        transition: "all 0.15s",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${comp.color}0f`;
        e.currentTarget.style.borderColor = `${comp.color}66`;
        e.currentTarget.style.transform = "translateX(4px)";
        e.currentTarget.style.boxShadow = `0 4px 16px ${comp.color}18`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#080f1e";
        e.currentTarget.style.borderColor = `${comp.color}1a`;
        e.currentTarget.style.transform = "translateX(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Left color accent bar */}
      <div style={{
        position: "absolute", left: 0, top: "20%", bottom: "20%",
        width: 3, borderRadius: 2,
        background: comp.color,
        opacity: 0.7,
      }} />

      {/* Icon */}
      <span style={{
        fontSize: 22,
        flexShrink: 0,
        marginLeft: 6,
        filter: `drop-shadow(0 0 6px ${comp.color}66)`,
      }}>
        {comp.icon}
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: "#c8d8e8",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.01em",
          marginBottom: 3,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {comp.label}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            color: comp.color,
            fontSize: 11,
            fontWeight: 600,
            opacity: 0.9,
          }}>
            ${comp.cost}/mo
          </span>
          <span style={{ color: "#1e3a5f", fontSize: 11 }}>·</span>
          <span style={{ color: "#2a4a6a", fontSize: 11 }}>{comp.category}</span>
        </div>
      </div>

      {/* Drag indicator */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 3,
        opacity: 0.25, flexShrink: 0,
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            display: "flex", gap: 3,
          }}>
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#64748b" }} />
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#64748b" }} />
          </div>
        ))}
      </div>
    </div>
  );
}