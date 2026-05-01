// ── API Service Layer ────────────────────────────────────────────────────────
const API_BASE = 'http://127.0.0.1:5002/api/v1';

const api = {
  _token: null,

  setToken(t) { this._token = t; localStorage.setItem('accessToken', t); },
  clearToken() { this._token = null; localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user'); },

  async request(method, path, body = null) {
    const token = this._token || localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    // Try token refresh on 401
    if (res.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this._token}`;
        const retry = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : null });
        const data = await retry.json();
        if (!retry.ok) throw data;
        return data;
      } else {
        api.clearToken();
        window.location.reload();
        return;
      }
    }

    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  async refreshTokens() {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return false;
    try {
      const data = await this.request('POST', '/auth/refresh', { refreshToken: rt });
      this.setToken(data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return true;
    } catch { return false; }
  },

  // Auth
  register: (body) => api.request('POST', '/auth/register', body),
  login: (body) => api.request('POST', '/auth/login', body),
  logout: () => api.request('POST', '/auth/logout'),
  getMe: () => api.request('GET', '/auth/me'),

  // Tasks
  getTasks: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v)));
    return api.request('GET', `/tasks?${q}`);
  },
  createTask: (body) => api.request('POST', '/tasks', body),
  updateTask: (id, body) => api.request('PATCH', `/tasks/${id}`, body),
  deleteTask: (id) => api.request('DELETE', `/tasks/${id}`),
  getTaskStats: () => api.request('GET', '/tasks/stats'),

  // Users (admin)
  getUsers: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v)));
    return api.request('GET', `/users?${q}`);
  },
  updateUser: (id, body) => api.request('PATCH', `/users/${id}`, body),
  deleteUser: (id) => api.request('DELETE', `/users/${id}`),
};
