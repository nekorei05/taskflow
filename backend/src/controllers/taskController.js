const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const logger = require('../utils/logger');
const { logActivity, statusLabel } = require('../utils/activityLogger');
const {
  loadProjectById,
  assertProjectMember,
  assertProjectAdmin,
  assertAssigneeIsMember,
} = require('../utils/projectAccess');
const { canMemberUpdateTask, isTaskAssignee } = require('../utils/taskAccess');

const populateTask = (query) =>
  query
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name');

const mapTask = (task) => {
  const t = task.toObject ? task.toObject({ virtuals: true }) : task;
  return {
    ...t,
    isOverdue: t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed',
  };
};

const resolveProjectAccess = async (projectId, userId) => {
  const project = await loadProjectById(projectId);
  return { project, access: assertProjectMember(project, userId) };
};

const getMemberProjectIds = async (userId) => {
  const projects = await Project.find({ 'members.userId': userId }).select('_id').lean();
  return projects.map((p) => p._id);
};

const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      page = 1,
      limit = 10,
      sort = '-createdAt',
      projectId,
      assignedTo,
      assignedToMe,
      overdue,
    } = req.query;

    const filter = {};

    if (projectId) {
      const { project, access } = await resolveProjectAccess(projectId, req.user._id);
      if (!access.ok) {
        return res.status(access.status).json({ success: false, message: access.message });
      }
      filter.projectId = project._id;
    } else {
      const projectIds = await getMemberProjectIds(req.user._id);
      if (projectIds.length === 0) {
        filter._id = { $in: [] };
      } else {
        filter.projectId = { $in: projectIds };
      }
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (assignedToMe === 'true') {
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: 'completed' };
    }

    const sortDirection = sort.startsWith('-') ? '-' : '';
    const sortField = sort.replace('-', '');
    const sortObj = { [sortField]: sortDirection ? -1 : 1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const tasks = await populateTask(
      Task.find(filter).sort(sortObj).limit(limitNum).skip(skip)
    ).lean();

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        tasks: tasks.map(mapTask),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAssignedToMe = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const projectIds = await getMemberProjectIds(req.user._id);

    const filter = {
      projectId: { $in: projectIds },
      assignedTo: req.user._id,
    };
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const tasks = await populateTask(
      Task.find(filter).sort('-updatedAt').limit(limitNum).skip(skip)
    ).lean();

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        tasks: tasks.map(mapTask),
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await populateTask(Task.findById(req.params.id));
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { access } = await resolveProjectAccess(task.projectId, req.user._id);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    res.status(200).json({ success: true, data: { task: mapTask(task) } });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags, projectId, assignedTo } =
      req.body;

    const { project, access } = await resolveProjectAccess(projectId, req.user._id);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const adminCheck = assertProjectAdmin(project, req.user._id);
    if (!adminCheck.ok) {
      return res.status(403).json({
        success: false,
        message: 'Only project admins can create tasks',
      });
    }

    const assigneeCheck = assertAssigneeIsMember(project, assignedTo);
    if (!assigneeCheck.ok) {
      return res.status(assigneeCheck.status).json({ success: false, message: assigneeCheck.message });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      projectId: project._id,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      ownerId: req.user._id,
    });

    logger.info(`Task created: "${title}" in project ${projectId} by ${req.user.email}`);

    await logActivity({
      projectId: project._id,
      taskId: task._id,
      actorId: req.user._id,
      type: 'task_created',
      message: `${req.user.name} created "${title}"`,
    });

    const populated = await populateTask(Task.findById(task._id));

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: mapTask(populated) },
    });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { project, access } = await resolveProjectAccess(task.projectId, req.user._id);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const isAdmin = project.isAdmin(req.user._id);
    const prevStatus = task.status;
    const prevDue = task.dueDate ? task.dueDate.toISOString() : null;
    const prevAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    if (!isAdmin && !canMemberUpdateTask(task, req.user._id, req.body)) {
      const assigned = isTaskAssignee(task, req.user._id);
      return res.status(403).json({
        success: false,
        message: assigned
          ? 'You can only change status and description on your assigned tasks'
          : 'This task is not assigned to you. Ask a project admin to assign it.',
      });
    }

    const adminFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags', 'assignedTo'];
    const memberFields = ['status', 'description'];

    const fields = isAdmin ? adminFields : memberFields;
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    if (isAdmin && req.body.assignedTo !== undefined) {
      const assigneeCheck = assertAssigneeIsMember(project, req.body.assignedTo);
      if (!assigneeCheck.ok) {
        return res.status(assigneeCheck.status).json({ success: false, message: assigneeCheck.message });
      }
      task.assignedTo = req.body.assignedTo || null;
    }

    await task.save();
    const populated = await populateTask(Task.findById(task._id));

    logger.info(`Task updated: ${task._id} by ${req.user.email}`);

    if (req.body.status !== undefined && req.body.status !== prevStatus) {
      await logActivity({
        projectId: task.projectId,
        taskId: task._id,
        actorId: req.user._id,
        type: 'status_changed',
        message: `${req.user.name} moved "${task.title}" to ${statusLabel(task.status)}`,
        meta: { from: prevStatus, to: task.status },
      });
    }
    if (req.body.dueDate !== undefined) {
      const nextDue = task.dueDate ? task.dueDate.toISOString() : null;
      if (nextDue !== prevDue) {
        await logActivity({
          projectId: task.projectId,
          taskId: task._id,
          actorId: req.user._id,
          type: 'due_date_updated',
          message: `${req.user.name} updated due date on "${task.title}"`,
          meta: { dueDate: task.dueDate },
        });
      }
    }
    if (isAdmin && req.body.assignedTo !== undefined) {
      const nextAssignee = task.assignedTo ? task.assignedTo.toString() : null;
      if (nextAssignee !== prevAssignee) {
        const assignee = task.assignedTo ? await User.findById(task.assignedTo).select('name') : null;
        await logActivity({
          projectId: task.projectId,
          taskId: task._id,
          actorId: req.user._id,
          type: 'task_assigned',
          message: assignee
            ? `${req.user.name} assigned "${task.title}" to ${assignee.name}`
            : `${req.user.name} unassigned "${task.title}"`,
          meta: { assigneeId: task.assignedTo },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task: mapTask(populated) },
    });
  } catch (err) {
    next(err);
  }
};

const assignTask = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { project, access } = await resolveProjectAccess(task.projectId, req.user._id);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const adminCheck = assertProjectAdmin(project, req.user._id);
    if (!adminCheck.ok) {
      return res.status(adminCheck.status).json({ success: false, message: adminCheck.message });
    }

    const assigneeCheck = assertAssigneeIsMember(project, assignedTo);
    if (!assigneeCheck.ok) {
      return res.status(assigneeCheck.status).json({ success: false, message: assigneeCheck.message });
    }

    task.assignedTo = assignedTo || null;
    await task.save();

    const assignee = assignedTo ? await User.findById(assignedTo).select('name') : null;
    await logActivity({
      projectId: task.projectId,
      taskId: task._id,
      actorId: req.user._id,
      type: 'task_assigned',
      message: assignee
        ? `${req.user.name} assigned "${task.title}" to ${assignee.name}`
        : `${req.user.name} unassigned "${task.title}"`,
      meta: { assigneeId: assignedTo },
    });

    const populated = await populateTask(Task.findById(task._id));

    res.status(200).json({
      success: true,
      message: 'Task assignment updated',
      data: { task: mapTask(populated) },
    });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { project, access } = await resolveProjectAccess(task.projectId, req.user._id);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const adminCheck = assertProjectAdmin(project, req.user._id);
    if (!adminCheck.ok) {
      return res.status(adminCheck.status).json({ success: false, message: adminCheck.message });
    }

    await Task.findByIdAndDelete(req.params.id);
    logger.info(`Task deleted: ${req.params.id} by ${req.user.email}`);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getUserDashboard = async (req, res, next) => {
  try {
    const projectIds = await getMemberProjectIds(req.user._id);
    const now = new Date();

    const [assignedToMe, overdueAssigned, statusBreakdown, perProject] = await Promise.all([
      Task.countDocuments({ projectId: { $in: projectIds }, assignedTo: req.user._id }),
      Task.countDocuments({
        projectId: { $in: projectIds },
        assignedTo: req.user._id,
        dueDate: { $lt: now },
        status: { $ne: 'completed' },
      }),
      Task.aggregate([
        { $match: { projectId: { $in: projectIds }, assignedTo: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { projectId: { $in: projectIds } } },
        {
          $group: {
            _id: '$projectId',
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$status', 'completed'] },
                      { $lt: ['$dueDate', now] },
                      { $ne: ['$dueDate', null] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'project',
          },
        },
        { $unwind: '$project' },
        {
          $project: {
            projectId: '$_id',
            name: '$project.name',
            total: 1,
            completed: 1,
            overdue: 1,
            completionPercent: {
              $cond: [
                { $eq: ['$total', 0] },
                0,
                { $round: [{ $multiply: [{ $divide: ['$completed', '$total'] }, 100] }, 0] },
              ],
            },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tasksAssignedToMe: assignedToMe,
        overdueAssignedToMe: overdueAssigned,
        myTaskStatusBreakdown: statusBreakdown,
        tasksPerProject: perProject,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const match = {};

    if (projectId) {
      const { project, access } = await resolveProjectAccess(projectId, req.user._id);
      if (!access.ok) {
        return res.status(access.status).json({ success: false, message: access.message });
      }
      match.projectId = project._id;
    } else if (req.user.role !== 'admin') {
      const projectIds = await getMemberProjectIds(req.user._id);
      match.projectId = { $in: projectIds };
    }

    const now = new Date();

    const [statusStats, priorityStats, overdueCount, perUser] = await Promise.all([
      Task.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: match }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments({
        ...match,
        dueDate: { $lt: now },
        status: { $ne: 'completed' },
      }),
      Task.aggregate([
        { $match: { ...match, assignedTo: { $ne: null } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $project: { userId: '$_id', name: '$user.name', count: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: statusStats,
        priorityBreakdown: priorityStats,
        overdueTasks: overdueCount,
        tasksPerUser: perUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  getAssignedToMe,
  getUserDashboard,
  getTaskStats,
};
