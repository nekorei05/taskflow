const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiService {
  _token = null;

  setToken(t) {
    this._token = t;
    localStorage.setItem('accessToken', t);
  }

  clearToken() {
    this._token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async request(method, path, body = null) {
    const token = this._token || localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (res.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this._token}`;
        const retry = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : null });
        const data = await retry.json();
        if (!retry.ok) throw data;
        return data;
      } else {
        this.clearToken();
        window.location.reload();
        return;
      }
    }

    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  async refreshTokens() {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return false;
    try {
      const data = await this.request('POST', '/auth/refresh', { refreshToken: rt });
      this.setToken(data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return true;
    } catch { return false; }
  }

  // Auth
  register = (body) => this.request('POST', '/auth/register', body);
  login = (body) => this.request('POST', '/auth/login', body);
  logout = () => this.request('POST', '/auth/logout');
  getMe = () => this.request('GET', '/auth/me');

  // Tasks
  getTasks = (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    );
    const qs = q.toString();
    return this.request('GET', `/tasks${qs ? `?${qs}` : ''}`);
  };
  getTask = (id) => this.request('GET', `/tasks/${id}`);
  createTask = (body) => this.request('POST', '/tasks', body);
  updateTask = (id, body) => this.request('PATCH', `/tasks/${id}`, body);
  deleteTask = (id) => this.request('DELETE', `/tasks/${id}`);
  getTaskStats = (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    const qs = q.toString();
    return this.request('GET', `/tasks/stats${qs ? `?${qs}` : ''}`);
  };
  getTaskDashboard = () => this.request('GET', '/tasks/dashboard');
  getAssignedTasks = (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    return this.request('GET', `/tasks/assigned/me?${q}`);
  };
  assignTask = (id, body) => this.request('PATCH', `/tasks/${id}/assign`, body);

  // Projects
  getProjects = () => this.request('GET', '/projects');
  getProject = (id) => this.request('GET', `/projects/${id}`);
  createProject = (body) => this.request('POST', '/projects', body);
  updateProject = (id, body) => this.request('PATCH', `/projects/${id}`, body);
  deleteProject = (id) => this.request('DELETE', `/projects/${id}`);
  getProjectDashboard = (id) => this.request('GET', `/projects/${id}/dashboard`);
  getProjectActivity = (id, limit = 30) =>
    this.request('GET', `/projects/${id}/activity?limit=${limit}`);
  getInviteCandidates = (id) => this.request('GET', `/projects/${id}/invite-candidates`);
  inviteProjectMember = (id, body) => this.request('POST', `/projects/${id}/members`, body);
  removeProjectMember = (id, userId) => this.request('DELETE', `/projects/${id}/members/${userId}`);
  updateProjectMemberRole = (id, userId, body) =>
    this.request('PATCH', `/projects/${id}/members/${userId}`, body);

  // Users (admin)
  getUsers = (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    );
    const qs = q.toString();
    return this.request('GET', `/users${qs ? `?${qs}` : ''}`);
  };
  updateUser = (id, body) => this.request('PATCH', `/users/${id}`, body);
  deleteUser = (id) => this.request('DELETE', `/users/${id}`);
}

export const api = new ApiService();
