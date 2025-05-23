/**
 * Role-based Access Control Middleware
 */
const { AppError } = require('../utils/app-error');

/**
 * Middleware to restrict access based on user roles
 * @param {...String} roles - Roles that are allowed to access the route
 * @returns {Function} - Express middleware function
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user has one of the required roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

/**
 * Middleware to check if user belongs to organization
 * @param {String} paramName - Request parameter name that contains organization ID
 * @returns {Function} - Express middleware function
 */
const belongsToOrganization = (paramName = 'organizationId') => {
  return async (req, res, next) => {
    const organizationId = req.params[paramName] || req.body[paramName];

    if (!organizationId) {
      return next(new AppError('Organization ID is required', 400));
    }

    // If user is admin or super-admin, allow access to any organization
    if (req.user.role === 'admin' || req.user.role === 'super-admin') {
      return next();
    }

    // Check if user belongs to organization
    if (!req.user.organization || req.user.organization.toString() !== organizationId) {
      return next(
        new AppError('You do not have permission to access this organization', 403)
      );
    }

    next();
  };
};

/**
 * Middleware to check if user is owner or admin of organization
 * @param {String} paramName - Request parameter name that contains organization ID
 * @returns {Function} - Express middleware function
 */
const isOrganizationAdmin = (paramName = 'organizationId') => {
  return async (req, res, next) => {
    const organizationId = req.params[paramName] || req.body[paramName];

    if (!organizationId) {
      return next(new AppError('Organization ID is required', 400));
    }

    // If user is admin or super-admin, allow access to any organization
    if (req.user.role === 'admin' || req.user.role === 'super-admin') {
      return next();
    }

    // Check if user belongs to organization and is owner or admin
    const Organization = require('../organizations/models/organization-model');

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return next(new AppError('Organization not found', 404));
    }

    // Check if user is owner or admin of organization
    const member = organization.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

module.exports = {
  restrictTo,
  belongsToOrganization,
  isOrganizationAdmin
};
