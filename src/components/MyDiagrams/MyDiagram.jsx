import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { diagramAPI } from "../../services/api";
import "./MyDiagrams.css";

export default function MyDiagrams() {
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    diagramAPI.getAll()
      .then((d) => setDiagrams(d.diagrams))
      .catch(() => showToast("Could not load diagrams."))
      .finally(() => setLoading(false));
  }, []);

  const openDiagram = (id) => navigate(`/canvas/${id}`);

  const newDiagram = () => navigate("/canvas");

  const deleteDiagram = async (id) => {
    try {
      await diagramAPI.delete(id);
      setDiagrams((prev) => prev.filter((d) => d._id !== id));
      showToast("Diagram deleted.");
    } catch {
      showToast("Could not delete diagram.");
    }
    setConfirmId(null);
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

  const initials = user ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase() : "?";

  return (
    <>
      <div className="md-wrap">

        {/* Nav */}
        <nav className="md-nav">
          <div className="md-brand" onClick={() => navigate("/home")}>
            <div className="md-brand-mark">☁</div>
            <span className="md-brand-name">StackForge</span>
          </div>
          <div className="md-nav-right">
            <span className="md-nav-user-name">{user?.firstName} {user?.lastName}</span>
            <div className="md-avatar" title="Profile">{initials}</div>
            <button className="md-btn-ghost" onClick={() => { logout(); navigate("/login"); }}>
              Log Out
            </button>
          </div>
        </nav>

        <div className="md-container">
          {/* Header */}
          <div className="md-header">
            <div>
              <h1 className="md-title">My Diagrams</h1>
              <p className="md-subtitle">
                {loading ? "Loading..." : `${diagrams.length} diagram${diagrams.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button className="md-btn-primary" onClick={newDiagram}>
              + New Diagram
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign:"center", paddingTop:80, fontFamily:"var(--sans)" }}>
              <div className="md-spinner" />
              <p className="md-loading-text">Loading your diagrams...</p>
            </div>
          ) : diagrams.length === 0 ? (
            <div className="md-empty">
              <div className="md-empty-icon">☁</div>
              <div className="md-empty-title">No diagrams yet</div>
              <div className="md-empty-sub">Create your first cloud architecture diagram</div>
              <button className="md-btn-primary" onClick={newDiagram}>
                + Create First Diagram
              </button>
            </div>
          ) : (
            <div className="md-grid">
              {diagrams.map((d) => (
                <div key={d._id} className="md-card" onClick={() => openDiagram(d._id)}>
                  {/* Delete confirm overlay */}
                  {confirmId === d._id && (
                    <div className="md-delete-confirm" onClick={(e) => e.stopPropagation()}>
                      <div className="md-delete-confirm-text">
                        Delete <strong>"{d.name}"</strong>?
                      </div>
                      <div className="md-delete-confirm-actions">
                        <button
                          onClick={() => deleteDiagram(d._id)}
                          className="md-btn-danger"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="md-btn-cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="md-card-top">
                    <div>
                      <div className="md-card-icon">🗺</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div className="md-card-name">{d.name}</div>
                      {d.description && <div className="md-card-desc">{d.description}</div>}
                    </div>
                  </div>

                  <div className="md-card-stats">
                    <div className="md-stat">
                      <div className="md-stat-val">{d.componentCount}</div>
                      <div className="md-stat-key">COMPONENTS</div>
                    </div>
                    <div className="md-stat">
                      <div className="md-stat-val">${d.estimatedCost}</div>
                      <div className="md-stat-key">EST/MO</div>
                    </div>
                  </div>

                  <div className="md-card-footer">
                    <span className="md-card-date">Updated {formatDate(d.updatedAt)}</span>
                    <div className="md-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="md-icon-btn" title="Open" onClick={() => openDiagram(d._id)}>↗</button>
                      <button className="md-icon-btn" title="Delete" onClick={() => setConfirmId(d._id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {toast && (
          <div className="md-toast">
            <span>ℹ</span> {toast}
          </div>
        )}
      </div>
    </>
  );
}