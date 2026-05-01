const Task = require('../models/Task');
const User = require('../models/User');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    const where = req.user.role === 'admin' ? {} : { ownerId: req.user.id };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const orderDirection = sort.startsWith('-') ? 'DESC' : 'ASC';
    const orderField = sort.replace('-', '');

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }],
      order: [[orderField, orderDirection]],
      limit: parseInt(limit),
      offset,
    });

    const mappedTasks = tasks.map(t => {
      const taskObj = t.toJSON();
      taskObj._id = taskObj.id;
      taskObj.isOverdue = t.isOverdue;
      return taskObj;
    });

    res.status(200).json({
      success: true,
      data: {
        tasks: mappedTasks,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
      },
    });
  } catch (err) { next(err); }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, { include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }] });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role !== 'admin' && task.ownerId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    const taskObj = task.toJSON();
    taskObj._id = taskObj.id;
    taskObj.isOverdue = task.isOverdue;

    res.status(200).json({ success: true, data: { task: taskObj } });
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;
    const task = await Task.create({ title, description, status, priority, dueDate, tags, ownerId: req.user.id });
    
    logger.info(`Task created: "${title}" by ${req.user.email}`);
    const taskObj = task.toJSON();
    taskObj._id = taskObj.id;
    res.status(201).json({ success: true, message: 'Task created successfully', data: { task: taskObj } });
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role !== 'admin' && task.ownerId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
    allowedFields.forEach((field) => { if (req.body[field] !== undefined) task[field] = req.body[field]; });

    await task.save();
    await task.reload({ include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }] });

    logger.info(`Task updated: ${task.id} by ${req.user.email}`);
    const taskObj = task.toJSON();
    taskObj._id = taskObj.id;
    res.status(200).json({ success: true, message: 'Task updated successfully', data: { task: taskObj } });
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role !== 'admin' && task.ownerId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    await task.destroy();
    logger.info(`Task deleted: ${req.params.id} by ${req.user.email}`);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) { next(err); }
};

const getTaskStats = async (req, res, next) => {
  try {
    const statusStats = await Task.findAll({
      attributes: ['status', [Task.sequelize.fn('COUNT', '*'), 'count']],
      group: ['status']
    });
    
    const priorityStats = await Task.findAll({
      attributes: ['priority', [Task.sequelize.fn('COUNT', '*'), 'count']],
      group: ['priority']
    });

    const statusBreakdown = statusStats.map(s => ({ _id: s.status, count: s.getDataValue('count') }));
    const priorityBreakdown = priorityStats.map(p => ({ _id: p.priority, count: p.getDataValue('count') }));

    res.status(200).json({ success: true, data: { statusBreakdown, priorityBreakdown } });
  } catch (err) { next(err); }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats };
