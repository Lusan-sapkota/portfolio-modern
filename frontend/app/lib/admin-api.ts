const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const ADMIN = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "configure-deafult-here";
const API = `${BASE}${ADMIN}`;

let token: string | null = null;

if (typeof window !== "undefined") {
  token = localStorage.getItem("admin_token");
}

export function getToken(): string | null {
  return token;
}

export function setToken(t: string) {
  token = t;
  localStorage.setItem("admin_token", t);
}

export function clearToken() {
  token = null;
  localStorage.removeItem("admin_token");
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Login failed" }));
    throw new Error(err.error || "Login failed");
  }
  return res.json();
}

export async function verifyOtp(otp: string) {
  const res = await fetch(`${API}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Invalid OTP" }));
    throw new Error(err.error || "Invalid OTP");
  }
  const data = await res.json();
  setToken(data.token);
  return data.token;
}

export function logout() {
  clearToken();
}

async function authFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  get: (path: string) => authFetch(path),
  post: (path: string, body?: unknown) => authFetch(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: unknown) => authFetch(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: (path: string) => authFetch(path, { method: "DELETE" }),
};

export type DashboardStats = {
  projects: number;
  categories: number;
  skills: number;
  experiences: number;
  education: number;
  testimonials: number;
  social_links: number;
  contacts: number;
  newsletter_active: number;
  wiki_articles: number;
  wiki_categories: number;
  donation_projects: number;
  donations: number;
  total_donations_usd: number;
  total_donations_npr: number;
};
