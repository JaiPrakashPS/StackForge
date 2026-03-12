import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while checking token on mount

  // On app load — verify stored token and hydrate user
  useEffect(() => {
    const token = localStorage.getItem("cf_token");
    if (!token) { setLoading(false); return; }

    authAPI.getMe()
      .then((data) => setUser(data.user))
      .catch(()    => localStorage.removeItem("cf_token"))
      .finally(()  => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem("cf_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (firstName, lastName, email, password) => {
    const data = await authAPI.signup({ firstName, lastName, email, password });
    localStorage.setItem("cf_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("cf_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}