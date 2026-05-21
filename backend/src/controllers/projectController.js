const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const logger = require('../utils/logger');
const { toIdString } = require('../utils/memberId');

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ 'members.userId': req.user._id })
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 })
      .lean();

    const data = projects.map((p) => ({
      ...p,
      memberCount: p.members.length,
      myRole: p.members.find((m) => toIdString(m.userId) === toIdString(req.user._id))?.role,
    }));

    res.status(200).json({ success: true, data: { projects: data } });
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        project: {
          ...req.project.toObject(),
          myRole: req.projectRole,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description: description || '',
      createdBy: req.user._id,
      members: [{ userId: req.user._id, role: 'admin' }],
    });

    await project.populate('createdBy', 'name email');
    await project.populate('members.userId', 'name email');

    logger.info(`Project created: "${name}" by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: { ...project.toObject(), myRole: 'admin' } },
    });
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (name !== undefined) req.project.name = name;
    if (description !== undefined) req.project.description = description;

    await req.project.save();
    await req.project.populate('createdBy', 'name email');
    await req.project.populate('members.userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project: { ...req.project.toObject(), myRole: req.projectRole } },
    });
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await Task.deleteMany({ projectId: req.project._id });
    await Project.findByIdAndDelete(req.project._id);

    logger.info(`Project deleted: ${req.project._id} by ${req.user.email}`);

    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const { email, userId, role = 'member' } = req.body;

    let user = null;
    if (userId) {
      user = await User.findOne({ _id: userId, isActive: true });
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide email or userId of an existing user to add',
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'No account with that email. Teammate must sign up first (no email is sent — we only add existing users).',
      });
    }

    if (req.project.isMember(user._id)) {
      return res.status(400).json({ success: false, message: 'User is already a project member' });
    }

    req.project.members.push({ userId: user._id, role });
    await req.project.save();
    await req.project.populate('members.userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member invited successfully',
      data: { members: req.project.members },
    });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (toIdString(userId) === toIdString(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Use leave project to remove yourself' });
    }

    const admins = req.project.members.filter((m) => m.role === 'admin');
    const target = req.project.members.find((m) => toIdString(m.userId) === toIdString(userId));

    if (!target) {
      return res.status(404).json({ success: false, message: 'Member not found in project' });
    }

    if (target.role === 'admin' && admins.length <= 1) {
      return res.status(400).json({ success: false, message: 'Cannot remove the only project admin' });
    }

    req.project.members = req.project.members.filter(
      (m) => toIdString(m.userId) !== toIdString(userId)
    );
    await req.project.save();

    await Task.updateMany(
      { projectId: req.project._id, assignedTo: userId },
      { $set: { assignedTo: null } }
    );

    res.status(200).json({ success: true, message: 'Member removed successfully' });
  } catch (err) {
    next(err);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const member = req.project.members.find((m) => toIdString(m.userId) === toIdString(userId));
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in project' });
    }

    const adminCount = req.project.members.filter((m) => m.role === 'admin').length;
    if (member.role === 'admin' && role === 'member' && adminCount <= 1) {
      return res.status(400).json({ success: false, message: 'Project must have at least one admin' });
    }

    member.role = role;
    await req.project.save();
    await req.project.populate('members.userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member role updated',
      data: { members: req.project.members },
    });
  } catch (err) {
    next(err);
  }
};

/** Users who exist in the app but are not yet on this project (for invite UI) */
const getInviteCandidates = async (req, res, next) => {
  try {
    const memberIds = req.project.members.map((m) => toIdString(m.userId));
    const users = await User.find({
      isActive: true,
      _id: { $nin: memberIds },
    })
      .select('name email')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({ success: true, data: { users } });
  } catch (err) {
    next(err);
  }
};

const getProjectDashboard = async (req, res, next) => {
  try {
    const projectId = req.project._id;
    const now = new Date();

    const [statusBreakdown, perUser, overdueCount, totalTasks] = await Promise.all([
      Task.aggregate([
        { $match: { projectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { projectId, assignedTo: { $ne: null } } },
        {
          $group: {
            _id: '$assignedTo',
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            email: '$user.email',
            total: 1,
            completed: 1,
            open: { $subtract: ['$total', '$completed'] },
          },
        },
      ]),
      Task.countDocuments({
        projectId,
        dueDate: { $lt: now },
        status: { $ne: 'completed' },
      }),
      Task.countDocuments({ projectId }),
    ]);

    const completed =
      statusBreakdown.find((s) => s._id === 'completed')?.count || 0;
    const completionPercent = totalTasks
      ? Math.round((completed / totalTasks) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        projectId,
        projectName: req.project.name,
        totalTasks,
        overdueTasks: overdueCount,
        completionPercent,
        statusBreakdown,
        tasksPerUser: perUser,
        progress: {
          completed,
          remaining: totalTasks - completed,
          completionPercent,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
