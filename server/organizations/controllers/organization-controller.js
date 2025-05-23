/**
 * Organization Controller
 * Handles HTTP requests related to organizations
 */
const organizationService = require('../services/organization-service');
const { catchAsync } = require('../../utils/catch-async');
const { AppError } = require('../../utils/app-error');

class OrganizationController {
  /**
   * Get all organizations with filtering and pagination
   */
  getAllOrganizations = catchAsync(async (req, res, next) => {
    const filter = { ...req.query };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      populate: req.query.populate
    };

    // Remove pagination and sorting options from filter
    ['page', 'limit', 'sort', 'populate'].forEach(el => delete filter[el]);

    const result = await organizationService.getAllOrganizations(filter, options);

    res.status(200).json({
      status: 'success',
      data: result.organizations,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get organization by ID
   */
  getOrganizationById = catchAsync(async (req, res, next) => {
    const organization = await organizationService.getOrganizationById(req.params.id, req.query.populate);

    res.status(200).json({
      status: 'success',
      data: organization
    });
  });

  /**
   * Create a new organization
   */
  createOrganization = catchAsync(async (req, res, next) => {
    const organization = await organizationService.createOrganization(req.body, req.user.id);

    res.status(201).json({
      status: 'success',
      data: organization
    });
  });

  /**
   * Update an organization
   */
  updateOrganization = catchAsync(async (req, res, next) => {
    const organization = await organizationService.updateOrganization(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: organization
    });
  });

  /**
   * Delete an organization (soft delete)
   */
  deleteOrganization = catchAsync(async (req, res, next) => {
    await organizationService.deleteOrganization(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Get organization members
   */
  getOrganizationMembers = catchAsync(async (req, res, next) => {
    const members = await organizationService.getOrganizationMembers(req.params.id);

    res.status(200).json({
      status: 'success',
      data: members
    });
  });

  /**
   * Add a member to an organization
   */
  addOrganizationMember = catchAsync(async (req, res, next) => {
    const { userId, role } = req.body;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const organization = await organizationService.addOrganizationMember(
      req.params.id,
      userId,
      role
    );

    res.status(200).json({
      status: 'success',
      data: organization.members
    });
  });

  /**
   * Update a member's role in an organization
   */
  updateOrganizationMember = catchAsync(async (req, res, next) => {
    const { role } = req.body;

    if (!role) {
      return next(new AppError('Role is required', 400));
    }

    const organization = await organizationService.updateOrganizationMember(
      req.params.id,
      req.params.userId,
      role
    );

    res.status(200).json({
      status: 'success',
      data: organization.members
    });
  });

  /**
   * Remove a member from an organization
   */
  removeOrganizationMember = catchAsync(async (req, res, next) => {
    const organization = await organizationService.removeOrganizationMember(
      req.params.id,
      req.params.userId
    );

    res.status(200).json({
      status: 'success',
      data: organization.members
    });
  });

  /**
   * Get current user's organization
   */
  getCurrentUserOrganization = catchAsync(async (req, res, next) => {
    // If user doesn't have an organization, return error
    if (!req.user.organization) {
      return next(new AppError('You do not belong to any organization', 404));
    }

    const organization = await organizationService.getOrganizationById(
      req.user.organization,
      req.query.populate
    );

    res.status(200).json({
      status: 'success',
      data: organization
    });
  });
}

module.exports = new OrganizationController();
