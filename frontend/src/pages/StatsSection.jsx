import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#94a3b8',
  'in-progress': '#d97706',
  completed: '#059669',
};

const STATUS_LABELS = {
  pending: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Done',
};

const WORKFLOW_ORDER = ['pending', 'in-progress', 'completed'];

const DashTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-tooltip">
      {payload[0].payload?.name || payload[0].name}: <strong>{payload[0].value}</strong>
    </div>
  );
};

function countByStatus(breakdown, status) {
  return breakdown?.find((s) => s._id === status)?.count || 0;
}

export default function StatsSection() {
  const { activeProjectId, activeProject } = useProject();
  const [projectDash, setProjectDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastToast = useRef(0);

  useEffect(() => {
    if (!activeProjectId) {
      setProjectDash(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .getProjectDashboard(activeProjectId)
      .then((res) => {
        if (!cancelled) setProjectDash(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          const now = Date.now();
          if (now - lastToast.current > 3000) {
            lastToast.current = now;
            toast.error(err.message || 'Failed to load dashboard');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeProjectId]);

  if (!activeProjectId) {
    return (
      <section className="content-section dash-page">
        <header className="section-header">
          <div>
            <h2>Dashboard</h2>
            <p className="subtitle">Select a project in the sidebar to see its overview</p>
          </div>
        </header>
        <div className="dash-empty glass">
          <p>Choose <strong>TaskFlow Product</strong> or another project from the dropdown on the left.</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  const breakdown = projectDash?.statusBreakdown || [];
  const total = projectDash?.totalTasks ?? 0;
  const completed = countByStatus(breakdown, 'completed');
  const inProgress = countByStatus(breakdown, 'in-progress');
  const todo = countByStatus(breakdown, 'pending');
  const incomplete = total - completed;
  const overdue = projectDash?.overdueTasks ?? 0;

  const statusData = WORKFLOW_ORDER.map((key) => ({
    key,
    name: STATUS_LABELS[key],
    value: countByStatus(breakdown, key),
    fill: STATUS_COLORS[key],
  })).filter((d) => d.value > 0);

  const workflowData = WORKFLOW_ORDER.map((key) => ({
    name: STATUS_LABELS[key],
    value: countByStatus(breakdown, key),
    fill: STATUS_COLORS[key],
  }));

  const perUser = projectDash?.tasksPerUser || [];

  return (
    <section className="content-section dash-page">
      <header className="section-header dash-header-simple">
        <div>
          <h2>Dashboard</h2>
          <p className="subtitle">
            {activeProject?.name}
          </p>
        </div>
      </header>

      {/* Row 1 — KPI cards like Asana */}
      <div className="dash-kpi-row">
        <div className="dash-kpi-card">
          <span className="dash-kpi-label">Completed tasks</span>
          <span className="dash-kpi-value">{completed}</span>
          <span className="dash-kpi-foot">Done</span>
        </div>
        <div className="dash-kpi-card">
          <span className="dash-kpi-label">Incomplete tasks</span>
          <span className="dash-kpi-value">{incomplete}</span>
          <span className="dash-kpi-foot">To do + in progress</span>
        </div>
        <div className="dash-kpi-card dash-kpi-card--alert">
          <span className="dash-kpi-label">Overdue tasks</span>
          <span className="dash-kpi-value dash-kpi-value--danger">{overdue}</span>
          <span className="dash-kpi-foot">Past due date</span>
        </div>
        <div className="dash-kpi-card">
          <span className="dash-kpi-label">Total tasks</span>
          <span className="dash-kpi-value">{total}</span>
          <span className="dash-kpi-foot">In this project</span>
        </div>
      </div>

      {/* Row 2 — two charts */}
      <div className="dash-charts-row">
        <div className="dash-chart-panel">
          <h3 className="dash-chart-title">Task status breakdown</h3>
          {total === 0 ? (
            <p className="chart-card-empty">No tasks in this project yet</p>
          ) : (
            <div className="dash-donut-layout">
              <div className="dash-donut-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData.length ? statusData : [{ name: 'Empty', value: 1, fill: '#e2e8f0' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {(statusData.length ? statusData : [{ fill: '#e2e8f0' }]).map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<DashTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dash-donut-center">
                  <span className="dash-donut-total">{total}</span>
                  <span className="dash-donut-sub">tasks</span>
                </div>
              </div>
              <ul className="dash-legend">
                {WORKFLOW_ORDER.map((key) => (
                  <li key={key}>
                    <span className="dash-legend-dot" style={{ background: STATUS_COLORS[key] }} />
                    {STATUS_LABELS[key]} ({countByStatus(breakdown, key)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="dash-chart-panel">
          <h3 className="dash-chart-title">Work status</h3>
          {total === 0 ? (
            <p className="chart-card-empty">No tasks to chart</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={workflowData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: 'Task count',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fill: '#94a3b8' },
                  }}
                />
                <Tooltip content={<DashTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {workflowData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3 — assignees (simple list) */}
      {perUser.length > 0 && (
        <div className="dash-chart-panel dash-assignee-panel">
          <h3 className="dash-chart-title">Tasks per teammate</h3>
          <div className="dash-assignee-grid">
            {perUser.map((u) => (
              <div key={u.userId} className="dash-assignee-item">
                <span className="dash-assignee-name">{u.name}</span>
                <span className="dash-assignee-count">
                  {u.total} assigned · {u.completed} done
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
