import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { sameUserId } from '../utils/ids';
import TaskCard from '../components/TaskCard';
import TaskListTable from '../components/TaskListTable';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import RoleGuide from '../components/RoleGuide';
import ProjectProgressBar from '../components/ProjectProgressBar';
import ActivityPanel from '../components/ActivityPanel';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function TasksSection() {
  const { user } = useAuth();
  const { activeProjectId, isProjectAdmin, activeProject } = useProject();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('project');
  const [display, setDisplay] = useState('board');

  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [activityRefresh, setActivityRefresh] = useState(0);

  const loadTasks = useCallback(async () => {
    const needsProject = view === 'project' || view === 'overdue';
    if (needsProject && !activeProjectId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = { sort: '-createdAt', page: 1, limit: 100 };
      if (filterStatus && display !== 'board') params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (needsProject) params.projectId = activeProjectId;
      if (view === 'overdue') params.overdue = 'true';

      const res =
        view === 'assigned'
          ? await api.getAssignedTasks(params)
          : await api.getTasks(params);
      setTasks(res.data.tasks || []);
      setActivityRefresh((k) => k + 1);
    } catch (err) {
      toast.error(err.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, activeProjectId, view, display]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const canEditTask = (task) =>
    isProjectAdmin || (task.assignedTo && sameUserId(task.assignedTo, user));

  const canDragTask = (task) => canEditTask(task);

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

  const canCreate = isProjectAdmin && activeProjectId;
  const showBoard = display === 'board' && view !== 'overdue';
  const projectTasks = view === 'project' ? tasks : [];

  return (
    <section className="content-section tasks-layout">
      <header className="section-header">
        <div>
          <h2>Tasks</h2>
          <p className="subtitle">
            {activeProject?.name || 'Pick a project in the sidebar'}
            {activeProject?.taskCount != null && ` · ${activeProject.taskCount} tasks in DB`}
          </p>
        </div>
        {canCreate && (
          <button type="button" className="btn btn-primary" onClick={handleNewTask}>
            + New Task
          </button>
        )}
      </header>

      <RoleGuide />

      {view === 'project' && projectTasks.length > 0 && (
        <ProjectProgressBar tasks={projectTasks} />
      )}

      <div className="filters-bar glass">
        <div className="filter-group">
          <label>View</label>
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="project">All in project</option>
            <option value="assigned">Assigned to me</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Display</label>
          <select value={display} onChange={(e) => setDisplay(e.target.value)}>
            <option value="board">Board</option>
            <option value="table">List</option>
            <option value="cards">Cards</option>
          </select>
        </div>
        {display !== 'board' && (
          <div className="filter-group">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="pending">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Done</option>
            </select>
          </div>
        )}
        <div className="filter-group">
          <label>Priority</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button
          type="button"
          className={`btn btn-ghost ${view === 'assigned' ? 'active-filter' : ''}`}
          onClick={() => setView('assigned')}
        >
          Assigned to me
        </button>
      </div>

      <div className="tasks-main-grid">
        <div className="tasks-main">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /><p>Loading tasks...</p></div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks here yet</h3>
              <p>
                {!activeProjectId
                  ? 'Choose a project in the sidebar (look for the one with the highest task count).'
                  : view === 'assigned'
                    ? 'Nothing assigned to you — try “All in project”.'
                    : `No tasks in ${activeProject?.name}. Run backend: npm run repair-tasks`}
              </p>
              {canCreate && (
                <button type="button" className="btn btn-primary" onClick={handleNewTask}>
                  + New Task
                </button>
              )}
            </div>
          ) : showBoard ? (
            <KanbanBoard
              tasks={tasks}
              canDragTask={canDragTask}
              onStatusChange={handleQuickStatus}
              onEdit={handleEdit}
            />
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
        </div>

        {activeProjectId && view === 'project' && (
          <ActivityPanel projectId={activeProjectId} refreshKey={activityRefresh} />
        )}
      </div>

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
