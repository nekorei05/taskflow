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

function FlowLogo({ size = 34 }) {
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
    <div style={{ marginTop: 20 }}>
      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Completed', value: '24', icon: '✓', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#059669' },
          { label: 'In Progress', value: '8',  icon: '↻', iconBg: 'rgba(245,158,11,0.12)', iconColor: '#d97706' },
          { label: 'Overdue',     value: '3',  icon: '!', iconBg: 'rgba(239,68,68,0.12)', iconColor: '#dc2626' },
          { label: 'Total',       value: '35', icon: '#', iconBg: 'rgba(100,116,139,0.12)', iconColor: '#475569' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(255, 255, 255, 0.45)', 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 12, 
            padding: '11px 14px',
            border: '1px solid rgba(255, 255, 255, 0.45)',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: stat.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: stat.iconColor, fontWeight: 700, flexShrink: 0,
            }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f1729', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 3, fontWeight: 600 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board Preview */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.45)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 14,
        padding: '16px', 
        border: '1px solid rgba(255, 255, 255, 0.45)',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Task board</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {[
            { col: 'To Do',       color: '#475569', tasks: ['Review designs', 'Write tests'] },
            { col: 'In Progress', color: '#b45309', tasks: ['Build API'] }, 
            { col: 'Done',        color: '#16a34a', tasks: ['Auth flow', 'DB setup'] },    
          ].map(col => (
            <div key={col.col}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: col.color,
                marginBottom: 8, paddingBottom: 5,
                borderBottom: `1px solid rgba(0, 0, 0, 0.05)`,
              }}>{col.col}</div>
              {col.tasks.map(t => (
                <div key={t} style={{
                  background: 'rgba(255, 255, 255, 0.85)', 
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)', 
                  borderRadius: 6, padding: '7px 9px',
                  fontSize: 10, color: '#1e293b', marginBottom: 5, lineHeight: 1.35, fontWeight: 600,
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
    alignItems: 'center', justifyContent: 'center', padding: '20px',
    boxSizing: 'border-box'
  },
  card: {
    display: 'flex', width: '100%', maxWidth: 940, minHeight: 580, // Optimized height balance
    borderRadius: 22, overflow: 'hidden', flexWrap: 'wrap',
    boxShadow: '0 12px 64px rgba(15,23,42,0.08)', background: '#fff',
  },
  left: {
    flex: '1 1 460px', padding: '40px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    boxSizing: 'border-box'
  },
  formContainer: {
    maxWidth: 340,
    width: '100%'
  },
  right: {
    width: 420, padding: '40px 36px', boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, 
    background: 'linear-gradient(145deg, #2d5be3 0%, #3B6FF0 50%, #4f7ff2 100%)',
    flexShrink: 0
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  brandName: { fontSize: 17, fontWeight: 600, color: '#0f1729', margin: 0 },
  heading: { fontSize: 25, fontWeight: 700, color: '#0f1729', margin: '0 0 5px', letterSpacing: '-0.5px' },
  sub: { fontSize: 14, color: '#64748b', margin: '0 0 20px' },
  tabRow: { display: 'flex', gap: 0, marginBottom: 18, background: '#f1f5f9', borderRadius: 10, padding: 4 },
  tabBtn: (active) => ({
    flex: 1, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: active ? 600 : 500,
    background: active ? '#fff' : 'transparent',
    color: active ? '#3B6FF0' : '#64748b',
    boxShadow: active ? '0 2px 6px rgba(15,23,42,0.06)' : 'none',
    fontFamily: 'inherit', transition: 'all 0.2s ease',
  }),
  label: { fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 5, display: 'block' },
  input: {
    width: '100%', height: 40, borderRadius: 9, border: '1.5px solid #e2e8f0', 
    padding: '0 14px', fontSize: 14, color: '#0f1729', background: '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  passWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  formGroup: { marginBottom: 12 },
  errorMsg: {
    background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8,
    padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 12,
  },
  btn: {
    width: '100%', height: 42, borderRadius: 9, background: '#3B6FF0',
    color: '#fff', border: 'none', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', marginTop: 6, fontFamily: 'inherit',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
  },
  demoCreds: { marginTop: 14, textAlign: 'center', fontSize: 12, color: '#94a3b8' },
  rightHeading: { fontSize: 25, fontWeight: 800, color: '#fff', lineHeight: 1.25, margin: 0, letterSpacing: '-0.5px' },
  rightSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 },
  rightFooter: { fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, textAlign: 'center', letterSpacing: '0.02em' },
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

  useState(() => {
    if (typeof window !== 'undefined' && !document.getElementById('auth-styles-override')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'auth-styles-override';
      styleTag.innerHTML = `
        .tf-submit-btn:hover { background-color: #2555d6 !important; }
        .tf-submit-btn:active { transform: scale(0.985); }
        .tf-form-fade { animation: tfFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes tfFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) {
          .tf-right-panel { display: none !important; }
          .tf-card-wrap { max-width: 480px !important; min-height: auto !important; }
          .tf-left-panel { padding: 36px 28px !important; flex: 1 1 100% !important; }
        }
      `;
      document.head.appendChild(styleTag);
    }
  }, []);

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
      <div className="tf-card-wrap" style={s.card}>

        {/* Left Interactive Auth Form Block */}
        <div className="tf-left-panel" style={s.left}>
          <div style={s.formContainer}>
            <div style={s.brandRow}>
              <FlowLogo size={34} />
              <p style={s.brandName}>TaskFlow</p>
            </div>

            <h1 style={s.heading}>{tab === 'login' ? 'Welcome back' : 'Create account'}</h1>
            <p style={s.sub}>{tab === 'login' ? 'Sign in to your workspace.' : 'Get started with TaskFlow for free.'}</p>

            <div style={s.tabRow}>
              <button style={s.tabBtn(tab === 'login')} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
              <button style={s.tabBtn(tab === 'register')} onClick={() => { setTab('register'); setError(''); }}>Sign Up</button>
            </div>

            {tab === 'login' ? (
              <form key="login-form" className="tf-form-fade" onSubmit={handleLogin}>
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
                <button type="submit" className="tf-submit-btn" style={s.btn} disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
                <p style={s.demoCreds}>Demo: <strong>admin@test.com</strong> / <strong>Admin123</strong></p>
              </form>
            ) : (
              <form key="register-form" className="tf-form-fade" onSubmit={handleRegister}>
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
                <button type="submit" className="tf-submit-btn" style={s.btn} disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
              </form>
            )}
          </div>
        </div>

        {/* Right Product Spotlight Sidebar Panel */}
        <div className="tf-right-panel" style={s.right}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={s.rightHeading}>Manage tasks,<br />ship faster.</h2>
            <p style={s.rightSub}>TaskFlow keeps your team aligned - assign tasks, track progress and hit every deadline.</p>
          </div>
          
          <MiniDashboard />
          
  <p style={s.rightFooter}>© {new Date().getFullYear()} TaskFlow</p>        </div>

      </div>
    </div>
  );
}
