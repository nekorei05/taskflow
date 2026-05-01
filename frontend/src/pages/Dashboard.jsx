import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TasksSection from './TasksSection';
import AdminSection from './AdminSection';
import StatsSection from './StatsSection';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [section, setSection] = useState('tasks');

  if (loading) return <div className="loading-spinner full"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/" replace />;

  const handleSectionChange = (s) => {
    // If non-admin tries to access admin sections, redirect to tasks
    if ((s === 'admin' || s === 'stats') && user.role !== 'admin') return;
    setSection(s);
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeSection={section} onSectionChange={handleSectionChange} />
      <main className="content-area">
        {section === 'tasks' && <TasksSection />}
        {section === 'admin' && user.role === 'admin' && <AdminSection />}
        {section === 'stats' && user.role === 'admin' && <StatsSection />}
      </main>
    </div>
  );
}
