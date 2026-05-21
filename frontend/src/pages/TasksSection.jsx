import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function TasksSection() {
  const { user } = useAuth();
  const { activeProjectId, isProjectAdmin, projects } = useProject();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [view, setView] = useState('project');

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterSort, setFilterSort] = useState('-createdAt');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const loadTasks = useCallback(async () => {
    if (view === 'project' && !activeProjectId) {
      setTasks([]);
      setPagination(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = {
        status: filterStatus,
        priority: filterPriority,
        sort: filterSort,
        page,
        limit: 12,
      };
      if (view === 'project') params.projectId = activeProjectId;
      if (view === 'assigned') params.assignedToMe = 'true';
      if (view === 'overdue') params.overdue = 'true';

      const res =
        view === 'assigned'
          ? await api.getAssignedTasks(params)
          : await api.getTasks(params);
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, filterSort, page, activeProjectId, view]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleEdit = (id) => {
    setEditingId(id);
    setModalOpen(true);
  };
  const handleNewTask = () => {
    if (!isProjectAdmin) {
      toast.error('Only project admins can create tasks');
      return;
    }
    setEditingId(null);
    setModalOpen(true);
  };
  const handleDelete = async () => {
    try {
      await api.deleteTask(deleteId);
      toast.success('Task deleted');
      setDeleteId(null);
      loadTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const statsCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const canCreate = isProjectAdmin && activeProjectId;

  return (
    <section className="content-section">
      <header className="section-header">
        <div>
          <h2>Tasks</h2>
          <p className="subtitle">
            {view === 'assigned'
              ? 'Assigned to you across projects'
              : view === 'overdue'
                ? 'Overdue tasks in active project'
                : projects.find((p) => p._id === activeProjectId)?.name || 'Select a project'}
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={handleNewTask}>
            + New Task
          </button>
        )}
      </header>

      <div className="filters-bar glass">
        <div className="filter-group">
          <label>View</label>
          <select value={view} onChange={(e) => { setView(e.target.value); setPage(1); }}>
            <option value="project">Project tasks</option>
            <option value="assigned">Assigned to me</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority</label>
          <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort</label>
          <select value={filterSort} onChange={(e) => { setFilterSort(e.target.value); setPage(1); }}>
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="task-stats-chips">
          {Object.entries(statsCounts).map(([s, c]) => (
            <div key={s} className={`stat-chip ${s}`}>
              <span className="stat-dot" />
              {c} {s}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /><p>Loading tasks...</p></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>
            {view === 'project' && !activeProjectId
              ? 'Join or create a project first'
              : 'No tasks match your filters'}
          </p>
          {canCreate && (
            <button className="btn btn-primary" onClick={handleNewTask}>
              + New Task
            </button>
          )}
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              currentUser={user}
              canEdit={
                isProjectAdmin ||
                (task.assignedTo?._id === user._id || task.assignedTo === user._id)
              }
              canDelete={isProjectAdmin}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-container">
          <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            ‹
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((i) => {
            if (i === 1 || i === pagination.totalPages || Math.abs(i - page) <= 1)
              return (
                <button
                  key={i}
                  className={`page-btn ${i === page ? 'active' : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i}
                </button>
              );
            if (Math.abs(i - page) === 2) return <span key={i} style={{ color: 'var(--text-3)' }}>…</span>;
            return null;
          })}
          <button
            className="page-btn"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.totalPages}
          >
            ›
          </button>
        </div>
      )}

      {modalOpen && (
        <TaskModal
          taskId={editingId}
          projectId={activeProjectId}
          isProjectAdmin={isProjectAdmin}
          onClose={() => setModalOpen(false)}
          onSaved={loadTasks}
        />
      )}
      {deleteId && (
        <ConfirmModal onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
      )}
    </section>
  );
}
