const { body, param } = require('express-validator');

const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2–100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

const updateProjectValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2–100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

const inviteMemberValidation = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Valid userId is required'),
  body('role')
    .optional()
    .isIn(['admin', 'member'])
    .withMessage('Role must be admin or member'),
  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.userId) {
      throw new Error('Provide email or userId');
    }
    return true;
  }),
];

const updateMemberRoleValidation = [
  param('userId').isMongoId().withMessage('Valid user id is required'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'member'])
    .withMessage('Role must be admin or member'),
];

const memberIdParamValidation = [
  param('userId').isMongoId().withMessage('Valid user id is required'),
];

module.exports = {
  createProjectValidation,
  updateProjectValidation,
  inviteMemberValidation,
  updateMemberRoleValidation,
  memberIdParamValidation,
};
