export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("skillsync_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export const BASE_URL = import.meta.env.BASE_URL || "/";

export function apiUrl(path: string): string {
  const base = window.location.origin;
  return `${base}/api${path}`;
}
