import { useState } from "react";
import { COMPONENTS } from "./constants";
import ComponentCard from "./ComponentCard";
import "./Sidebar.css";

const CATEGORIES = ["All", ...new Set(COMPONENTS.map((c) => c.category))];

export default function Sidebar({ totalCost, nodeCount, edgeCount, onClear, onExportJSON, onExportTerraform, onSave, saveStatus, diagramName }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filtered = selectedCategory === "All" ? COMPONENTS : COMPONENTS.filter((c) => c.category === selectedCategory);

  return (
    <div className="cf-sidebar">

      {/* ── Header ── */}
      <div className="cf-sb-header">
        <div className="cf-sb-logo-row">
          <div className="cf-sb-logo-mark">☁</div>
          <div>
            <div className="cf-sb-logo-name">StackForge</div>
            <div className="cf-sb-logo-sub">ARCHITECTURE DESIGNER</div>
          </div>
        </div>
        <div className="cf-sb-diagram-name">📄 {diagramName || "Untitled Architecture"}</div>
      </div>

      {/* ── Cost ── */}
      <div className="cf-sb-cost">
        <div className="cf-sb-cost-label">ESTIMATED MONTHLY COST</div>
        <div className="cf-sb-cost-value">${totalCost.toLocaleString()}</div>
        <div className="cf-sb-cost-meta">
          <span>{nodeCount} components</span>
          <span className="cf-sb-cost-sep">·</span>
          <span>{edgeCount} connections</span>
        </div>
      </div>

      {/* ── Filter ── */}
      <div className="cf-sb-filter">
        <span className="cf-sb-label">FILTER BY CATEGORY</span>
        <div className="cf-sb-filter-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`cf-sb-pill${selectedCategory === cat ? " cf-sb-pill-active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="cf-sb-divider" />

      {/* ── Components ── */}
      <div className="cf-sb-components">
        <span className="cf-sb-label">DRAG TO CANVAS</span>
        <div className="cf-sb-list">
          {filtered.map((comp) => <ComponentCard key={comp.type} comp={comp} />)}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="cf-sb-actions">
        <button className="cf-sb-action-btn cf-sb-btn-terraform" onClick={onExportTerraform}>
          ⬇ Export Terraform
        </button>
        <button className="cf-sb-action-btn cf-sb-btn-json" onClick={onExportJSON}>
          {"{ }"} Export JSON
        </button>
        <button className="cf-sb-action-btn cf-sb-btn-clear" onClick={onClear}>
          🗑 Clear Canvas
        </button>
      </div>
    </div>
  );
}