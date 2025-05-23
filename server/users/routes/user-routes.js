/**
 * User Routes
 */
const express = require('express');
const userController = require('../controllers/user-controller');
const { authenticate } = require('../../middleware/auth-middleware');
const { restrictTo } = require('../../middleware/role-middleware');
const { validateUserCreate, validateUserUpdate, validatePasswordChange } = require('../../middleware/validation-middleware');

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

// Current user routes
router.get('/me', userController.getCurrentUser);
router.patch('/update-profile', userController.updateProfile);
router.patch('/change-password', validatePasswordChange, userController.changePassword);

// Admin only routes
router.route('/')
  .get(restrictTo('admin', 'super-admin'), userController.getAllUsers)
  .post(restrictTo('admin', 'super-admin'), validateUserCreate, userController.createUser);

router.route('/:id')
  .get(userController.getUserById)
  .patch(validateUserUpdate, userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
