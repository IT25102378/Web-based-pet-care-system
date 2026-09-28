// =============================================================================
// Pet Nexus — Centralized API Client
// Phase 11A: Real backend integration
//
// VITE_USE_MOCK_DATA=false  → all calls route to Spring Boot via Vite proxy
// VITE_USE_MOCK_DATA=true   → mock/localStorage mode (dev fallback)
// =============================================================================

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const simulateDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Token storage keys — centralised so nothing else hardcodes these strings
// ---------------------------------------------------------------------------
const TOKEN_KEY   = 'petnexus_auth_token';
const USER_KEY    = 'petnexus_current_user';

export const tokenStore = {
  getToken:   ()       => localStorage.getItem(TOKEN_KEY),
  setToken:   (token)  => localStorage.setItem(TOKEN_KEY, token),
  removeToken: ()      => localStorage.removeItem(TOKEN_KEY),

  getUser:    ()       => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  },
  setUser:    (user)   => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: ()       => localStorage.removeItem(USER_KEY),

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ---------------------------------------------------------------------------
// Core fetch wrapper — used by all real-mode API modules
// ---------------------------------------------------------------------------

/**
 * Dispatches an authenticated (or unauthenticated for public endpoints) HTTP
 * request to the Spring Boot backend via the Vite /api proxy.
 *
 * @param {string}  endpoint  Path relative to API_BASE_URL, e.g. '/auth/login'
 * @param {object}  options   Standard fetch options (method, body, headers, …)
 * @param {boolean} skipAuth  When true, omits the Authorization header
 *                            (used for login / register / verify-email / etc.)
 * @returns {Promise<any>}    Parsed JSON body, or null for 204 No Content
 * @throws  {ApiError}        Structured error with message, status, and code
 */
export async function apiFetch(endpoint, options = {}, skipAuth = false) {
  // Build URL — prevent double /api prefix
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url  = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach JWT for authenticated requests
  if (!skipAuth) {
    const token = tokenStore.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkErr) {
    throw new ApiError('Unable to reach the server. Please check your connection.', 0, 'NETWORK_ERROR');
  }

  // 204 No Content
  if (response.status === 204) return null;

  // Parse body (best-effort — backend always returns JSON)
  let body = null;
  try {
    body = await response.json();
  } catch (_) { /* empty body */ }

  if (!response.ok) {
    const message = body?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(message, response.status, body?.error || null);
  }

  return body;
}

// ---------------------------------------------------------------------------
// Structured error class
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  /**
   * @param {string} message  Human-readable message from backend
   * @param {number} status   HTTP status code (0 = network failure)
   * @param {string|null} code  Backend error type / reason phrase
   */
  constructor(message, status, code = null) {
    super(message);
    this.name    = 'ApiError';
    this.status  = status;
    this.code    = code;
  }

  get isUnauthorized()  { return this.status === 401; }
  get isForbidden()     { return this.status === 403; }
  get isNetworkError()  { return this.status === 0; }
}

// ---------------------------------------------------------------------------
// Public-endpoint helper (skips Authorization header)
// ---------------------------------------------------------------------------
export function publicFetch(endpoint, options = {}) {
  return apiFetch(endpoint, options, true);
}
