import { useProject } from '../context/ProjectContext';

export default function RoleGuide() {
  const { activeProject, isProjectAdmin } = useProject();

  if (!activeProject) return null;
  const line1 = isProjectAdmin
  ? 'You run this project : create tasks, assign people and drag cards on the board.'
  : 'You can update tasks assigned to you and track progress on the board.';


  return (
    <div className="role-guide glass role-guide-compact">
      <p className="role-guide-lines">
        <span className={`role-badge ${isProjectAdmin ? 'admin' : ''}`} style={{ marginRight: 8 }}>
          {isProjectAdmin ? 'Admin' : 'Member'}
        </span>
        {line1} 
      </p>
    </div>
  );
}
