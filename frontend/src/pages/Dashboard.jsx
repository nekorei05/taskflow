import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProjectProvider } from '../context/ProjectContext';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TasksSection from './TasksSection';
import ProjectsSection from './ProjectsSection';
import AdminSection from './AdminSection';
import StatsSection from './StatsSection';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [section, setSection] = useState('tasks');

  if (loading) return <div className="loading-spinner full"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/" replace />;

  const handleSectionChange = (s) => {
    if ((s === 'admin') && user.role !== 'admin') return;
    setSection(s);
  };

  return (
    <ProjectProvider>
      <div className="dashboard-container">
        <Sidebar activeSection={section} onSectionChange={handleSectionChange} />
        <main className="content-area">
          {section === 'tasks' && <TasksSection />}
          {section === 'projects' && <ProjectsSection />}
          {section === 'stats' && <StatsSection />}
          {section === 'admin' && user.role === 'admin' && <AdminSection />}
        </main>
      </div>
    </ProjectProvider>
  );
}
