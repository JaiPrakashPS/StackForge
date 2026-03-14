import "./DrawingToolbar.css";

const TOOLS = [
  { id: "select",    icon: "↖",  label: "Select",    shortcut: "S" },
  { id: "rectangle", icon: "□",  label: "Rectangle", shortcut: "R" },
  { id: "circle",    icon: "○",  label: "Circle",    shortcut: "O" },
  { id: "arrow",     icon: "↗",  label: "Arrow",     shortcut: "A" },
  { id: "line",      icon: "╱",  label: "Line",      shortcut: "L" },
  { id: "pencil",    icon: "✏",  label: "Draw",      shortcut: "D" },
  { id: "text",      icon: "T",  label: "Text",      shortcut: "T" },
  { id: "frame",     icon: "⬚",  label: "Frame",     shortcut: "F" },
  { id: "comment",   icon: "💬", label: "Comment",   shortcut: "C" },
];

export { TOOLS };

export default function DrawingToolbar({ activeTool, onToolChange }) {
  return (
    <div className="cf-toolbar">
      {TOOLS.map((tool, idx) => {
        const active = activeTool === tool.id;
        return (
          <>
            {idx === 1 && <div key="sep1" className="cf-toolbar-sep" />}
            {idx === 6 && <div key="sep2" className="cf-toolbar-sep" />}
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              title={`${tool.label}  [${tool.shortcut}]`}
              className={`cf-tool-btn${active ? " cf-tool-btn-active" : ""}${tool.id === "text" ? " cf-tool-btn-text" : ""}`}
            >
              {tool.icon}
              <span className="cf-tool-shortcut">{tool.shortcut}</span>
            </button>
          </>
        );
      })}
    </div>
  );
}