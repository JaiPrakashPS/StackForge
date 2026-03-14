import "./ComponentCard.css";

export default function ComponentCard({ comp }) {
  const onDragStart = (e) => {
    e.dataTransfer.setData("application/cloudforge", comp.type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="cf-comp-card"
      style={{ "--card-color": comp.color, "--card-border-hover": comp.color + "66" }}
    >
      <span className="cf-comp-icon">{comp.icon}</span>
      <div className="cf-comp-info">
        <div className="cf-comp-name">{comp.label}</div>
        <div className="cf-comp-meta">
          <span className="cf-comp-cost" style={{ color: comp.color }}>${comp.cost}/mo</span>
          <span className="cf-comp-sep">·</span>
          <span className="cf-comp-cat">{comp.category}</span>
        </div>
      </div>
      <div className="cf-comp-grip">
        {[0,1,2].map(i => (
          <div className="cf-comp-grip-row" key={i}>
            <div className="cf-comp-grip-dot" />
            <div className="cf-comp-grip-dot" />
          </div>
        ))}
      </div>
    </div>
  );
}