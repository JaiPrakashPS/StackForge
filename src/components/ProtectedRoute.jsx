import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // While verifying token on mount, show nothing (prevents flash)
  if (loading) {
    return (
      <div style={{
        height: "100vh", width: "100vw",
        background: "#03070f",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid #0e1f3a",
          borderTop: "3px solid #1d6fff",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#1e3a5f" }}>
          Verifying session...
        </span>
      </div>
    );
  }

  // Not authenticated — redirect to login, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}