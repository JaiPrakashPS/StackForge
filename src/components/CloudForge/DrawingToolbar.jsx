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
    <div style={{
      position: "absolute",
      top: "50%",
      left: 16,
      transform: "translateY(-50%)",
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      gap: 3,
      background: "linear-gradient(180deg, #0d1929 0%, #080f1e 100%)",
      border: "1px solid #0e1f3a",
      borderRadius: 14,
      padding: "8px 6px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px #ffffff06",
    }}>
      {/* Separator after select */}
      {TOOLS.map((tool, idx) => {
        const active = activeTool === tool.id;
        return (
          <>
            {idx === 1 && (
              <div key="sep1" style={{ height: 1, background: "#0e1f3a", margin: "2px 4px" }} />
            )}
            {idx === 6 && (
              <div key="sep2" style={{ height: 1, background: "#0e1f3a", margin: "2px 4px" }} />
            )}
            <div key={tool.id} style={{ position: "relative" }}>
              <button
                onClick={() => onToolChange(tool.id)}
                title={`${tool.label}  [${tool.shortcut}]`}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  border: active ? "1px solid #1d6fff99" : "1px solid transparent",
                  background: active
                    ? "linear-gradient(135deg, #1d6fff1a, #4f46e518)"
                    : "transparent",
                  color: active ? "#60a5fa" : "#2a4a6a",
                  fontSize: tool.id === "text" ? 17 : 18,
                  fontWeight: tool.id === "text" ? 800 : 400,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.12s",
                  position: "relative",
                  boxShadow: active ? "0 0 12px #1d6fff33" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#0e1f3a";
                    e.currentTarget.style.color = "#7bafd4";
                    e.currentTarget.style.borderColor = "#0e2a4a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#2a4a6a";
                    e.currentTarget.style.borderColor = "transparent";
                  }
                }}
              >
                {tool.icon}
                {/* Shortcut badge */}
                <span style={{
                  position: "absolute",
                  bottom: 3,
                  right: 4,
                  fontSize: 8,
                  color: active ? "#1d6fff88" : "#0e1f3a",
                  fontFamily: "monospace",
                  lineHeight: 1,
                  fontWeight: 600,
                }}>
                  {tool.shortcut}
                </span>
              </button>
            </div>
          </>
        );
      })}
    </div>
  );
}