/**
 * Service Controller
 */
const serviceService = require('../services/service-service');
const catchAsync = require('../../utils/catch-async');
const AppError = require('../../utils/app-error');

class ServiceController {
  /**
   * Create a new service
   */
  createService = catchAsync(async (req, res, next) => {
    // Add creator and organization from authenticated user
    const serviceData = {
      ...req.body,
      createdBy: req.user.id,
      organization: req.body.organization || req.user.organization
    };

    const service = await serviceService.createService(serviceData);

    res.status(201).json({
      status: 'success',
      data: {
        service
      }
    });
  });

  /**
   * Get all services with filtering and pagination
   */
  getAllServices = catchAsync(async (req, res, next) => {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      category: req.query.category,
      status: req.query.status,
      organization: req.query.organization,
      search: req.query.search
    };

    // Filter for the organization's services if user is not admin
    const filter = {};
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      filter.organization = req.user.organization;
    }

    const result = await serviceService.getAllServices(filter, options);

    res.status(200).json({
      status: 'success',
      data: {
        services: result.services,
        pagination: result.pagination
      }
    });
  });

  /**
   * Get featured services
   */
  getFeaturedServices = catchAsync(async (req, res, next) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    const services = await serviceService.getFeaturedServices(limit);

    res.status(200).json({
      status: 'success',
      data: {
        services
      }
    });
  });

  /**
   * Get services by category
   */
  getServicesByCategory = catchAsync(async (req, res, next) => {
    const { category } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const services = await serviceService.getServicesByCategory(category, limit);

    res.status(200).json({
      status: 'success',
      data: {
        services
      }
    });
  });

  /**
   * Get service by ID
   */
  getServiceById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const service = await serviceService.getServiceById(id);

    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  });

  /**
   * Get service by slug
   */
  getServiceBySlug = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const service = await serviceService.getServiceBySlug(slug);

    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  });

  /**
   * Update service
   */
  updateService = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const serviceData = req.body;

    // Check authorization - only owner or admin can update
    const currentService = await serviceService.getServiceById(id);

    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'super-admin' &&
      currentService.createdBy._id.toString() !== req.user.id.toString() &&
      currentService.organization._id.toString() !== req.user.organization.toString()
    ) {
      return next(new AppError('You are not authorized to update this service', 403));
    }

    const updatedService = await serviceService.updateService(id, serviceData);

    res.status(200).json({
      status: 'success',
      data: {
        service: updatedService
      }
    });
  });

  /**
   * Delete service
   */
  deleteService = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Check authorization - only owner or admin can delete
    const service = await serviceService.getServiceById(id);

    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'super-admin' &&
      service.createdBy._id.toString() !== req.user.id.toString() &&
      service.organization._id.toString() !== req.user.organization.toString()
    ) {
      return next(new AppError('You are not authorized to delete this service', 403));
    }

    await serviceService.deleteService(id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Add related case study
   */
  addRelatedCaseStudy = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { caseStudyId } = req.body;

    if (!caseStudyId) {
      return next(new AppError('Case study ID is required', 400));
    }

    const service = await serviceService.addRelatedCaseStudy(id, caseStudyId);

    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  });

  /**
   * Remove related case study
   */
  removeRelatedCaseStudy = catchAsync(async (req, res, next) => {
    const { id, caseStudyId } = req.params;

    const service = await serviceService.removeRelatedCaseStudy(id, caseStudyId);

    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  });
}

module.exports = new ServiceController();
