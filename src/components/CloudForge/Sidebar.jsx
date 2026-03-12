import { useState } from "react";
import { COMPONENTS } from "./constants";
import ComponentCard from "./ComponentCard";

const CATEGORIES = ["All", ...new Set(COMPONENTS.map((c) => c.category))];

export default function Sidebar({ totalCost, nodeCount, edgeCount, onClear, onExportJSON, onExportTerraform, onSave, saveStatus, diagramName, user, onLogout, onMyDiagrams }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = selectedCategory === "All"
    ? COMPONENTS
    : COMPONENTS.filter((c) => c.category === selectedCategory);

  return (
    <div style={{
      width: 280,
      background: "linear-gradient(180deg, #080f1e 0%, #050c18 100%)",
      borderRight: "1px solid #0e1f3a",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflowY: "auto",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    }}>

      {/* ── Logo header ── */}
      <div style={{
        padding: "16px 16px 14px",
        borderBottom: "1px solid #0e1f3a",
        background: "linear-gradient(180deg, #0d1929 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #1d6fff, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0, boxShadow: "0 0 16px #1d6fff44",
          }}>☁</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
              StackForge
            </div>
            <div style={{ color: "#1e3a5f", fontSize: 9, letterSpacing: "0.1em" }}>
              ARCHITECTURE DESIGNER
            </div>
          </div>
        </div>
        {/* Diagram name */}
        <div style={{
          fontSize: 12, color: "#3a5a80", fontWeight: 600,
          background: "#0e1f3a44", borderRadius: 6, padding: "5px 10px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          border: "1px solid #0e1f3a",
        }}>
          📄 {diagramName || "Untitled Architecture"}
        </div>

      </div>

      {/* ── Cost summary ── */}
      <div style={{
        margin: "16px 16px 10px",
        padding: "14px 16px",
        borderRadius: 12,
        background: "linear-gradient(135deg, #05210f44, #064e3b28)",
        border: "1px solid #10b98130",
      }}>
        <div style={{ color: "#1e5c3a", fontSize: 10, letterSpacing: "0.12em", marginBottom: 6 }}>
          ESTIMATED MONTHLY COST
        </div>
        <div style={{ color: "#10b981", fontSize: 30, fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>
          ${totalCost.toLocaleString()}
        </div>
        <div style={{
          display: "flex", gap: 12,
          color: "#2d5a3d", fontSize: 11,
        }}>
          <span>{nodeCount} components</span>
          <span style={{ color: "#1e3a2d" }}>·</span>
          <span>{edgeCount} connections</span>
        </div>
      </div>

      {/* ── Category filter ── */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ color: "#1e3a5f", fontSize: 10, letterSpacing: "0.12em", marginBottom: 8 }}>
          FILTER BY CATEGORY
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: active ? "#1d6fff" : "transparent",
                  color: active ? "#fff" : "#3a5a80",
                  border: active ? "1px solid #1d6fff" : "1px solid #0e1f3a",
                  transition: "all 0.15s",
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "#1d6fff66"; e.currentTarget.style.color = "#7bafd4"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#0e1f3a"; e.currentTarget.style.color = "#3a5a80"; } }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: "#0e1f3a", margin: "0 16px 12px" }} />

      {/* ── Component list ── */}
      <div style={{ padding: "0 16px", flex: 1 }}>
        <div style={{ color: "#1e3a5f", fontSize: 10, letterSpacing: "0.12em", marginBottom: 10 }}>
          DRAG TO CANVAS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((comp) => (
            <ComponentCard key={comp.type} comp={comp} />
          ))}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{
        padding: "16px",
        borderTop: "1px solid #0e1f3a",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: "linear-gradient(0deg, #050c18 0%, transparent 100%)",
      }}>
        <button
          onClick={onExportTerraform}
          style={{
            width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 12,
            background: "linear-gradient(135deg, #1d6fff, #4f46e5)",
            color: "#fff", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 700,
            letterSpacing: "0.02em",
            boxShadow: "0 4px 16px #1d6fff33",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px #1d6fff55"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px #1d6fff33"; }}
        >
          ⬇ Export Terraform
        </button>

        <button
          onClick={onExportJSON}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 12,
            background: "transparent", color: "#3a5a80",
            border: "1px solid #0e1f3a", cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1d6fff44"; e.currentTarget.style.color = "#7bafd4"; e.currentTarget.style.background = "#1d6fff0a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#0e1f3a"; e.currentTarget.style.color = "#3a5a80"; e.currentTarget.style.background = "transparent"; }}
        >
          {"{ }"} Export JSON
        </button>

        <button
          onClick={onClear}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 12,
            background: "transparent", color: "#5a2a2a",
            border: "1px solid #3a1515", cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ef444444"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#ef444410"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3a1515"; e.currentTarget.style.color = "#5a2a2a"; e.currentTarget.style.background = "transparent"; }}
        >
          🗑 Clear Canvas
        </button>
      </div>
    </div>
  );
}