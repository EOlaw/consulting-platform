/**
 * User Service
 * Handles business logic for user operations
 */
const User = require('../models/user-model');
const { AppError } = require('../../utils/app-error');

class UserService {
  /**
   * Get all users with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{users: Array, total: Number, page: Number, limit: Number}>}
   */
  async getAllUsers(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt', populate = '' } = options;
    const skip = (page - 1) * limit;

    // Handle active filter (exclude inactive users by default)
    const queryFilter = { ...filter };
    if (!queryFilter.active) queryFilter.active = { $ne: false };

    // Count total before applying pagination
    const total = await User.countDocuments(queryFilter);

    // Get users with pagination
    let query = User.find(queryFilter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Apply population if specified
    if (populate) {
      query = query.populate(populate);
    }

    const users = await query;

    return {
      users,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get a user by ID
   * @param {String} userId - The user ID
   * @param {String} populate - Fields to populate
   * @returns {Promise<User>}
   */
  async getUserById(userId, populate = '') {
    let query = User.findById(userId);

    if (populate) {
      query = query.populate(populate);
    }

    const user = await query;

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Get a user by email
   * @param {String} email - User email
   * @returns {Promise<User>}
   */
  async getUserByEmail(email) {
    const user = await User.findOne({ email });
    return user;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>}
   */
  async createUser(userData) {
    // Check if user with the same email already exists
    const existingUser = await this.getUserByEmail(userData.email);

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const user = await User.create(userData);
    return user;
  }

  /**
   * Update a user
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<User>}
   */
  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Delete a user (soft delete)
   * @param {String} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { active: false },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return { message: 'User deleted successfully' };
  }

  /**
   * Hard delete a user (for testing or admin purposes)
   * @param {String} userId - User ID
   * @returns {Promise<void>}
   */
  async hardDeleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return { message: 'User permanently deleted' };
  }

  /**
   * Change user password
   * @param {String} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Promise<{message: String}>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Get user with password
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if current password is correct
    const isPasswordCorrect = await user.correctPassword(currentPassword, user.password);

    if (!isPasswordCorrect) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }
}

module.exports = new UserService();
