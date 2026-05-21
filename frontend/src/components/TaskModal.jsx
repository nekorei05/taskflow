import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function TaskModal({ taskId, projectId, isProjectAdmin, onClose, onSaved }) {
  const isEditing = !!taskId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (!projectId) return;
    api.getProject(projectId)
      .then((res) => setMembers(res.data.project.members || []))
      .catch(() => setMembers([]));
  }, [projectId]);

  useEffect(() => {
    if (!taskId) return;
    api.getTask(taskId)
      .then((res) => {
        const t = res.data.task;
        setTitle(t.title || '');
        setDescription(t.description || '');
        setStatus(t.status || 'pending');
        setPriority(t.priority || 'medium');
        setDueDate(t.dueDate ? t.dueDate.substring(0, 10) : '');
        setTags((t.tags || []).join(', '));
        setAssignedTo(t.assignedTo?._id || t.assignedTo || '');
      })
      .catch((err) => toast.error(err.message || 'Failed to load task'))
      .finally(() => setFetching(false));
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const body = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    if (isProjectAdmin) {
      body.assignedTo = assignedTo || null;
    }
    try {
      if (isEditing) {
        await api.updateTask(taskId, body);
        toast.success('Task updated!');
      } else {
        await api.createTask({ ...body, projectId });
        toast.success('Task created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err.errors
        ? err.errors.map((e) => e.message).join(', ')
        : err.message || 'Failed to save task';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const memberFieldsOnly = isEditing && !isProjectAdmin;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2>{isEditing ? 'Edit Task' : 'New Task'}</h2>
        {fetching ? (
          <div className="loading-spinner"><div className="spinner" /><p>Loading...</p></div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!memberFieldsOnly && (
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional details..."
              />
            </div>
            {!memberFieldsOnly && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In-Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Tags <span className="label-hint">(comma separated)</span></label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="urgent, bug, frontend"
                  />
                </div>
              </>
            )}
            {memberFieldsOnly && (
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
            {isProjectAdmin && (
              <div className="form-group">
                <label>Assign to</label>
                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId._id} value={m.userId._id}>
                      {m.userId.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {error && <div className="error-msg">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : isEditing ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
