import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function FlowLogo({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: '#3B6FF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 40 40" fill="none">
        <rect x="4" y="11" width="24" height="5" rx="2.5" fill="white"/>
        <rect x="4" y="18" width="17" height="5" rx="2.5" fill="white" fillOpacity="0.75"/>
        <rect x="4" y="25" width="11" height="5" rx="2.5" fill="white" fillOpacity="0.5"/>
        <polygon points="26,17 34,22 26,27" fill="white"/>
      </svg>
    </div>
  );
}

function MiniDashboard() {
  return (
    <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Completed', value: '24', color: '#4ade80' },
          { label: 'In Progress', value: '8', color: '#fbbf24' },
          { label: 'Overdue', value: '3', color: '#f87171' },
          { label: 'Total Tasks', value: '35', color: '#a5b4fc' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Task board</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { col: 'To Do', color: '#94a3b8', tasks: ['Review designs', 'Write tests'] },
            { col: 'In Progress', color: '#fbbf24', tasks: ['Build API'] },
            { col: 'Done', color: '#4ade80', tasks: ['Auth flow', 'DB setup'] },
          ].map(col => (
            <div key={col.col}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{col.col}</span>
              </div>
              {col.tasks.map(t => (
                <div key={t} style={{
                  background: 'rgba(255,255,255,0.12)', borderRadius: 6,
                  padding: '5px 7px', fontSize: 10, color: 'rgba(255,255,255,0.85)',
                  marginBottom: 5, lineHeight: 1.3,
                }}>{t}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: 'flex', minHeight: '100vh', background: '#eef0f6',
    alignItems: 'center', justifyContent: 'center', padding: '24px',
  },
  card: {
    display: 'flex', width: '100%', maxWidth: 980, minHeight: 620,
    borderRadius: 20, overflow: 'hidden',
    boxShadow: '0 8px 48px rgba(0,0,0,0.12)', background: '#fff',
  },
  left: {
    flex: 1, padding: '40px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  right: {
    width: 440, background: '#3B6FF0', padding: '40px 36px',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  brandName: { fontSize: 17, fontWeight: 600, color: '#0f1729', margin: 0 },
  heading: { fontSize: 26, fontWeight: 700, color: '#0f1729', margin: '0 0 6px' },
  sub: { fontSize: 14, color: '#6b7280', margin: '0 0 20px' },
  tabRow: { display: 'flex', gap: 0, marginBottom: 18, background: '#f3f4f6', borderRadius: 10, padding: 4 },
  tabBtn: (active) => ({
    flex: 1, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: active ? 600 : 400,
    background: active ? '#fff' : 'transparent',
    color: active ? '#3B6FF0' : '#6b7280',
    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
    fontFamily: 'inherit', transition: 'all 0.15s',
  }),
  label: { fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5, display: 'block' },
  input: {
    width: '100%', height: 42, borderRadius: 10, border: '1.5px solid #e5e7eb',
    padding: '0 14px', fontSize: 14, color: '#111', background: '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  passWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0,
  },
  formGroup: { marginBottom: 10 },
  errorMsg: {
    background: '#fff1f1', border: '1px solid #fecaca', borderRadius: 8,
    padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 12,
  },
  btn: {
    width: '100%', height: 44, borderRadius: 10, background: '#3B6FF0',
    color: '#fff', border: 'none', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginTop: 6, fontFamily: 'inherit',
  },
  demoCreds: { marginTop: 12, textAlign: 'center', fontSize: 12, color: '#9ca3af' },
  rightHeading: { fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.35, margin: '0 0 8px' },
  rightSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 },
  rightFooter: { fontSize: 11, color: 'rgba(255,255,255,0.35)', paddingTop: 16 },
};

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const user = await login(loginEmail, loginPassword);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/tasks');
    } catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const user = await register(regName, regEmail, regPassword);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/tasks');
    } catch (err) {
      const msg = err.errors ? err.errors.map(e => e.message).join(', ') : (err.message || 'Registration failed');
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.left}>
          <div style={s.brandRow}>
            <FlowLogo size={36} />
            <p style={s.brandName}>TaskFlow</p>
          </div>

          <h1 style={s.heading}>{tab === 'login' ? 'Welcome back' : 'Create account'}</h1>
          <p style={s.sub}>{tab === 'login' ? 'Sign in to your workspace.' : 'Get started with TaskFlow for free.'}</p>

          <div style={s.tabRow}>
            <button style={s.tabBtn(tab === 'login')} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
            <button style={s.tabBtn(tab === 'register')} onClick={() => { setTab('register'); setError(''); }}>Sign Up</button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={s.formGroup}>
                <label style={s.label}>Email</label>
                <input style={s.input} type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="admin@test.com" required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Password</label>
                <div style={s.passWrap}>
                  <input style={{ ...s.input, paddingRight: 44 }} type={showPass ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPass(p => !p)}><EyeIcon /></button>
                </div>
              </div>
              {error && <div style={s.errorMsg}>{error}</div>}
              <button type="submit" style={s.btn} disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
              <p style={s.demoCreds}>Demo: <strong>admin@test.com</strong> / <strong>Admin123</strong></p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={s.formGroup}>
                <label style={s.label}>Full Name</label>
                <input style={s.input} type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Akash Patil" required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Email</label>
                <input style={s.input} type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="akash@example.com" required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Password</label>
                <div style={s.passWrap}>
                  <input style={{ ...s.input, paddingRight: 44 }} type={showPass ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPass(p => !p)}><EyeIcon /></button>
                </div>
              </div>
              {error && <div style={s.errorMsg}>{error}</div>}
              <button type="submit" style={s.btn} disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
            </form>
          )}
        </div>

        <div style={s.right}>
          <div>
            <h2 style={s.rightHeading}>Manage tasks,<br />ship faster.</h2>
            <p style={s.rightSub}>TaskFlow keeps your team aligned - assign tasks, track progress and hit every deadline.</p>
            <MiniDashboard />
          </div>
          <p style={s.rightFooter}>© {new Date().getFullYear()} TaskFlow. Professional Task Management.</p>
        </div>

      </div>
    </div>
  );
}