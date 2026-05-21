const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  getAssignedToMe,
  getUserDashboard,
  getTaskStats,
} = require('../../controllers/taskController');
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const {
  createTaskValidation,
  updateTaskValidation,
  assignTaskValidation,
  taskQueryValidation,
} = require('../../validators/taskValidators');

router.get('/dashboard', protect, getUserDashboard);
router.get('/assigned/me', protect, getAssignedToMe);
router.get('/stats', protect, getTaskStats);
router.get('/', protect, taskQueryValidation, validate, getTasks);
router.post('/', protect, createTaskValidation, validate, createTask);
router.patch('/:id/assign', protect, assignTaskValidation, validate, assignTask);
router.get('/:id', protect, getTask);
router.patch('/:id', protect, updateTaskValidation, validate, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
