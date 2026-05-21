import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { sameUserId } from '../utils/ids';
import TaskCard from '../components/TaskCard';
import TaskListTable from '../components/TaskListTable';
import TaskModal from '../components/TaskModal';
import RoleGuide from '../components/RoleGuide';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function TasksSection() {
  const { user } = useAuth();
  const { activeProjectId, isProjectAdmin, projects, activeProject } = useProject();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [view, setView] = useState('project');
  const [display, setDisplay] = useState('table');

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterSort, setFilterSort] = useState('-createdAt');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const loadTasks = useCallback(async () => {
    const needsProject = view === 'project' || view === 'overdue';
    if (needsProject && !activeProjectId) {
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
        limit: 50,
      };
      if (needsProject) params.projectId = activeProjectId;
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

  const canEditTask = (task) =>
    isProjectAdmin || (task.assignedTo && sameUserId(task.assignedTo, user));

  const handleQuickStatus = async (taskId, status) => {
    try {
      await api.updateTask(taskId, { status });
      toast.success('Status updated');
      loadTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

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
              ? 'Only tasks assigned to you'
              : view === 'overdue'
                ? 'Overdue in current project'
                : `All tasks in ${activeProject?.name || 'project'} (including completed — visible to whole team)`}
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={handleNewTask}>
            + New Task
          </button>
        )}
      </header>

      <RoleGuide context="tasks" />

      <div className="filters-bar glass">
        <div className="filter-group">
          <label>View</label>
          <select value={view} onChange={(e) => { setView(e.target.value); setPage(1); }}>
            <option value="project">All in project</option>
            <option value="assigned">Assigned to me</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Display</label>
          <select value={display} onChange={(e) => setDisplay(e.target.value)}>
            <option value="table">List</option>
            <option value="cards">Cards</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="pending">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Done</option>
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
          <span className="stat-chip">
            <span className="stat-dot" />
            {tasks.length} shown
          </span>
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
              ? 'Select a project in the sidebar'
              : view === 'project' && activeProject
                ? `No tasks in "${activeProject.name}" yet — try another project in the sidebar (counts shown there), or create one as project admin.`
              : view === 'assigned'
                ? 'Nothing assigned to you. Switch to "All in project" to see the full team board.'
                : 'No tasks match your filters'}
          </p>
          {canCreate && (
            <button className="btn btn-primary" onClick={handleNewTask}>
              + New Task
            </button>
          )}
        </div>
      ) : display === 'table' ? (
        <TaskListTable
          tasks={tasks}
          currentUser={user}
          isProjectAdmin={isProjectAdmin}
          onEdit={handleEdit}
          onQuickStatus={handleQuickStatus}
        />
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              currentUser={user}
              canEdit={canEditTask(task)}
              canDelete={isProjectAdmin}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              onQuickStatus={canEditTask(task) ? handleQuickStatus : undefined}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-container">
          <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            ‹
          </button>
          <span style={{ padding: '0 8px', fontSize: 13, color: 'var(--text-3)' }}>
            Page {page} / {pagination.totalPages}
          </span>
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
