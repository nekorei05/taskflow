import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function RoleGuide({ context = 'tasks' }) {
  const { user } = useAuth();
  const { activeProject, isProjectAdmin } = useProject();
  const projectRole = activeProject?.myRole;
  const systemRole = user?.role;

  const projectAdminBullets = [
    'Create, edit, delete, and assign tasks in this project',
    'Invite or remove project members',
    'Update any task field (title, priority, due date, status)',
  ];

  const projectMemberBullets = [
    'View all tasks in projects you belong to',
    'Update status & description only on tasks assigned to you',
    'Cannot create tasks or manage members (project admin does that)',
  ];

  const bullets = isProjectAdmin ? projectAdminBullets : projectMemberBullets;
  const roleLabel = isProjectAdmin ? 'Project Admin' : 'Project Member';

  return (
    <div className="role-guide glass">
      <div className="role-guide-header">
        <span className={`role-badge ${isProjectAdmin ? 'admin' : ''}`}>{roleLabel}</span>
        {activeProject && (
          <span className="role-guide-project">
            on <strong>{activeProject.name}</strong>
          </span>
        )}
        {systemRole === 'admin' && (
          <span className="role-guide-system"> · System admin (Users page only)</span>
        )}
      </div>
      {context === 'tasks' && (
        <ul className="role-guide-list">
          {bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {context === 'projects' && !isProjectAdmin && (
        <p className="role-guide-hint">
          You are a member on this project. Switch to a project where you are admin to invite teammates.
        </p>
      )}
      {context === 'projects' && isProjectAdmin && (
        <p className="role-guide-hint">
          As project admin you can add existing users to the team (no email is sent).
        </p>
      )}
      {projectRole && (
        <p className="role-guide-meta">
          Your role here: <strong>{projectRole}</strong>
          {!isProjectAdmin && ' — open “Assigned to me” to work on your tasks.'}
        </p>
      )}
    </div>
  );
}
