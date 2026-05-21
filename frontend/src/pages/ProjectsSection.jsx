import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';
import toast from 'react-hot-toast';

export default function ProjectsSection() {
  const { projects, activeProjectId, selectProject, loadProjects } = useProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [projectDetail, setProjectDetail] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const isAdminOnDetail = projectDetail?.myRole === 'admin';

  const loadDetail = async (id) => {
    if (!id) return;
    setLoadingDetail(true);
    try {
      const res = await api.getProject(id);
      setProjectDetail(res.data.project);
      if (res.data.project.myRole === 'admin') {
        const cand = await api.getInviteCandidates(id);
        setCandidates(cand.data.users || []);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      setProjectDetail(null);
      setCandidates([]);
      toast.error(err.message || 'Failed to load project');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (activeProjectId) loadDetail(activeProjectId);
  }, [activeProjectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createProject({ name, description });
      const created = res.data.project;
      toast.success('Project created — you are the project admin');
      setName('');
      setDescription('');
      await loadProjects();
      selectProject(created._id);
      await loadDetail(created._id);
    } catch (err) {
      toast.error(err.message || 'Failed to create project');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!activeProjectId || !selectedUserId) return;
    try {
      await api.inviteProjectMember(activeProjectId, { userId: selectedUserId });
      toast.success('Member added to project');
      setSelectedUserId('');
      await loadDetail(activeProjectId);
      await loadProjects();
    } catch (err) {
      toast.error(err.message || 'Failed to add member');
    }
  };

  const handleRemove = async (userId) => {
    try {
      await api.removeProjectMember(activeProjectId, userId);
      toast.success('Member removed');
      await loadDetail(activeProjectId);
      await loadProjects();
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  return (
    <section className="content-section">
      <header className="section-header">
        <div>
          <h2>Projects</h2>
          <p className="subtitle">
            Create a team space, then add people who already signed up. No emails are sent.
          </p>
        </div>
      </header>

      <div className="role-guide glass role-guide-compact">
        <p className="role-guide-lines">
          Project admins invite members and manage the board. Members work on tasks assigned to them.
        </p>
      </div>

      <div className="filters-bar glass" style={{ marginBottom: 16 }}>
        <form onSubmit={handleCreate} className="form-row" style={{ width: '100%', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>New project name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sprint Alpha" required />
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
            + Create
          </button>
        </form>
      </div>

      <p className="subtitle" style={{ marginBottom: 12, fontSize: 13 }}>
        Demo accounts to invite: <strong>arjun@test.com</strong>, <strong>diya@test.com</strong>,{' '}
        <strong>admin@test.com</strong> (passwords in seed / README)
      </p>

      <div className="task-grid">
        {projects.map((p) => (
          <button
            key={p._id}
            type="button"
            className={`task-card ${activeProjectId === p._id ? 'in-progress' : 'pending'}`}
            style={{ textAlign: 'left', cursor: 'pointer' }}
            onClick={() => selectProject(p._id)}
          >
            <h3 className="task-title">{p.name}</h3>
            <p className="task-desc">{p.description || 'No description'}</p>
            <div className="task-meta">
              <span className="badge">{p.memberCount} members</span>
              <span className={`badge badge-priority-${p.myRole === 'admin' ? 'high' : 'low'}`}>
                you: {p.myRole}
              </span>
            </div>
          </button>
        ))}
      </div>

      {activeProjectId && (
        <div className="chart-card" style={{ marginTop: 24 }}>
          <h3>Members — {projectDetail?.name || '...'}</h3>
          {loadingDetail ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
                {(projectDetail?.members || []).map((m) => (
                  <li
                    key={m.userId?._id || m.userId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span>
                      {m.userId?.name || 'User'} — {m.userId?.email} ({m.role})
                    </span>
                    {isAdminOnDetail && toId(m.userId) !== toId(projectDetail?.createdBy) && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleRemove(toId(m.userId))}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {isAdminOnDetail && (
                <form onSubmit={handleInvite} className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Add existing user</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                    >
                      <option value="">Select a user…</option>
                      {candidates.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                    {candidates.length === 0 && (
                      <p className="label-hint" style={{ marginTop: 6 }}>
                        Everyone with an account is already on this project, or sign up another user first.
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-end' }}
                    disabled={!selectedUserId}
                  >
                    Add member
                  </button>
                </form>
              )}
              {!isAdminOnDetail && projectDetail && (
                <p className="subtitle">Only project admins can add or remove members.</p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function toId(ref) {
  if (!ref) return '';
  return typeof ref === 'object' && ref._id ? ref._id : ref;
}
