import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#ef4444',
  'in-progress': '#f59e0b',
  completed: '#10b981',
};

const PRIORITY_COLORS = {
  high: '#ff0000',
  medium: '#f59e0b',
  low: '#10b981',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'white', border: '1.5px solid #bbd5da', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 700 }}>
        {payload[0].name}: {payload[0].value}
      </div>
    );
  }
  return null;
};

export default function StatsSection() {
  const { activeProjectId } = useProject();
  const [stats, setStats] = useState(null);
  const [userDash, setUserDash] = useState(null);
  const [projectDash, setProjectDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = activeProjectId ? { projectId: activeProjectId } : {};
    Promise.all([
      api.getTaskStats(params),
      api.getTaskDashboard(),
      activeProjectId ? api.getProjectDashboard(activeProjectId) : Promise.resolve(null),
    ])
      .then(([statsRes, dashRes, projRes]) => {
        setStats(statsRes.data);
        setUserDash(dashRes.data);
        setProjectDash(projRes?.data || null);
      })
      .catch((err) => toast.error(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, [activeProjectId]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /><p>Loading stats...</p></div>;
  }

  const total = stats?.statusBreakdown?.reduce((a, s) => a + s.count, 0) || 0;
  const statusData = (stats?.statusBreakdown || []).map((s) => ({
    name: s._id,
    value: s.count,
    fill: STATUS_COLORS[s._id] || '#94a3b8',
  }));
  const priorityData = (stats?.priorityBreakdown || []).map((p) => ({
    name: p._id,
    value: p.count,
    fill: PRIORITY_COLORS[p._id] || '#94a3b8',
  }));
  const perUserData = (stats?.tasksPerUser || []).map((u) => ({
    name: u.name,
    value: u.count,
  }));

  return (
    <section className="content-section">
      <header className="section-header">
        <div>
          <h2>Dashboard</h2>
          <p className="subtitle">Project progress and personal workload</p>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{total}</div>
          <div className="stat-label">Total Tasks (scope)</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#ef4444' }}>{stats?.overdueTasks ?? 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{userDash?.tasksAssignedToMe ?? 0}</div>
          <div className="stat-label">Assigned to me</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#ef4444' }}>{userDash?.overdueAssignedToMe ?? 0}</div>
          <div className="stat-label">My overdue</div>
        </div>
        {projectDash && (
          <div className="stat-card">
            <div className="stat-number">{projectDash.completionPercent}%</div>
            <div className="stat-label">{projectDash.projectName} complete</div>
          </div>
        )}
      </div>

      {userDash?.tasksPerProject?.length > 0 && (
        <div className="chart-card" style={{ marginBottom: 16 }}>
          <h3>Tasks per project</h3>
          <div className="stats-grid">
            {userDash.tasksPerProject.map((p) => (
              <div key={p.projectId} className="stat-card">
                <div className="stat-number">{p.completionPercent}%</div>
                <div className="stat-label">{p.name} ({p.completed}/{p.total})</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="charts-row">
        <div className="chart-card">
          <h3>Tasks by Status</h3>
          {statusData.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3>Tasks per assignee</h3>
          {perUserData.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No assigned tasks</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={perUserData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dff1f1" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3>By Priority</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
