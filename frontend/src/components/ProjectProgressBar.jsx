export default function ProjectProgressBar({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'completed').length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="project-progress">
      <div className="project-progress-labels">
        <span>Project progress</span>
        <span>{done}/{total} done ({pct}%)</span>
      </div>
      <div className="project-progress-track">
        <div className="project-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
