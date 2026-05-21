const LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

export default function PriorityBadge({ priority = 'medium' }) {
  const key = priority && LABELS[priority] ? priority : 'medium';
  return (
    <span className={`badge badge-priority-${key}`}>
      {LABELS[key]}
    </span>
  );
}
