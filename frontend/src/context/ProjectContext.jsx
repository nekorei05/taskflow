import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(
    () => localStorage.getItem('activeProjectId') || ''
  );
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getProjects();
      const list = res.data.projects || [];
      setProjects(list);
      const stored = localStorage.getItem('activeProjectId');
      if (list.length && !list.find((p) => p._id === stored)) {
        const next = list[0]._id;
        setActiveProjectId(next);
        localStorage.setItem('activeProjectId', next);
      }
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setActiveProjectId('');
      localStorage.removeItem('activeProjectId');
      return;
    }
    loadProjects();
  }, [user, loadProjects]);

  const selectProject = (id) => {
    setActiveProjectId(id);
    localStorage.setItem('activeProjectId', id);
  };

  const activeProject = projects.find((p) => p._id === activeProjectId) || null;
  const isProjectAdmin = activeProject?.myRole === 'admin';

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        isProjectAdmin,
        loading,
        loadProjects,
        selectProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext);
