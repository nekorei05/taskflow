import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const STATUS_COLORS = {
  'pending':     '#ef4444',
  'in-progress': '#f59e0b',
  'completed':   '#10b981',
  'cancelled':   '#94a3b8',
};

const PRIORITY_COLORS = {
  'high':   '#ff0000',
  'medium': '#f59e0b',
  'low':    '#10b981',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'white', border:'1.5px solid #bbd5da', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 12px rgb(0 60 60 / 0.1)', fontSize:13, fontWeight:700 }}>
        <p style={{ color: payload[0].payload.fill || '#1a2a2a' }}>
          {payload[0].name}: <span style={{ color:'#1a2a2a' }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'white', border:'1.5px solid #bbd5da', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 12px rgb(0 60 60 / 0.1)', fontSize:13, fontWeight:700 }}>
        <p style={{ color:'#4a6a6a', marginBottom:2, textTransform:'capitalize' }}>{label}</p>
        <p style={{ color:'#1a2a2a' }}>Tasks: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function StatsSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTaskStats()
      .then(res => setStats(res.data))
      .catch(err => toast.error(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading stats...</p></div>;

  const total = stats?.statusBreakdown?.reduce((a, s) => a + s.count, 0) || 0;

  const statusData = (stats?.statusBreakdown || []).map(s => ({
    name: s._id, value: s.count, fill: STATUS_COLORS[s._id] || '#94a3b8',
  }));

  const priorityData = (stats?.priorityBreakdown || []).map(p => ({
    name: p._id, value: p.count, fill: PRIORITY_COLORS[p._id] || '#94a3b8',
  }));

  return (
    <section className="content-section">
      <header className="section-header">
        <div>
          <h2>Statistics</h2>
          <p className="subtitle">Overview of all tasks across users</p>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        {stats?.statusBreakdown?.map(s => (
          <div key={s._id} className="stat-card">
            <div className="stat-number" style={{ color: STATUS_COLORS[s._id] || 'var(--primary)' }}>{s.count}</div>
            <div className="stat-label">{s._id}</div>
          </div>
        ))}
        {stats?.priorityBreakdown?.map(p => (
          <div key={p._id} className="stat-card">
            <div className="stat-number" style={{ color: PRIORITY_COLORS[p._id] || 'var(--primary)' }}>{p.count}</div>
            <div className="stat-label">{p._id} priority</div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Tasks by Status</h3>
          {statusData.length === 0 ? (
            <p style={{ color:'var(--text-3)', fontSize:13 }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(val) => <span style={{ fontSize:12, fontWeight:700, textTransform:'capitalize', color:'#4a6a6a' }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3>Tasks by Priority</h3>
          {priorityData.length === 0 ? (
            <p style={{ color:'var(--text-3)', fontSize:13 }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#dff1f1" />
                <XAxis dataKey="name" tick={{ fontSize:12, fontWeight:700, fill:'#4a6a6a' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize:11, fill:'#7a9a9a' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill:'#dff1f1' }} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
