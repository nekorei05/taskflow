export default function ConfirmModal({ message = 'This action cannot be undone.', onConfirm, onClose, confirmLabel = 'Delete', danger = true }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card small">
        <h2>Are you sure?</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 0 }}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
