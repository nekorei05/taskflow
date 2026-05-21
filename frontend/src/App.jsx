import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import StatsSection from './pages/StatsSection';
import TasksSection from './pages/TasksSection';
import ProjectsSection from './pages/ProjectsSection';
import ActivitySection from './pages/ActivitySection';
import AdminSection from './pages/AdminSection';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner full"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner full"><div className="spinner" /></div>;
  return user ? <Navigate to="/tasks" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Screen */}
          <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />
          
          {/* Authenticated Application Page Routes */}
          <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route path="/dashboard" element={<StatsSection />} />
            <Route path="/tasks" element={<TasksSection />} />
            <Route path="/projects" element={<ProjectsSection />} />
            <Route path="/activity" element={<ActivitySection />} />
            <Route path="/admin" element={<AdminSection />} />
          </Route>
          
          {/* Wildcard Fallback redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
