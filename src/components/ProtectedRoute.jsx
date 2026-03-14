import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ProtectedRoute.css";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="pr-loading">
        <div className="pr-spinner" />
        <span className="pr-text">Verifying session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}