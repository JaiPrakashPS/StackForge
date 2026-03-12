const BASE = "http://localhost:5000/api";

// ── Helper ────────────────────────────────────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("cf_token");

  const res = await fetch(`${BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (body)  => request("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login:  (body)  => request("/auth/login",  { method: "POST", body: JSON.stringify(body) }),
  getMe:  ()      => request("/auth/me"),
};

// ── Diagrams ──────────────────────────────────────────────────────────────────
export const diagramAPI = {
  getAll:  ()           => request("/diagrams"),
  getOne:  (id)         => request(`/diagrams/${id}`),
  create:  (body)       => request("/diagrams",      { method: "POST",   body: JSON.stringify(body) }),
  update:  (id, body)   => request(`/diagrams/${id}`, { method: "PUT",    body: JSON.stringify(body) }),
  delete:  (id)         => request(`/diagrams/${id}`, { method: "DELETE" }),
};