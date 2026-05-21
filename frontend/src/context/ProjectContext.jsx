import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

const idStr = (id) => (id == null ? '' : String(id));

export function ProjectProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const pickDefaultProject = (list) => {
    if (!list.length) return '';
    const stored = localStorage.getItem('activeProjectId');
    const match = list.find((p) => idStr(p._id) === idStr(stored));
    if (match) return idStr(match._id);
    const withTasks = list.find((p) => p.taskCount > 0);
    return idStr((withTasks || list[0])._id);
  };

  const loadProjects = useCallback(async () => {
    if (!user || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await api.getProjects();
      const list = res.data.projects || [];
      setProjects(list);
      const nextId = pickDefaultProject(list);
      setActiveProjectId(nextId);
      if (nextId) localStorage.setItem('activeProjectId', nextId);
      else localStorage.removeItem('activeProjectId');
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
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
    const sid = idStr(id);
    setActiveProjectId(sid);
    localStorage.setItem('activeProjectId', sid);
  };

  const activeProject = projects.find((p) => idStr(p._id) === idStr(activeProjectId)) || null;
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
