import { useState, useEffect } from "react";
import { collaborationAPI } from "../../services/api";
import "./CollabPanel.css";

function Avatar({ name, color, size = 28, title }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "?";
  return (
    <div
      className="cp-avatar"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
      title={title || name}
    >
      {initials}
    </div>
  );
}

export default function CollabPanel({ isOpen, onClose, diagramId, currentUser, presence }) {
  const [collaborators, setCollaborators] = useState([]);
  const [email,         setEmail]         = useState("");
  const [permission,    setPermission]    = useState("edit");
  const [loading,       setLoading]       = useState(false);
  const [fetchLoading,  setFetchLoading]  = useState(false);
  const [toast,         setToast]         = useState(null);
  const [error,         setError]         = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch existing collaborators when panel opens
  useEffect(() => {
    if (!isOpen || !diagramId) return;
    setFetchLoading(true);
    collaborationAPI.getCollaborators(diagramId)
      .then(d => setCollaborators(d.collaborators || []))
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, [isOpen, diagramId]);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await collaborationAPI.addCollaborator(diagramId, { email: email.trim(), permission });
      setCollaborators(data.collaborators || []);
      setEmail("");
      showToast(data.message || "Collaborator added!");
    } catch (err) {
      setError(err.message || "Could not add collaborator.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from this diagram?`)) return;
    try {
      const data = await collaborationAPI.removeCollaborator(diagramId, userId);
      setCollaborators(data.collaborators || []);
      showToast("Collaborator removed.");
    } catch (err) {
      showToast("Could not remove collaborator.", "error");
    }
  };

  const isOwner = true; // canvas only shows this for owner (passed down)

  // Map socketId → presence info for online indicators
  const onlineUserIds = new Set(presence.map(p => p.userId));

  if (!isOpen) return null;

  return (
    <div className="cp-overlay">
      <div className="cp-panel">

        {/* ── Header ── */}
        <div className="cp-header">
          <div className="cp-header-left">
            <div className="cp-header-icon">👥</div>
            <div>
              <div className="cp-header-title">Collaborators</div>
              <div className="cp-header-sub">Invite people to edit this diagram</div>
            </div>
          </div>
          <button className="cp-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Live presence strip ── */}
        {presence.length > 0 && (
          <div className="cp-presence">
            <div className="cp-presence-label">
              <span className="cp-online-dot" />
              {presence.length + 1} online now
            </div>
            <div className="cp-presence-avatars">
              {/* Self */}
              <Avatar
                name={`${currentUser?.firstName} ${currentUser?.lastName}`}
                color="#2563eb"
                size={30}
                title={`${currentUser?.firstName} (you)`}
              />
              {/* Others */}
              {presence.map(p => (
                <Avatar key={p.socketId} name={p.firstName} color={p.color} size={30} title={`${p.firstName} — editing`} />
              ))}
            </div>
          </div>
        )}

        {/* ── Invite form ── */}
        <div className="cp-invite">
          <div className="cp-invite-label">INVITE BY EMAIL</div>
          <div className="cp-invite-row">
            <input
              className="cp-invite-input"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleInvite()}
              disabled={loading}
            />
            <select
              className="cp-permission-select"
              value={permission}
              onChange={e => setPermission(e.target.value)}
            >
              <option value="edit">Can edit</option>
              <option value="view">Can view</option>
            </select>
            <button
              className="cp-invite-btn"
              onClick={handleInvite}
              disabled={loading || !email.trim()}
            >
              {loading ? "…" : "Invite"}
            </button>
          </div>
          {error && <div className="cp-error">{error}</div>}
          <div className="cp-invite-hint">
            The user must have a CloudForge account. They'll see this diagram in their "My Diagrams" list immediately.
          </div>
        </div>

        <div className="cp-divider" />

        {/* ── Collaborators list ── */}
        <div className="cp-collab-section">
          <div className="cp-section-title">
            PEOPLE WITH ACCESS
            {collaborators.length > 0 && (
              <span className="cp-section-count">{collaborators.length + 1}</span>
            )}
          </div>

          {fetchLoading ? (
            <div className="cp-loading"><div className="cp-spinner" /></div>
          ) : (
            <div className="cp-list">

              {/* Owner row (always first) */}
              <div className="cp-person-row cp-person-owner">
                <Avatar
                  name={`${currentUser?.firstName} ${currentUser?.lastName}`}
                  color="#2563eb" size={34}
                />
                <div className="cp-person-info">
                  <div className="cp-person-name">
                    {currentUser?.firstName} {currentUser?.lastName}
                    <span className="cp-person-you">you</span>
                  </div>
                  <div className="cp-person-email">{currentUser?.email}</div>
                </div>
                <div className="cp-person-role cp-role-owner">Owner</div>
              </div>

              {/* Collaborators */}
              {collaborators.length === 0 ? (
                <div className="cp-empty-list">
                  No collaborators yet. Invite someone above.
                </div>
              ) : (
                collaborators.map((c) => {
                  const uid     = c.user?._id || c.user;
                  const isOnline = onlineUserIds.has(typeof uid === "object" ? uid.toString() : uid);
                  const name    = c.user?.firstName
                    ? `${c.user.firstName} ${c.user.lastName || ""}`
                    : c.email;
                  const presUser = presence.find(p => p.userId === (typeof uid === "object" ? uid.toString() : uid));
                  const avatarColor = presUser?.color || "#64748b";

                  return (
                    <div key={c.email} className="cp-person-row">
                      <div className="cp-avatar-wrap">
                        <Avatar name={name} color={avatarColor} size={34} />
                        {isOnline && <span className="cp-online-badge" />}
                      </div>
                      <div className="cp-person-info">
                        <div className="cp-person-name">{name}</div>
                        <div className="cp-person-email">{c.email}</div>
                      </div>
                      <div className={`cp-person-role ${c.permission === "edit" ? "cp-role-edit" : "cp-role-view"}`}>
                        {c.permission === "edit" ? "Can edit" : "Can view"}
                      </div>
                      <button
                        className="cp-remove-btn"
                        onClick={() => handleRemove(typeof uid === "object" ? uid.toString() : uid, name)}
                        title="Remove collaborator"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── Share link ── */}
        <div className="cp-share">
          <div className="cp-share-label">SHARE DIRECT LINK</div>
          <div className="cp-share-row">
            <input
              className="cp-share-input"
              readOnly
              value={`${window.location.origin}/canvas/${diagramId || ""}`}
            />
            <button
              className="cp-share-copy"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/canvas/${diagramId}`);
                showToast("Link copied!");
              }}
            >
              Copy
            </button>
          </div>
          <div className="cp-share-hint">Only invited collaborators can edit. Anyone else will be denied access.</div>
        </div>

      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`cp-toast cp-toast-${toast.type}`}>
          {toast.type === "success" ? "✓" : "✗"} {toast.msg}
        </div>
      )}
    </div>
  );
}