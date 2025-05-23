/**
 * Authentication Middleware
 */
const passport = require('passport');
const { AppError } = require('../utils/app-error');

/**
 * Middleware to authenticate user using JWT strategy
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Check if user is active
    if (user.active === false) {
      return next(new AppError('This user account has been deactivated.', 401));
    }

    // Attach user to request object
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = {
  authenticate
};
