/**
 * Authentication Service
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../users/models/user-model');
const { AppError } = require('../../utils/app-error');
const config = require('../../config/config');

class AuthService {
  /**
   * Sign JWT token
   * @param {String} id - User ID
   * @returns {String} JWT token
   */
  signToken(id) {
    return jwt.sign({ id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRATION
    });
  }

  /**
   * Create and send JWT token
   * @param {User} user - User object
   * @returns {Object} - Token and user data
   */
  createSendToken(user) {
    const token = this.signToken(user._id);

    // Remove sensitive data
    user.password = undefined;

    return {
      token,
      user
    };
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} - Authentication response with token and user
   */
  async register(userData) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Create new user
    const newUser = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user',
      organization: userData.organization
    });

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    newUser.verificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    newUser.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await newUser.save({ validateBeforeSave: false });

    // TODO: Send verification email

    return this.createSendToken(newUser);
  }

  /**
   * Login a user
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Object} - Authentication response with token and user
   */
  async login(email, password) {
    // Check if email and password exist
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user by email and include password in the result
    const user = await User.findOne({ email }).select('+password +active');

    // Check if user exists and password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    // Check if user is active
    if (!user.active) {
      throw new AppError('Your account has been deactivated', 401);
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    return this.createSendToken(user);
  }

  /**
   * Verify email with token
   * @param {String} token - Email verification token
   * @returns {Object} - Success message
   */
  async verifyEmail(token) {
    // Hash the token for comparison
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with the token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    // Check if token is valid
    if (!user) {
      throw new AppError('Invalid or expired token', 400);
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return {
      message: 'Email verified successfully'
    };
  }

  /**
   * Request password reset
   * @param {String} email - User email
   * @returns {Object} - Success message
   */
  async forgotPassword(email) {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('No user found with this email', 404);
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send reset password email

    return {
      message: 'Reset token sent to email'
    };
  }

  /**
   * Reset password
   * @param {String} token - Password reset token
   * @param {String} password - New password
   * @returns {Object} - Success message
   */
  async resetPassword(token, password) {
    // Hash the token for comparison
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with the token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    // Check if token is valid
    if (!user) {
      throw new AppError('Invalid or expired token', 400);
    }

    // Update user password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    return this.createSendToken(user);
  }
}

module.exports = new AuthService();
