const Project = require('../models/Project');

const loadProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!project.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project',
      });
    }

    req.project = project;
    req.projectRole = project.getMemberRole(req.user._id);
    next();
  } catch (err) {
    next(err);
  }
};

const requireProjectAdmin = (req, res, next) => {
  if (req.projectRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Project admin access required',
    });
  }
  next();
};

module.exports = { loadProject, requireProjectAdmin };
