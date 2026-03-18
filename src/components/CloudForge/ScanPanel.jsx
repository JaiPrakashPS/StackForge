import { useState } from "react";
import "./ScanPanel.css";

const SEV = {
  error:   { label: "ERROR",   color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "✕" },
  warning: { label: "WARNING", color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "!" },
  info:    { label: "INFO",    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: "i" },
};

// ── Score ring SVG ────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r     = 26;
  const circ  = 2 * Math.PI * r;
  const fill  = (score / 100) * circ;
  const color = score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  const label = score >= 80 ? "Great" : score >= 50 ? "Fair" : "Poor";
  return (
    <div className="sp-score-ring-wrap">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx="34" cy="34" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 34 34)"
          style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
        <text x="34" y="32" textAnchor="middle" fontSize="15" fontWeight="800" fill={color} fontFamily="Inter,sans-serif">{score}</text>
        <text x="34" y="46" textAnchor="middle" fontSize="9"  fontWeight="600" fill={color} fontFamily="Inter,sans-serif" opacity="0.8">{label}</text>
      </svg>
      <div className="sp-score-ring-label">HEALTH SCORE</div>
    </div>
  );
}

// ── Single issue card ─────────────────────────────────────────────
function IssueCard({ issue, onHighlight }) {
  const [open, setOpen] = useState(false);
  const cfg = SEV[issue.severity];

  return (
    <div className="sp-issue-card" style={{ borderLeftColor: cfg.color }}>
      <div className="sp-issue-header" onClick={() => setOpen((o) => !o)}>
        <span
          className="sp-issue-badge"
          style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
        >
          {cfg.icon} {cfg.label}
        </span>
        <span className="sp-issue-title">{issue.title}</span>
        <span className={`sp-issue-chevron${open ? " sp-issue-chevron-open" : ""}`}>▼</span>
      </div>

      {open && (
        <div className="sp-issue-body">
          <p className="sp-issue-detail">{issue.detail}</p>
          <div className="sp-issue-fix">
            <span className="sp-issue-fix-label">💡 HOW TO FIX</span>
            <p>{issue.fix}</p>
          </div>
          {issue.affectedNodes?.length > 0 && (
            <button
              className="sp-issue-highlight-btn"
              onClick={(e) => { e.stopPropagation(); onHighlight(issue.affectedNodes); }}
            >
              🎯 Highlight affected nodes
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function ScanPanel({ isOpen, onClose, scanResult, isScanning, onScan, onNewDiagram, onHighlightNodes }) {
  const [filter, setFilter] = useState("all");

  if (!isOpen) return null;

  const { issues = [], summary = {} } = scanResult || {};
  const filtered = filter === "all" ? issues : issues.filter((i) => i.severity === filter);

  const barColor = !summary.score ? "#e2e8f0"
    : summary.score >= 80 ? "linear-gradient(90deg,#059669,#34d399)"
    : summary.score >= 50 ? "linear-gradient(90deg,#d97706,#fbbf24)"
    : "linear-gradient(90deg,#dc2626,#f87171)";

  const barLabel = !scanResult ? "" : summary.score >= 80
    ? "✓ Good architecture"
    : summary.score >= 50 ? "⚠ Needs improvement"
    : "✕ Critical issues found";

  return (
    <div className="sp-overlay">
      <div className="sp-panel">

        {/* Header */}
        <div className="sp-header">
          <div className="sp-header-left">
            <div className="sp-header-icon">🔍</div>
            <div>
              <div className="sp-header-title">Diagram Scanner</div>
              <div className="sp-header-sub">Architecture analysis & best practice checks</div>
            </div>
          </div>
          <button className="sp-close" onClick={onClose} title="Close panel">✕</button>
        </div>

        {/* Actions */}
        <div className="sp-actions">
          <button className="sp-btn-scan" onClick={onScan} disabled={isScanning}>
            {isScanning
              ? <><span className="sp-btn-spinner" /> Scanning…</>
              : <>🔍 Run Scan</>}
          </button>
          <button className="sp-btn-new" onClick={onNewDiagram}>
            ＋ New Diagram
          </button>
        </div>

        {/* Body */}
        <div className="sp-body">

          {/* Idle state */}
          {!scanResult && !isScanning && (
            <div className="sp-empty">
              <div className="sp-empty-icon">🔍</div>
              <div className="sp-empty-title">Ready to analyse</div>
              <div className="sp-empty-sub">
                Click Run Scan to check your architecture against 22 system design rules — security, scalability, high availability, and more.
              </div>
            </div>
          )}

          {/* Scanning */}
          {isScanning && (
            <div className="sp-scanning">
              <div className="sp-scanning-spinner" />
              <div className="sp-scanning-text">Analysing your architecture…</div>
              <div className="sp-scanning-sub">Checking 22 system design rules</div>
            </div>
          )}

          {/* Results */}
          {scanResult && !isScanning && (
            <>
              {/* Score */}
              <div className="sp-score-section">
                <div className="sp-score-row">
                  <ScoreRing score={summary.score} />
                  <div className="sp-stats-row">
                    <div className="sp-stat sp-stat-error">
                      <span className="sp-stat-val">{summary.errors}</span>
                      <span className="sp-stat-key">ERRORS</span>
                    </div>
                    <div className="sp-stat sp-stat-warning">
                      <span className="sp-stat-val">{summary.warnings}</span>
                      <span className="sp-stat-key">WARN</span>
                    </div>
                    <div className="sp-stat sp-stat-info">
                      <span className="sp-stat-val">{summary.info}</span>
                      <span className="sp-stat-key">INFO</span>
                    </div>
                    <div className="sp-stat sp-stat-pass">
                      <span className="sp-stat-val">{summary.passed}</span>
                      <span className="sp-stat-key">PASS</span>
                    </div>
                  </div>
                </div>
                <div className="sp-score-bar-wrap">
                  <div className="sp-score-bar">
                    <div className="sp-score-bar-fill" style={{ width: `${summary.score}%`, background: barColor }} />
                  </div>
                  <div className="sp-score-bar-text">
                    <span style={{ color: summary.score >= 80 ? "#059669" : summary.score >= 50 ? "#d97706" : "#dc2626", fontWeight: 600, fontSize: 12 }}>
                      {barLabel}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 11 }}>{summary.total} issue{summary.total !== 1 ? "s" : ""} found</span>
                  </div>
                </div>
              </div>

              {/* All clear */}
              {issues.length === 0 && (
                <div className="sp-all-clear">
                  <div className="sp-all-clear-icon">✅</div>
                  <div className="sp-all-clear-title">All checks passed!</div>
                  <div className="sp-all-clear-sub">Your architecture passed all {summary.passed} rules. Excellent work!</div>
                </div>
              )}

              {/* Filters */}
              {issues.length > 0 && (
                <>
                  <div className="sp-filters">
                    {[
                      { key: "all",     label: `All  ${issues.length}` },
                      { key: "error",   label: `Errors  ${summary.errors}` },
                      { key: "warning", label: `Warnings  ${summary.warnings}` },
                      { key: "info",    label: `Info  ${summary.info}` },
                    ].map((f) => (
                      <button
                        key={f.key}
                        className={`sp-filter-btn${filter === f.key ? " sp-filter-active" : ""}`}
                        onClick={() => setFilter(f.key)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="sp-issues">
                    {filtered.length === 0
                      ? <div className="sp-no-filter">No {filter} issues found.</div>
                      : filtered.map((issue) => (
                        <IssueCard
                          key={issue.id}
                          issue={issue}
                          onHighlight={onHighlightNodes}
                        />
                      ))
                    }
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}