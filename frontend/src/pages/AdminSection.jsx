import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function AdminSection() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getUsers({ role: roleFilter, search: debouncedSearch, limit: 100 });
      setUsers(res.data.users || []);
    } catch (err) {
      setUsers([]);
      const msg = err.message || 'Failed to load users';
      setError(msg);
      if (!msg.includes('Too many')) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, debouncedSearch]);

  useEffect(() => {
    if (user?.role === 'admin') loadUsers();
  }, [loadUsers, user?.role]);

  const toggleRole = async (id, newRole) => {
    try {
      await api.updateUser(id, { role: newRole });
      toast.success('User role updated');
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteUser(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <section className="content-section">
        <p>System admin access required for user management.</p>
      </section>
    );
  }

  return (
    <section className="content-section">
      <header className="section-header">
        <div>
          <h2>User Management</h2>
          <p className="subtitle">
            System admin — change global roles (separate from project admin on each project)
          </p>
        </div>
      </header>

      <div className="role-guide glass">
        <p className="role-guide-hint">
          <strong>System admin</strong> (this page): manage all accounts.{' '}
          <strong>Project admin</strong> (Projects page): manage members and tasks per project.
        </p>
      </div>

      <div className="filters-bar glass">
        <div className="filter-group">
          <label>Role</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="filter-group" style={{ flexGrow: 1 }}>
          <label>Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
          />
        </div>
        <button type="button" className="btn btn-ghost" style={{ alignSelf: 'flex-end' }} onClick={loadUsers}>
          Refresh
        </button>
      </div>

      <div className="user-list-wrapper glass">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /><p>Loading users...</p></div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>No users found</div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td style={{ color: 'var(--text-2)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-priority-high' : 'badge-status-pending'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-status-completed' : 'badge-status-pending'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-3)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u._id !== user._id ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleRole(u._id, u.role === 'admin' ? 'user' : 'admin')}
                        >
                          {u.role === 'admin' ? '→ User' : '→ Admin'}
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteId(u._id)}>
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteId && (
        <ConfirmModal
          message="This will permanently delete the user and all their data."
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
        />
      )}
    </section>
  );
}
