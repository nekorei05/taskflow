import { useAuth } from '../context/AuthContext';
import { ProjectProvider } from '../context/ProjectContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <div className="loading-spinner full"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/" replace />;

  let activeSection = 'tasks';
  const path = location.pathname;
  if (path.startsWith('/dashboard')) activeSection = 'stats';
  else if (path.startsWith('/tasks')) activeSection = 'tasks';
  else if (path.startsWith('/projects')) activeSection = 'projects';
  else if (path.startsWith('/activity')) activeSection = 'activity';
  else if (path.startsWith('/admin')) activeSection = 'admin';

  const handleSectionChange = (s) => {
    if (s === 'admin' && user.role !== 'admin') return;
    if (s === 'stats') {
      navigate('/dashboard');
    } else {
      navigate(`/${s}`);
    }
  };

  return (
    <ProjectProvider>
      <div className="dashboard-container">
        <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </ProjectProvider>
  );
}
