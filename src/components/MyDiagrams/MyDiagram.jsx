import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { diagramAPI } from "../../services/api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');
  .md-wrap { min-height:100vh; background:#03070f; color:#e2eaf4; font-family:'DM Mono',monospace; }
  .md-nav {
    height:60px; background:#080f1ecc; backdrop-filter:blur(12px);
    border-bottom:1px solid #0e1f3a;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 32px; position:sticky; top:0; z-index:50;
  }
  .md-brand { display:flex; align-items:center; gap:10px; cursor:pointer; text-decoration:none; }
  .md-brand-mark {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg,#1d6fff,#6366f1);
    display:flex; align-items:center; justify-content:center; font-size:16px;
    box-shadow:0 0 16px #1d6fff44;
  }
  .md-brand-name { font-family:'Syne',sans-serif; font-weight:800; font-size:15px; color:#e2eaf4; letter-spacing:-0.5px; }
  .md-nav-right { display:flex; align-items:center; gap:12px; }
  .md-avatar {
    width:32px; height:32px; border-radius:50%;
    background:linear-gradient(135deg,#1d6fff,#6366f1);
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:700; color:#fff; cursor:pointer;
  }
  .md-btn-ghost { background:transparent; border:1px solid #0e1f3a; color:#3a5a80; padding:7px 14px; border-radius:7px; cursor:pointer; font-family:'DM Mono',monospace; font-size:12px; transition:all 0.15s; }
  .md-btn-ghost:hover { border-color:#1d6fff44; color:#7bafd4; }
  .md-btn-primary { background:linear-gradient(135deg,#1d6fff,#4f46e5); border:none; color:#fff; padding:8px 18px; border-radius:7px; cursor:pointer; font-family:'DM Mono',monospace; font-size:12px; font-weight:700; box-shadow:0 4px 16px #1d6fff33; transition:all 0.15s; }
  .md-btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 24px #1d6fff55; }
  .md-container { max-width:1100px; margin:0 auto; padding:48px 24px; }
  .md-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:36px; gap:16px; flex-wrap:wrap; }
  .md-title { font-family:'Syne',sans-serif; font-size:36px; font-weight:800; letter-spacing:-1px; line-height:1; }
  .md-subtitle { font-size:13px; color:#2a4a6a; margin-top:6px; }
  .md-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
  .md-card {
    background:#080f1e; border:1px solid #0e1f3a; border-radius:14px;
    padding:20px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden;
  }
  .md-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#1d6fff,transparent); opacity:0; transition:opacity 0.3s; }
  .md-card:hover { border-color:#1d6fff44; transform:translateY(-2px); box-shadow:0 8px 32px rgba(29,111,255,0.12); }
  .md-card:hover::before { opacity:1; }
  .md-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; gap:8px; }
  .md-card-icon { width:40px; height:40px; border-radius:10px; background:#1d6fff12; border:1px solid #1d6fff22; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .md-card-name { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:#e2eaf4; margin-bottom:3px; word-break:break-word; }
  .md-card-desc { font-size:11px; color:#2a4a6a; line-height:1.5; }
  .md-card-stats { display:flex; gap:12px; margin-top:14px; padding-top:14px; border-top:1px solid #0e1f3a; }
  .md-stat { display:flex; flex-direction:column; gap:2px; }
  .md-stat-val { font-size:15px; font-weight:700; color:#1d6fff; }
  .md-stat-key { font-size:10px; color:#1e3a5f; letter-spacing:0.08em; }
  .md-card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:14px; }
  .md-card-date { font-size:10px; color:#1e3a5f; }
  .md-card-actions { display:flex; gap:6px; }
  .md-icon-btn { width:28px; height:28px; border-radius:6px; border:1px solid #0e1f3a; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; transition:all 0.15s; color:#2a4a6a; }
  .md-icon-btn:hover { border-color:#ef444444; color:#ef4444; background:#ef444410; }
  .md-empty { text-align:center; padding:80px 24px; }
  .md-empty-icon { font-size:60px; opacity:0.1; margin-bottom:20px; }
  .md-empty-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; color:#0e1f3a; margin-bottom:8px; }
  .md-empty-sub { font-size:13px; color:#1e3a5f; margin-bottom:28px; }
  .md-spinner { width:36px; height:36px; border-radius:50%; border:3px solid #0e1f3a; border-top:3px solid #1d6fff; animation:spin 0.8s linear infinite; margin:0 auto; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .md-toast { position:fixed; bottom:24px; right:24px; z-index:200; background:#080f1e; border:1px solid #0e1f3a; border-radius:10px; padding:12px 18px; font-size:12px; color:#e2eaf4; box-shadow:0 8px 32px rgba(0,0,0,0.5); display:flex; align-items:center; gap:10px; animation:fadeUp 0.3s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .md-delete-confirm { position:absolute; inset:0; background:#03070fee; border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:20px; z-index:10; }
`;

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
      <style>{CSS}</style>
      <div className="md-wrap">

        {/* Nav */}
        <nav className="md-nav">
          <div className="md-brand" onClick={() => navigate("/home")}>
            <div className="md-brand-mark">☁</div>
            <span className="md-brand-name">CloudForge</span>
          </div>
          <div className="md-nav-right">
            <span style={{ fontSize:12, color:"#2a4a6a" }}>
              {user?.firstName} {user?.lastName}
            </span>
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
            <div style={{ textAlign:"center", paddingTop:80 }}>
              <div className="md-spinner" />
              <p style={{ color:"#1e3a5f", fontSize:12, marginTop:16 }}>Loading your diagrams...</p>
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
                      <div style={{ fontSize:13, color:"#e2eaf4", textAlign:"center" }}>
                        Delete <strong>"{d.name}"</strong>?
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button
                          onClick={() => deleteDiagram(d._id)}
                          style={{ padding:"7px 16px", borderRadius:6, border:"none", background:"#ef4444", color:"#fff", cursor:"pointer", fontSize:12, fontFamily:"'DM Mono',monospace" }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          style={{ padding:"7px 16px", borderRadius:6, border:"1px solid #0e1f3a", background:"transparent", color:"#7bafd4", cursor:"pointer", fontSize:12, fontFamily:"'DM Mono',monospace" }}
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