import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';

const TYPE_ICON = {
  task_created: '✦',
  status_changed: '↔',
  task_assigned: '→',
  due_date_updated: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="14" height="14" fill="currentColor">
      <path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176zM144 288L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 288L144 288z"/>
    </svg>
  )
};

export default function ActivitySection() {
  const { activeProjectId, activeProject } = useProject();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProjectId) {
      Promise.resolve().then(() => setActivities([]));
      return;
    }
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });
    api
      .getProjectActivity(activeProjectId, 100)
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
  }, [activeProjectId]);

  if (!activeProjectId) {
    return (
      <section className="content-section activity-page">
        <header className="section-header">
          <div>
            <h2>Activity Log</h2>
            <p className="subtitle">Select a project in the sidebar to see its activity history</p>
          </div>
        </header>
        <div className="dash-empty glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>
          <p>Choose <strong>TaskFlow Product</strong> or another project from the dropdown on the left.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="content-section activity-page">
      <header className="section-header">
        <div>
          <h2>Activity Log</h2>
          <p className="subtitle">
            Audit trail and recent updates for {activeProject?.name}
          </p>
        </div>
      </header>

      <div className="activity-section-wrapper glass" style={{ padding: '24px', borderRadius: 'var(--radius)', background: 'var(--card-bg)' }}>
        {loading ? (
          <div className="loading-spinner" style={{ padding: '40px 0' }}>
            <div className="spinner" />
            <p style={{ marginTop: '12px', color: 'var(--text-2)', fontSize: '14px' }}>Loading activity log…</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0', textAlign: 'center' }}>
            <h3>No activities yet</h3>
            <p style={{ color: 'var(--text-3)' }}>Updates and status changes will show up here as your team works.</p>
          </div>
        ) : (
          <ul className="activity-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {activities.map((a) => (
              <li
                key={a._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '16px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span
                  className="activity-icon"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--bg)',
                    color: 'var(--text-2)',
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {TYPE_ICON[a.type] || '•'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="activity-msg" style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-1)', fontWeight: 600, lineHeight: 1.4 }}>
                    {a.message}
                  </p>
                  <time className="activity-time" style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
