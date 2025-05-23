/**
 * Validation Middleware
 */
const { body, validationResult } = require('express-validator');
const { AppError } = require('../utils/app-error');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return next(new AppError(errorMessages[0], 400));
  }

  next();
};

/**
 * Validation rules for user creation
 */
const validateUserCreate = [
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isString().withMessage('First name must be a string')
    .trim(),

  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isString().withMessage('Last name must be a string')
    .trim(),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character'),

  body('role')
    .optional()
    .isIn(['user', 'consultant', 'admin', 'super-admin'])
    .withMessage('Invalid role'),

  handleValidationErrors
];

/**
 * Validation rules for user update
 */
const validateUserUpdate = [
  body('firstName')
    .optional()
    .isString().withMessage('First name must be a string')
    .trim(),

  body('lastName')
    .optional()
    .isString().withMessage('Last name must be a string')
    .trim(),

  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(['user', 'consultant', 'admin', 'super-admin'])
    .withMessage('Invalid role'),

  handleValidationErrors
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character'),

  body('confirmPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validation rules for organization creation
 */
const validateOrganizationCreate = [
  body('name')
    .notEmpty().withMessage('Organization name is required')
    .isString().withMessage('Organization name must be a string')
    .trim(),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),

  body('website')
    .optional()
    .isURL().withMessage('Website must be a valid URL'),

  body('industry')
    .optional()
    .isString().withMessage('Industry must be a string')
    .trim(),

  body('size')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid organization size'),

  handleValidationErrors
];

/**
 * Validation rules for project creation
 */
const validateProjectCreate = [
  body('name')
    .notEmpty().withMessage('Project name is required')
    .isString().withMessage('Project name must be a string')
    .trim(),

  body('description')
    .notEmpty().withMessage('Project description is required')
    .isString().withMessage('Project description must be a string')
    .trim(),

  body('client')
    .notEmpty().withMessage('Client organization is required')
    .isMongoId().withMessage('Invalid client organization ID'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),

  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['planning', 'in-progress', 'on-hold', 'completed', 'canceled'])
    .withMessage('Invalid project status'),

  body('manager')
    .notEmpty().withMessage('Project manager is required')
    .isMongoId().withMessage('Invalid project manager ID'),

  body('organization')
    .notEmpty().withMessage('Organization is required')
    .isMongoId().withMessage('Invalid organization ID'),

  handleValidationErrors
];

module.exports = {
  validateUserCreate,
  validateUserUpdate,
  validatePasswordChange,
  validateOrganizationCreate,
  validateProjectCreate,
  handleValidationErrors
};
