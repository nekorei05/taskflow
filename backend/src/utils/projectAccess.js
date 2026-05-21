const Project = require('../models/Project');

const loadProjectById = async (projectId) => {
  if (!projectId) return null;
  return Project.findById(projectId);
};

const assertProjectMember = (project, userId) => {
  if (!project) return { ok: false, status: 404, message: 'Project not found' };
  if (!project.isMember(userId)) {
    return { ok: false, status: 403, message: 'You are not a member of this project' };
  }
  return { ok: true, role: project.getMemberRole(userId) };
};

const assertProjectAdmin = (project, userId) => {
  const memberCheck = assertProjectMember(project, userId);
  if (!memberCheck.ok) return memberCheck;
  if (!project.isAdmin(userId)) {
    return { ok: false, status: 403, message: 'Project admin access required' };
  }
  return { ok: true, role: 'admin' };
};

const assertAssigneeIsMember = (project, assigneeId) => {
  if (!assigneeId) return { ok: true };
  if (!project.isMember(assigneeId)) {
    return { ok: false, status: 400, message: 'Assignee must be a project member' };
  }
  return { ok: true };
};

module.exports = {
  loadProjectById,
  assertProjectMember,
  assertProjectAdmin,
  assertAssigneeIsMember,
};
