const { body, query } = require('express-validator');

const createTaskValidation = [
  body('projectId')
    .notEmpty()
    .withMessage('projectId is required')
    .isMongoId()
    .withMessage('Valid projectId is required'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3–100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('assignedTo must be a valid user id'),
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3–100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),

  body('assignedTo')
    .optional({ nullable: true })
    .custom((value) => value === null || /^[a-f\d]{24}$/i.test(value))
    .withMessage('assignedTo must be a valid user id or null'),
];

const assignTaskValidation = [
  body('assignedTo')
    .optional({ nullable: true })
    .custom((value) => value === null || /^[a-f\d]{24}$/i.test(value))
    .withMessage('assignedTo must be a valid user id or null'),
];

const taskQueryValidation = [
  query('projectId').optional().isMongoId().withMessage('Invalid projectId'),
  query('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo filter'),
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  assignTaskValidation,
  taskQueryValidation,
};
