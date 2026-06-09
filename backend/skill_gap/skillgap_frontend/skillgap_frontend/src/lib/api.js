import { getToken, clearToken } from "./storage";
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export async function apiFetch(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (res.status === 401) clearToken();
  if (!res.ok) throw new Error(data?.error || data?.msg || `HTTP ${res.status}`);
  return data;
}
