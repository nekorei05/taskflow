const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
  updateMemberRole,
  getInviteCandidates,
  getProjectDashboard,
} = require('../../controllers/projectController');
const { protect } = require('../../middleware/auth');
const { loadProject, requireProjectAdmin } = require('../../middleware/projectAuth');
const validate = require('../../middleware/validate');
const {
  createProjectValidation,
  updateProjectValidation,
  inviteMemberValidation,
  updateMemberRoleValidation,
  memberIdParamValidation,
} = require('../../validators/projectValidators');

router.use(protect);

router.get('/', getProjects);
router.post('/', createProjectValidation, validate, createProject);

router.get('/:id/dashboard', loadProject, getProjectDashboard);
router.get('/:id/invite-candidates', loadProject, requireProjectAdmin, getInviteCandidates);
router.get('/:id', loadProject, getProject);
router.patch('/:id', loadProject, requireProjectAdmin, updateProjectValidation, validate, updateProject);
router.delete('/:id', loadProject, requireProjectAdmin, deleteProject);

router.post('/:id/members', loadProject, requireProjectAdmin, inviteMemberValidation, validate, inviteMember);
router.patch(
  '/:id/members/:userId',
  loadProject,
  requireProjectAdmin,
  updateMemberRoleValidation,
  validate,
  updateMemberRole
);
router.delete(
  '/:id/members/:userId',
  loadProject,
  requireProjectAdmin,
  memberIdParamValidation,
  validate,
  removeMember
);

module.exports = router;
