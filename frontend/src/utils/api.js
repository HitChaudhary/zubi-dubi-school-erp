const API_BASE = 'http://localhost:5000/api';

/**
 * Wraps fetch() with the JWT auth header, JSON handling, and a consistent
 * error shape. Throws an Error with a human-readable message on failure.
 */
export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Could not reach the server. Is the backend running?');
  }

  // Session expired / invalid token — bounce to login
  if (response.status === 401 || response.status === 403) {
    let message = 'Your session has expired. Please sign in again.';
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      /* ignore parse errors */
    }
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw new Error(message);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* some endpoints may return no body */
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status}).`);
  }

  return data;
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  del: (path) => apiRequest(path, { method: 'DELETE' }),
};
