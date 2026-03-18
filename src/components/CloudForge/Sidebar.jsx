import { useState, useMemo } from "react";
import { COMPONENTS } from "./constants";
import ComponentCard from "./ComponentCard";
import "./Sidebar.css";

const CATEGORIES = ["All", ...new Set(COMPONENTS.map((c) => c.category))];

export default function Sidebar({ totalCost, nodeCount, edgeCount, onClear, onExportJSON, onExportTerraform, onSave, saveStatus, diagramName }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = selectedCategory === "All"
      ? COMPONENTS
      : COMPONENTS.filter((c) => c.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    return list;
  }, [selectedCategory, search]);

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

      {/* ── Search ── */}
      <div className="cf-sb-search-wrap">
        <span className="cf-sb-search-icon">🔍</span>
        <input
          className="cf-sb-search"
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="cf-sb-search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {/* ── Filter ── */}
      <div className="cf-sb-filter">
        <span className="cf-sb-label">CATEGORY</span>
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
        <span className="cf-sb-label">
          DRAG TO CANVAS
          <span className="cf-sb-count">{filtered.length}</span>
        </span>
        <div className="cf-sb-list">
          {filtered.length > 0
            ? filtered.map((comp) => <ComponentCard key={comp.type} comp={comp} />)
            : (
              <div className="cf-sb-empty">
                No components match "{search}"
              </div>
            )
          }
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