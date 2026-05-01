const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../../controllers/taskController');
const { protect, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createTaskValidation, updateTaskValidation } = require('../../validators/taskValidators');

router.get('/stats', protect, authorize('admin'), getTaskStats);
router.get('/', protect, getTasks);
router.post('/', protect, createTaskValidation, validate, createTask);
router.get('/:id', protect, getTask);
router.patch('/:id', protect, updateTaskValidation, validate, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
