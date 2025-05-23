/**
 * User Controller
 * Handles HTTP requests related to users
 */
const userService = require('../services/user-service');
const { catchAsync } = require('../../utils/catch-async');
const { AppError } = require('../../utils/app-error');

class UserController {
  /**
   * Get all users with filtering and pagination
   */
  getAllUsers = catchAsync(async (req, res, next) => {
    const filter = { ...req.query };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      populate: req.query.populate
    };

    // Remove pagination and sorting options from filter
    ['page', 'limit', 'sort', 'populate'].forEach(el => delete filter[el]);

    const result = await userService.getAllUsers(filter, options);

    res.status(200).json({
      status: 'success',
      data: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get user by ID
   */
  getUserById = catchAsync(async (req, res, next) => {
    const user = await userService.getUserById(req.params.id, req.query.populate);

    res.status(200).json({
      status: 'success',
      data: user
    });
  });

  /**
   * Get current logged in user
   */
  getCurrentUser = catchAsync(async (req, res, next) => {
    const user = await userService.getUserById(req.user.id, req.query.populate);

    res.status(200).json({
      status: 'success',
      data: user
    });
  });

  /**
   * Create a new user
   */
  createUser = catchAsync(async (req, res, next) => {
    // Only admins can create users directly
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    const user = await userService.createUser(req.body);

    res.status(201).json({
      status: 'success',
      data: user
    });
  });

  /**
   * Update a user
   */
  updateUser = catchAsync(async (req, res, next) => {
    // Check if user is trying to update themselves or if admin is updating someone else
    if (req.params.id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return next(new AppError('You do not have permission to update this user', 403));
    }

    // Prevent password update through this route
    if (req.body.password) {
      return next(new AppError('This route is not for password updates. Please use /change-password', 400));
    }

    const user = await userService.updateUser(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: user
    });
  });

  /**
   * Delete a user (soft delete)
   */
  deleteUser = catchAsync(async (req, res, next) => {
    // Only admins can delete users, or users can delete themselves
    if (req.params.id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return next(new AppError('You do not have permission to delete this user', 403));
    }

    await userService.deleteUser(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Change password
   */
  changePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Check if password and confirmPassword match
    if (newPassword !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    await userService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  });

  /**
   * Update current user profile
   */
  updateProfile = catchAsync(async (req, res, next) => {
    // Filter out fields that are not allowed to be updated
    const filteredBody = {};
    const allowedFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'title', 'bio', 'skills', 'profileImage'];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    const user = await userService.updateUser(req.user.id, filteredBody);

    res.status(200).json({
      status: 'success',
      data: user
    });
  });
}

module.exports = new UserController();
