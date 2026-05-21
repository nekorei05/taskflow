import { sameUserId, userLabel } from '../utils/ids';
import PriorityBadge from './PriorityBadge';

const STATUS_LABELS = {
  pending: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Done',
};

export default function TaskListTable({
  tasks,
  currentUser,
  isProjectAdmin,
  onEdit,
  onQuickStatus,
}) {
  return (
    <div className="task-table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned to</th>
            <th>Due</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const isMine = sameUserId(t.assignedTo, currentUser);
            const canEdit =
              isProjectAdmin || (isMine && t.assignedTo);
            const canQuickStatus = canEdit && !isProjectAdmin ? isMine : isProjectAdmin;

            return (
              <tr key={t._id} className={t.isOverdue ? 'row-overdue' : ''}>
                <td>
                  <strong>{t.title}</strong>
                  {t.description && (
                    <div className="task-table-desc">{t.description}</div>
                  )}
                  {isMine && <span className="badge badge-you">You</span>}
                  {t.isOverdue && <span className="badge overdue-badge">Overdue</span>}
                </td>
                <td>
                  <span className={`badge badge-status-${t.status}`}>
                    {STATUS_LABELS[t.status] || t.status}
                  </span>
                </td>
                <td>
                  <PriorityBadge priority={t.priority} />
                </td>
                <td>{userLabel(t.assignedTo)}</td>
                <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                <td className="task-table-actions">
                  {canQuickStatus && (
                    <select
                      className="status-quick-select"
                      value={t.status}
                      onChange={(e) => onQuickStatus(t._id, e.target.value)}
                      title="Update status"
                    >
                      <option value="pending">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Done</option>
                    </select>
                  )}
                  {canEdit && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(t._id)}>
                      Edit
                    </button>
                  )}
                  {!canEdit && !t.assignedTo && (
                    <span className="label-hint">Unassigned</span>
                  )}
                  {!canEdit && t.assignedTo && !isMine && (
                    <span className="label-hint">View only</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
