/**
 * Authentication Controller
 */
const authService = require('../services/auth-service');
const { catchAsync } = require('../../utils/catch-async');
const { AppError } = require('../../utils/app-error');

class AuthController {
  /**
   * Register a new user
   */
  register = catchAsync(async (req, res, next) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      status: 'success',
      token: result.token,
      data: {
        user: result.user
      }
    });
  });

  /**
   * Login a user
   */
  login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      status: 'success',
      token: result.token,
      data: {
        user: result.user
      }
    });
  });

  /**
   * Verify email
   */
  verifyEmail = catchAsync(async (req, res, next) => {
    const { token } = req.params;

    const result = await authService.verifyEmail(token);

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  /**
   * Forgot password
   */
  forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  /**
   * Reset password
   */
  resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    const result = await authService.resetPassword(token, password);

    res.status(200).json({
      status: 'success',
      token: result.token,
      data: {
        user: result.user
      }
    });
  });
}

module.exports = new AuthController();
