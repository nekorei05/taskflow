import { useState, useEffect } from 'react';
import { api } from '../services/api';

const TYPE_ICON = {
  task_created: '✦',
  status_changed: '↔',
  task_assigned: '→',
  due_date_updated: '📅',
};

export default function ActivityPanel({ projectId, refreshKey = 0 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setLoading(true);
    api
      .getProjectActivity(projectId)
      .then((res) => {
        if (!cancelled) setActivities(res.data.activities || []);
      })
      .catch(() => {
        if (!cancelled) setActivities([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, refreshKey]);

  if (!projectId) return null;

  return (
    <aside className="activity-panel glass">
      <h3>Recent activity</h3>
      {loading ? (
        <p className="label-hint">Loading…</p>
      ) : activities.length === 0 ? (
        <p className="label-hint">Moves and updates will show up here.</p>
      ) : (
        <ul className="activity-list">
          {activities.map((a) => (
            <li key={a._id}>
              <span className="activity-icon">{TYPE_ICON[a.type] || '•'}</span>
              <div>
                <p className="activity-msg">{a.message}</p>
                <time className="activity-time">
                  {new Date(a.createdAt).toLocaleString()}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
