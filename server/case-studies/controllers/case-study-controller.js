/**
 * Case Study Controller
 * Handles HTTP requests related to case studies
 */
const caseStudyService = require('../services/case-study-service');
const { catchAsync } = require('../../utils/catch-async');
const { AppError } = require('../../utils/app-error');

class CaseStudyController {
  /**
   * Get all case studies with filtering and pagination
   */
  getAllCaseStudies = catchAsync(async (req, res, next) => {
    const filter = { ...req.query };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      populate: req.query.populate
    };

    // Remove pagination and sorting options from filter
    ['page', 'limit', 'sort', 'populate'].forEach(el => delete filter[el]);

    // Check if requesting non-published case studies (admin only)
    let includeNonPublished = false;
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super-admin')) {
      includeNonPublished = true;
    } else if (req.user) {
      // For non-admins, only show published ones and drafts they created
      filter.$or = [
        { publishStatus: 'published' },
        { createdBy: req.user.id }
      ];
    } else {
      // For public, only show published
      filter.publishStatus = 'published';
    }

    const result = await caseStudyService.getAllCaseStudies(filter, options);

    res.status(200).json({
      status: 'success',
      data: result.caseStudies,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get case studies by organization
   */
  getCaseStudiesByOrganization = catchAsync(async (req, res, next) => {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      populate: req.query.populate
    };

    // Determine if non-published studies should be included
    let includeNonPublished = false;
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super-admin' ||
        (req.user.organization && req.user.organization.toString() === req.params.organizationId))) {
      includeNonPublished = true;
    }

    const result = await caseStudyService.getCaseStudiesByOrganization(
      req.params.organizationId,
      options,
      includeNonPublished
    );

    res.status(200).json({
      status: 'success',
      data: result.caseStudies,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get case study by ID or slug
   */
  getCaseStudyByIdOrSlug = catchAsync(async (req, res, next) => {
    const caseStudy = await caseStudyService.getCaseStudyByIdOrSlug(
      req.params.idOrSlug,
      req.query.populate || 'organization,createdBy,project,team.user'
    );

    // Check if case study is published or if user has access
    if (caseStudy.publishStatus !== 'published') {
      if (!req.user) {
        return next(new AppError('Case study not found', 404));
      }

      const isCreator = req.user.id === caseStudy.createdBy._id.toString();
      const isOrgMember = req.user.organization && req.user.organization.toString() === caseStudy.organization._id.toString();
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super-admin';

      if (!isCreator && !isOrgMember && !isAdmin) {
        return next(new AppError('Case study not found', 404));
      }
    }

    res.status(200).json({
      status: 'success',
      data: caseStudy
    });
  });

  /**
   * Create a new case study
   */
  createCaseStudy = catchAsync(async (req, res, next) => {
    // Default to current user's organization if not specified
    if (!req.body.organization && req.user.organization) {
      req.body.organization = req.user.organization;
    }

    const caseStudy = await caseStudyService.createCaseStudy(req.body, req.user.id);

    res.status(201).json({
      status: 'success',
      data: caseStudy
    });
  });

  /**
   * Update a case study
   */
  updateCaseStudy = catchAsync(async (req, res, next) => {
    const caseStudy = await caseStudyService.updateCaseStudy(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: caseStudy
    });
  });

  /**
   * Delete a case study
   */
  deleteCaseStudy = catchAsync(async (req, res, next) => {
    await caseStudyService.deleteCaseStudy(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Get related case studies
   */
  getRelatedCaseStudies = catchAsync(async (req, res, next) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 3;

    const caseStudies = await caseStudyService.getRelatedCaseStudies(req.params.id, limit);

    res.status(200).json({
      status: 'success',
      data: caseStudies
    });
  });

  /**
   * Update case study testimonial
   */
  updateCaseStudyTestimonial = catchAsync(async (req, res, next) => {
    const { quote, author, position, company, image } = req.body;

    if (!quote || !author) {
      return next(new AppError('Quote and author are required', 400));
    }

    const caseStudy = await caseStudyService.updateCaseStudyTestimonial(
      req.params.id,
      { quote, author, position, company, image }
    );

    res.status(200).json({
      status: 'success',
      data: caseStudy.testimonial
    });
  });

  /**
   * Add an image to a case study
   */
  addCaseStudyImage = catchAsync(async (req, res, next) => {
    const { url, caption, order } = req.body;

    if (!url) {
      return next(new AppError('Image URL is required', 400));
    }

    const caseStudy = await caseStudyService.addCaseStudyImage(
      req.params.id,
      { url, caption, order: order || caseStudy.images.length + 1 }
    );

    res.status(200).json({
      status: 'success',
      data: caseStudy.images
    });
  });

  /**
   * Remove an image from a case study
   */
  removeCaseStudyImage = catchAsync(async (req, res, next) => {
    const caseStudy = await caseStudyService.removeCaseStudyImage(
      req.params.id,
      req.params.imageId
    );

    res.status(200).json({
      status: 'success',
      data: caseStudy.images
    });
  });

  /**
   * Update case study SEO information
   */
  updateCaseStudySEO = catchAsync(async (req, res, next) => {
    const { metaTitle, metaDescription, keywords, ogImage } = req.body;

    const caseStudy = await caseStudyService.updateCaseStudySEO(
      req.params.id,
      { metaTitle, metaDescription, keywords, ogImage }
    );

    res.status(200).json({
      status: 'success',
      data: caseStudy.seo
    });
  });
}

module.exports = new CaseStudyController();
