async function request(path, options = {}) { const response = await fetch(path, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw Object.assign(new Error(payload.error?.message || `Request failed (${response.status}).`), { status: response.status, code: payload.error?.code }); return payload; }
export const register = (input) => request("/api/auth/register", { method: "POST", body: JSON.stringify(input) });
export const login = (input) => request("/api/auth/login", { method: "POST", body: JSON.stringify(input) });
export const logout = () => request("/api/auth/logout", { method: "POST" });
export const getMe = () => request("/api/auth/me");
export const getUserState = () => request("/api/user-state");
export const saveUserState = (state) => request("/api/user-state", { method: "PUT", body: JSON.stringify(state) });
export function mergeUserState(remote, local) { const merge = (a = [], b = []) => [...new Map([...a, ...b].map((item) => [`${item.type}:${item.id}`, item])).values()]; return { favorites: { version: 2, items: merge(remote?.favorites?.items, local.favorites.items) }, assets: { version: 1, items: merge(remote?.assets?.items, local.assets.items) } }; }
