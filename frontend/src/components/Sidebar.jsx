import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const icons = {
  projects: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  tasks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  ),
  admin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  stats: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export default function Sidebar({ activeSection, onSectionChange }) {
  const { user, logout } = useAuth();
  const { projects, activeProjectId, activeProject, selectProject } = useProject();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'projects', label: 'Projects' },
    { id: 'stats', label: 'Dashboard' },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Users (Admin)' }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="logo-text">TaskFlow</span>
      </div>

      {projects.length > 0 && (
        <div className="filters-bar glass" style={{ margin: '0 12px 12px', padding: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>Active project</label>
          <select
            value={activeProjectId}
            onChange={(e) => selectProject(e.target.value)}
            style={{ width: '100%', marginTop: 6 }}
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.taskCount ?? 0} tasks)
              </option>
            ))}
          </select>
        </div>
      )}

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            {icons[item.id]}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            {user?.role === 'admin' && (
              <span className="role-badge admin">system admin</span>
            )}
            <span className={`role-badge ${activeProject?.myRole === 'admin' ? 'admin' : ''}`}>
              {activeProject?.myRole ? `project ${activeProject.myRole}` : 'project —'}
            </span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          {icons.logout}
        </button>
      </div>
    </aside>
  );
}
