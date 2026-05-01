// ── State ────────────────────────────────────────────────────────────────────
let currentUser = null;
let currentPage = 1;
let deleteTarget = null;
let userSearchTimer = null;

// ── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('accessToken');
  const savedUser = localStorage.getItem('user');
  if (token && savedUser) {
    currentUser = JSON.parse(savedUser);
    api._token = token;
    showDashboard();
    // Verify token is still valid
    try { const res = await api.getMe(); currentUser = res.data.user; updateUserUI(); }
    catch { handleLogout(); }
  }
});

// ── Auth ─────────────────────────────────────────────────────────────────────
function switchTab(tab) {
  ['login','register'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`${t}-form`).classList.toggle('hidden', t !== tab);
  });
}

async function handleLogin(e) {
  e.preventDefault();
  setLoading('login-btn', true);
  clearError('login-error');
  try {
    const res = await api.login({ email: v('login-email'), password: v('login-password') });
    api.setToken(res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    currentUser = res.data.user;
    localStorage.setItem('user', JSON.stringify(currentUser));
    showDashboard();
    toast('Welcome back, ' + currentUser.name + '! 👋', 'success');
  } catch (err) {
    showError('login-error', err.message || 'Login failed');
  } finally { setLoading('login-btn', false); }
}

async function handleRegister(e) {
  e.preventDefault();
  setLoading('register-btn', true);
  clearError('reg-error');
  try {
    const res = await api.register({ name: v('reg-name'), email: v('reg-email'), password: v('reg-password') });
    api.setToken(res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    currentUser = res.data.user;
    localStorage.setItem('user', JSON.stringify(currentUser));
    showDashboard();
    toast('Account created! Welcome, ' + currentUser.name + ' 🎉', 'success');
  } catch (err) {
    const msg = err.errors ? err.errors.map(e => e.message).join(', ') : (err.message || 'Registration failed');
    showError('reg-error', msg);
  } finally { setLoading('register-btn', false); }
}

async function handleLogout() {
  try { await api.logout(); } catch {}
  api.clearToken();
  currentUser = null;
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  toast('Logged out successfully', 'info');
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function showDashboard() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  updateUserUI();
  loadTasks();
}

function updateUserUI() {
  if (!currentUser) return;
  document.getElementById('user-name-display').textContent = currentUser.name;
  document.getElementById('user-avatar').textContent = currentUser.name[0].toUpperCase();
  const badge = document.getElementById('user-role-badge');
  badge.textContent = currentUser.role;
  badge.className = 'role-badge' + (currentUser.role === 'admin' ? ' admin' : '');

  // Show admin nav items
  if (currentUser.role === 'admin') {
    document.getElementById('nav-admin').style.display = '';
    document.getElementById('nav-stats').style.display = '';
  } else {
    document.getElementById('nav-admin').style.display = 'none';
    document.getElementById('nav-stats').style.display = 'none';
    if (document.getElementById('nav-tasks').classList.contains('active') === false) showSection('tasks');
  }
}

function showSection(name) {
  ['tasks','admin','stats'].forEach(s => {
    document.getElementById(`section-${s}`).classList.toggle('hidden', s !== name);
    const nav = document.getElementById(`nav-${s}`);
    if (nav) nav.classList.toggle('active', s === name);
  });
  if (name === 'admin') loadUsers();
  if (name === 'stats') loadStats();
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
async function loadTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading tasks...</p></div>';

  try {
    const res = await api.getTasks({
      status: v('filter-status'),
      priority: v('filter-priority'),
      sort: v('filter-sort'),
      page: currentPage,
      limit: 12,
    });
    const { tasks, pagination } = res.data;
    renderTaskStatsBar(tasks);
    renderTasks(tasks);
    renderPagination(pagination);
  } catch (err) {
    list.innerHTML = `<div class="empty-state"><p style="color:var(--danger)">${err.message || 'Failed to load tasks'}</p></div>`;
  }
}

function renderTaskStatsBar(tasks) {
  const counts = { pending: 0, 'in-progress': 0, completed: 0 };
  tasks.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);
  document.getElementById('task-stats-bar').innerHTML = Object.entries(counts).map(([s, c]) =>
    `<div class="stat-chip ${s}"><span class="stat-dot"></span>${c} ${s}</div>`
  ).join('');
}

function renderTasks(tasks) {
  const list = document.getElementById('task-list');
  if (!tasks.length) {
    list.innerHTML = `<div class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
      <h3>No tasks found</h3><p>Create your first task to get started</p>
      <button class="btn btn-primary" onclick="openTaskModal()">+ New Task</button>
    </div>`;
    return;
  }
  list.innerHTML = tasks.map(t => `
    <div class="task-card ${t.status}" id="task-${t._id}">
      <div class="task-card-header">
        <h3 class="task-title">${esc(t.title)}</h3>
        <div class="task-actions">
          <button class="task-action-btn" onclick="openEditModal('${t._id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="task-action-btn del" onclick="confirmTaskDelete('${t._id}')" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </div>
      ${t.description ? `<p class="task-desc">${esc(t.description)}</p>` : ''}
      <div class="task-meta">
        <span class="badge badge-status-${t.status}">${t.status}</span>
        <span class="badge badge-priority-${t.priority}">${t.priority}</span>
        ${t.isOverdue ? '<span class="badge overdue-badge">⚠ Overdue</span>' : ''}
        ${t.dueDate ? `<span class="task-due">📅 ${new Date(t.dueDate).toLocaleDateString()}</span>` : ''}
        ${currentUser.role === 'admin' && t.owner ? `<span class="task-owner">by ${esc(t.owner.name)}</span>` : ''}
      </div>
      ${t.tags?.length ? `<div class="task-tags">${t.tags.map(tag => `<span class="tag">#${esc(tag)}</span>`).join('')}</div>` : ''}
    </div>`).join('');
}

function renderPagination({ total, page, limit, totalPages }) {
  const pg = document.getElementById('pagination');
  if (totalPages <= 1) { pg.innerHTML = ''; return; }
  let html = `<button class="page-btn" onclick="changePage(${page-1})" ${page<=1?'disabled':''}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1)
      html += `<button class="page-btn ${i===page?'active':''}" onclick="changePage(${i})">${i}</button>`;
    else if (Math.abs(i - page) === 2) html += `<span style="color:var(--text-3)">…</span>`;
  }
  html += `<button class="page-btn" onclick="changePage(${page+1})" ${page>=totalPages?'disabled':''}>›</button>`;
  pg.innerHTML = html;
}

function changePage(p) { currentPage = p; loadTasks(); window.scrollTo(0,0); }

// ── Task Modal ────────────────────────────────────────────────────────────────
let _editingTask = null;

function openTaskModal() {
  _editingTask = null;
  document.getElementById('modal-title').textContent = 'New Task';
  document.getElementById('task-form').reset();
  document.getElementById('task-id').value = '';
  document.getElementById('task-submit-btn').querySelector('.btn-text').textContent = 'Create Task';
  clearError('task-form-error');
  document.getElementById('task-modal').classList.remove('hidden');
}

async function openEditModal(id) {
  try {
    const res = await api.request('GET', `/tasks/${id}`);
    const t = res.data.task;
    _editingTask = t;
    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('task-id').value = t._id;
    document.getElementById('task-title').value = t.title;
    document.getElementById('task-desc').value = t.description || '';
    document.getElementById('task-status').value = t.status;
    document.getElementById('task-priority').value = t.priority;
    document.getElementById('task-due').value = t.dueDate ? t.dueDate.substring(0,10) : '';
    document.getElementById('task-tags').value = (t.tags || []).join(', ');
    document.getElementById('task-submit-btn').querySelector('.btn-text').textContent = 'Save Changes';
    clearError('task-form-error');
    document.getElementById('task-modal').classList.remove('hidden');
  } catch (err) { toast(err.message || 'Failed to load task', 'error'); }
}

async function handleTaskSubmit(e) {
  e.preventDefault();
  setLoading('task-submit-btn', true);
  clearError('task-form-error');
  const body = {
    title: v('task-title'),
    description: v('task-desc'),
    status: v('task-status'),
    priority: v('task-priority'),
    dueDate: v('task-due') || undefined,
    tags: v('task-tags') ? v('task-tags').split(',').map(t=>t.trim()).filter(Boolean) : [],
  };
  try {
    if (_editingTask) {
      await api.updateTask(_editingTask._id, body);
      toast('Task updated!', 'success');
    } else {
      await api.createTask(body);
      toast('Task created!', 'success');
    }
    closeModal('task-modal');
    loadTasks();
  } catch (err) {
    const msg = err.errors ? err.errors.map(e=>e.message).join(', ') : (err.message || 'Failed to save task');
    showError('task-form-error', msg);
  } finally { setLoading('task-submit-btn', false); }
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function confirmTaskDelete(id) {
  deleteTarget = id;
  document.getElementById('confirm-modal').classList.remove('hidden');
}

async function confirmDelete() {
  if (!deleteTarget) return;
  try {
    await api.deleteTask(deleteTarget);
    closeModal('confirm-modal');
    toast('Task deleted', 'info');
    loadTasks();
  } catch (err) { toast(err.message || 'Failed to delete', 'error'); }
  deleteTarget = null;
}

// ── Admin: Users ──────────────────────────────────────────────────────────────
async function loadUsers() {
  const wrapper = document.getElementById('user-list');
  wrapper.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading users...</p></div>';
  try {
    const res = await api.getUsers({ role: v('admin-filter-role'), search: v('admin-search'), limit: 50 });
    const { users } = res.data;
    if (!users.length) { wrapper.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-2)">No users found</div>'; return; }
    wrapper.innerHTML = `<table class="user-table">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
      <tbody>${users.map(u => `<tr>
        <td><strong>${esc(u.name)}</strong></td>
        <td style="color:var(--text-2)">${esc(u.email)}</td>
        <td><span class="badge ${u.role==='admin'?'badge-priority-high':'badge-status-pending'}">${u.role}</span></td>
        <td><span class="badge ${u.isActive?'badge-status-completed':'badge-status-pending'}">${u.isActive?'Active':'Inactive'}</span></td>
        <td style="color:var(--text-3)">${new Date(u.createdAt).toLocaleDateString()}</td>
        <td>
          ${u._id !== currentUser._id ? `
            <button class="btn btn-ghost btn-sm" onclick="toggleUserRole('${u._id}','${u.role==='admin'?'user':'admin'}')">${u.role==='admin'?'→ User':'→ Admin'}</button>
            <button class="btn btn-danger btn-sm" onclick="removeUser('${u._id}')">Delete</button>
          ` : '<span style="color:var(--text-3);font-size:12px">You</span>'}
        </td>
      </tr>`).join('')}</tbody>
    </table>`;
  } catch (err) { wrapper.innerHTML = `<div style="padding:40px;text-align:center;color:var(--danger)">${err.message}</div>`; }
}

async function toggleUserRole(id, newRole) {
  try { await api.updateUser(id, { role: newRole }); toast('User role updated', 'success'); loadUsers(); }
  catch (err) { toast(err.message || 'Failed', 'error'); }
}

async function removeUser(id) {
  if (!confirm('Delete this user permanently?')) return;
  try { await api.deleteUser(id); toast('User deleted', 'info'); loadUsers(); }
  catch (err) { toast(err.message || 'Failed', 'error'); }
}

function debounceLoadUsers() {
  clearTimeout(userSearchTimer);
  userSearchTimer = setTimeout(loadUsers, 400);
}

// ── Admin: Stats ──────────────────────────────────────────────────────────────
async function loadStats() {
  const el = document.getElementById('stats-content');
  el.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading...</p></div>';
  try {
    const res = await api.getTaskStats();
    const { statusBreakdown, priorityBreakdown } = res.data;
    const total = statusBreakdown.reduce((a,s) => a + s.count, 0);
    el.innerHTML = `
      <div class="stat-card"><div class="stat-number">${total}</div><div class="stat-label">Total Tasks</div></div>
      ${statusBreakdown.map(s => `<div class="stat-card"><div class="stat-number">${s.count}</div><div class="stat-label">${s._id}</div></div>`).join('')}
      ${priorityBreakdown.map(p => `<div class="stat-card"><div class="stat-number">${p.count}</div><div class="stat-label">${p._id} priority</div></div>`).join('')}
    `;
  } catch (err) { el.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`; }
}

// ── Utilities ─────────────────────────────────────────────────────────────────
const v = (id) => document.getElementById(id)?.value?.trim() || '';
const esc = (str) => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function togglePassword(id) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.querySelector('.btn-text')?.classList.toggle('hidden', loading);
  btn.querySelector('.btn-loader')?.classList.toggle('hidden', !loading);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) { el.textContent = ''; el.classList.add('hidden'); }
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function closeModalOnOverlay(e, id) { if (e.target.id === id) closeModal(id); }

function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  el.innerHTML = `<span style="font-size:16px">${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3500);
}
