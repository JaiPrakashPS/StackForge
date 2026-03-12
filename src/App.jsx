import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext";
import ProtectedRoute    from "./components/ProtectedRoute";
import HomePage          from "./components/HomePage";
import AuthPage          from "./components/AuthPage";
import CloudForgeCanvas  from "./components/CloudForge";
import MyDiagrams        from "./components/MyDiagrams";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"           element={<Navigate to="/home" replace />} />
          <Route path="/home"       element={<HomePage />} />
          <Route path="/login"      element={<AuthPage mode="login" />} />
          <Route path="/signup"     element={<AuthPage mode="signup" />} />

          {/* Protected */}
          <Route path="/canvas"     element={<ProtectedRoute><CloudForgeCanvas /></ProtectedRoute>} />
          <Route path="/canvas/:id" element={<ProtectedRoute><CloudForgeCanvas /></ProtectedRoute>} />
          <Route path="/diagrams"   element={<ProtectedRoute><MyDiagrams /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*"           element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}