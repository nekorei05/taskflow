export default function TaskCard({ task, currentUser, onEdit, onDelete }) {
  const t = task;

  const esc = (str) => String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  return (
    <div className={`task-card ${t.status}`}>
      <div className="task-card-header">
        <h3 className="task-title">{t.title}</h3>
        <div className="task-actions">
          <button className="task-action-btn" onClick={() => onEdit(t._id)} title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="task-action-btn del" onClick={() => onDelete(t._id)} title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {t.description && <p className="task-desc">{t.description}</p>}

      <div className="task-meta">
        <span className={`badge badge-status-${t.status}`}>{t.status}</span>
        <span className={`badge badge-priority-${t.priority}`}>{t.priority}</span>
        {t.isOverdue && <span className="badge overdue-badge">⚠ Overdue</span>}
        {t.dueDate && <span className="task-due">📅 {new Date(t.dueDate).toLocaleDateString()}</span>}
        {currentUser?.role === 'admin' && t.owner && (
          <span className="task-owner">by {t.owner.name}</span>
        )}
      </div>

      {t.tags?.length > 0 && (
        <div className="task-tags">
          {t.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
        </div>
      )}
    </div>
  );
}
