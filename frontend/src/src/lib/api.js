/**
 * API client for the microservices backend.
 *
 * Everything goes through the API gateway under `/v1`:
 *   auth   -> /v1/auth/*    (register, login, refresh-token, logout, me)
 *   posts  -> /v1/posts/*   (create-post, all-posts, :id, :id DELETE)
 *   media  -> /v1/media/*   (upload, get)
 *   search -> /v1/search/*  (posts?query=)
 *
 * In dev, Vite proxies `/v1` to the gateway (see vite.config.js), so the
 * browser never touches CORS. In production the same relative path works
 * when the SPA is served from the same origin as the gateway.
 *
 * Auth model: short-lived access token kept in memory (+ sessionStorage so a
 * reload survives), long-lived refresh token in localStorage. On any 401 the
 * client transparently refreshes once and retries.
 */

const REFRESH_KEY = "pulseboard.refreshToken";
const ACCESS_KEY = "pulseboard.accessToken";

let accessToken = sessionStorage.getItem(ACCESS_KEY) || "";
let refreshInFlight = null;

export function getAccessToken() {
  return accessToken;
}

export function setTokens({ accessToken: nextAccess, refreshToken: nextRefresh }) {
  if (typeof nextAccess === "string") {
    accessToken = nextAccess;
    if (nextAccess) sessionStorage.setItem(ACCESS_KEY, nextAccess);
    else sessionStorage.removeItem(ACCESS_KEY);
  }
  if (typeof nextRefresh === "string") {
    if (nextRefresh) localStorage.setItem(REFRESH_KEY, nextRefresh);
    else localStorage.removeItem(REFRESH_KEY);
  }
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || "";
}

export function clearTokens() {
  accessToken = "";
  sessionStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

class ApiError extends Error {
  constructor(status, message, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function tryRefresh() {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(401, "Session expired. Please sign in again.");
  refreshInFlight = (async () => {
    const res = await fetch("/v1/auth/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      clearTokens();
      throw new ApiError(res.status, data.message || "Session expired. Please sign in again.", data);
    }
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.accessToken;
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function request(path, { method = "GET", body, auth = true, form = false, retry = true } = {}) {
  const headers = {};
  let payload;
  if (body !== undefined) {
    if (form) {
      payload = body; // FormData — browser sets the multipart boundary
    } else {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(path, { method, headers, body: payload });
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => "");

  if (res.status === 401 && auth && retry) {
    try {
      const fresh = await tryRefresh();
      return request(path, { method, body, auth, form, retry: false, _fresh: fresh });
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(401, "Session expired. Please sign in again.");
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data.slice(0, 160)) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data);
  }
  return data;
}

// ---------------------------------------------------------------- auth
export const authApi = {
  async register({ username, email, password }) {
    const data = await request("/v1/auth/register", {
      method: "POST",
      auth: false,
      body: { username, email, password },
    });
    if (data.accessToken) setTokens(data);
    return data;
  },
  async login({ email, password }) {
    const data = await request("/v1/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    if (data.accessToken) setTokens(data);
    return data;
  },
  async logout() {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await request("/v1/auth/logout", { method: "POST", body: { refreshToken } });
      }
    } catch {
      // logout is best-effort — always clear local tokens
    }
    clearTokens();
  },
  me() {
    return request("/v1/auth/me", { method: "GET" });
  },
};

// ---------------------------------------------------------------- posts
export const postsApi = {
  list(page = 1, limit = 10) {
    return request(`/v1/posts/all-posts?page=${page}&limit=${limit}`);
  },
  get(id) {
    return request(`/v1/posts/${encodeURIComponent(id)}`);
  },
  create({ content, mediaIds = [] }) {
    return request("/v1/posts/create-post", { method: "POST", body: { content, mediaIds } });
  },
  remove(id) {
    return request(`/v1/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------- search
export const searchApi = {
  posts(query) {
    return request(`/v1/search/posts?query=${encodeURIComponent(query)}`);
  },
};

// ---------------------------------------------------------------- media
export const mediaApi = {
  list() {
    return request("/v1/media/get");
  },
  upload(file) {
    const form = new FormData();
    form.append("file", file);
    return request("/v1/media/upload", { method: "POST", body: form, form: true });
  },
};

export { ApiError };
