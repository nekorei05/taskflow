import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(loginEmail, loginPassword);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await register(regName, regEmail, regPassword);
      toast.success(`Account created! Welcome, ${user.name} 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.errors ? err.errors.map(e => e.message).join(', ') : (err.message || 'Registration failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-icon"><CheckIcon /></div>
          <h1>TaskFlow</h1>
          <p className="auth-tagline">Professional Task Management</p>
        </div>

        <div className="auth-tabs">
          <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
            Sign In
          </button>
          <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
            Sign Up
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="admin@test.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input type={showPass ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(p => !p)}><EyeIcon /></button>
              </div>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Sign In'}
            </button>
            <p className="demo-creds">Demo admin: <strong>admin@test.com / Admin123</strong></p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="john@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input type={showPass ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(p => !p)}><EyeIcon /></button>
              </div>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
