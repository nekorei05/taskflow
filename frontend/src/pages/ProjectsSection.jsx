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
            Create a team space then add people who already signed up.
          </p>
        </div>
      </header>

      <div className="filters-bar glass" style={{ marginBottom: 16 }}>
        <form onSubmit={handleCreate} className="form-row" style={{ width: '100%', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>New project name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jira Project" required />
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', width: 'fit-content', whiteSpace: 'nowrap' }}>            + Create
          </button>
        </form>
      </div>

      <p style={{ marginBottom: 12, fontSize: 12, color: 'var(--color-text-secondary)' }}>
        Demo users: arjun@test.com · diya@test.com · admin@test.com
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
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 500, margin: '0 0 16px' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Members —</span>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 16 }}>{projectDetail?.name || '...'}</span>
          </h3>
          {loadingDetail ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
                {(projectDetail?.members || []).map((m) => {
                  const isAdmin = m.role === 'admin';
                  const nameStr = m.userId?.name || 'User';
                  const initials = nameStr.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <li
                      key={m.userId?._id || m.userId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 0',
                        borderBottom: '0.5px solid var(--color-border-tertiary)',
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600, flexShrink: 0,
                        background: '#e8eeff',
                        color: '#4a6fd4',
                      }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{nameStr}</p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>{m.userId?.email}</p>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99,
                        background: isAdmin ? '#EEEDFE' : '#E1F5EE',
                        color: isAdmin ? '#3C3489' : '#085041',
                      }}>
                        {m.role}
                      </span>
                      {isAdminOnDetail && toId(m.userId) !== toId(projectDetail?.createdBy) && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ fontSize: 12, padding: '4px 10px', whiteSpace: 'nowrap' }}
                          onClick={() => handleRemove(toId(m.userId))}
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              {isAdminOnDetail && (
             <form onSubmit={handleInvite} className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
             {/* Row Container */}
             <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
               
               {/* Removed flex: 1 so it stays compact */}
               <div className="form-group" style={{ marginBottom: 0 }}>
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
               </div>
           
               <button
                 type="submit"
                 className="btn btn-primary"
                 style={{ whiteSpace: 'nowrap', height: '42px' }}
                 disabled={!selectedUserId}
               >
                 Add member
               </button>
             </div>
           
             {/* Hint text */}
             {candidates.length === 0 && (
               <p className="label-hint" style={{ marginTop: 4, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                 Everyone with an account is already on this project or sign up another user first.
               </p>
             )}
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