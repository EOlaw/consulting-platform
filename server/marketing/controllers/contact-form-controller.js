/**
 * Contact Form Controller
 */
const contactFormService = require('../services/contact-form-service');
const { catchAsync } = require('../../utils/catch-async');
const { AppError } = require('../../utils/app-error');

class ContactFormController {
  /**
   * Create a new contact form submission
   */
  createSubmission = catchAsync(async (req, res, next) => {
    // Collect IP and user agent for anti-spam measures
    const formData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      source: req.body.source || 'website'
    };

    // If organization is provided and user is authenticated, use it
    if (req.user && req.user.organization) {
      formData.organization = formData.organization || req.user.organization;
    }

    const submission = await contactFormService.createSubmission(formData);

    res.status(201).json({
      status: 'success',
      data: {
        submission
      }
    });
  });

  /**
   * Get all contact form submissions with filtering and pagination
   */
  getAllSubmissions = catchAsync(async (req, res, next) => {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      status: req.query.status,
      organization: req.query.organization,
      search: req.query.search
    };

    // Filter for the organization's submissions if user is not admin
    const filter = {};
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      filter.organization = req.user.organization;
    }

    const result = await contactFormService.getAllSubmissions(filter, options);

    res.status(200).json({
      status: 'success',
      data: {
        submissions: result.submissions,
        pagination: result.pagination
      }
    });
  });

  /**
   * Get submission by ID
   */
  getSubmissionById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const submission = await contactFormService.getSubmissionById(id);

    // Check if user has access to this submission
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'super-admin' &&
      (!submission.organization || submission.organization._id.toString() !== req.user.organization.toString())
    ) {
      return next(new AppError('You are not authorized to access this submission', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        submission
      }
    });
  });

  /**
   * Update submission
   */
  updateSubmission = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check authorization - only users with access to the organization can update
    const currentSubmission = await contactFormService.getSubmissionById(id);

    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'super-admin' &&
      (!currentSubmission.organization || currentSubmission.organization._id.toString() !== req.user.organization.toString())
    ) {
      return next(new AppError('You are not authorized to update this submission', 403));
    }

    const updatedSubmission = await contactFormService.updateSubmission(id, updateData);

    res.status(200).json({
      status: 'success',
      data: {
        submission: updatedSubmission
      }
    });
  });

  /**
   * Delete submission
   */
  deleteSubmission = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Check authorization - only users with access to the organization can delete
    const submission = await contactFormService.getSubmissionById(id);

    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'super-admin' &&
      (!submission.organization || submission.organization._id.toString() !== req.user.organization.toString())
    ) {
      return next(new AppError('You are not authorized to delete this submission', 403));
    }

    await contactFormService.deleteSubmission(id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Assign submission to user
   */
  assignSubmission = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    // Check authorization - only users with access to the organization can assign
    const submission = await contactFormService.getSubmissionById(id);

    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'super-admin' &&
      (!submission.organization || submission.organization._id.toString() !== req.user.organization.toString())
    ) {
      return next(new AppError('You are not authorized to assign this submission', 403));
    }

    const updatedSubmission = await contactFormService.assignSubmission(id, userId);

    res.status(200).json({
      status: 'success',
      data: {
        submission: updatedSubmission
      }
    });
  });
}

module.exports = new ContactFormController();
