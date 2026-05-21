import { useProject } from '../context/ProjectContext';

export default function RoleGuide() {
  const { activeProject, isProjectAdmin } = useProject();

  if (!activeProject) return null;

  const line1 = isProjectAdmin
    ? 'You can create tasks, assign teammates, and move work on the board.'
    : 'You can view the board and update tasks assigned to you.';

  const line2 = isProjectAdmin
    ? 'Use the sidebar to switch projects — task counts show how many are in each.'
    : 'Filter “Assigned to me” for your work, or “All in project” to see the full team.';

  return (
    <div className="role-guide glass role-guide-compact">
      <span className={`role-badge ${isProjectAdmin ? 'admin' : ''}`}>
        {isProjectAdmin ? 'Project admin' : 'Project member'}
      </span>
      <span className="role-guide-project"> · {activeProject.name}</span>
      <p className="role-guide-lines">{line1} {line2}</p>
    </div>
  );
}
