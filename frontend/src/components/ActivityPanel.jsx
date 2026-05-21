import { useState, useEffect } from 'react';
import { api } from '../services/api';

const TYPE_ICON = {
  task_created: '✦',
  status_changed: '↔',
  task_assigned: '→',
  due_date_updated: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="16" height="16" fill="currentColor">
      <path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176zM144 288L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 288L144 288z"/>
    </svg>
  )
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
