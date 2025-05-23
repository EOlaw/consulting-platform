/**
 * Newsletter Subscriber Controller
 * Handles HTTP requests related to newsletter subscribers
 */
const subscriberService = require('../services/subscriber-service');
const { catchAsync } = require('../../utils/catch-async');
const { AppError } = require('../../utils/app-error');

class SubscriberController {
  /**
   * Get all subscribers with filtering and pagination
   */
  getAllSubscribers = catchAsync(async (req, res, next) => {
    const filter = { ...req.query };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort
    };

    // Remove pagination and sorting options from filter
    ['page', 'limit', 'sort'].forEach(el => delete filter[el]);

    const result = await subscriberService.getAllSubscribers(filter, options);

    res.status(200).json({
      status: 'success',
      data: result.subscribers,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get subscriber by ID
   */
  getSubscriberById = catchAsync(async (req, res, next) => {
    const subscriber = await subscriberService.getSubscriberById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: subscriber
    });
  });

  /**
   * Subscribe to newsletter
   */
  subscribe = catchAsync(async (req, res, next) => {
    const { email, firstName, lastName, preferences, source } = req.body;

    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    const subscriber = await subscriberService.createSubscriber({
      email,
      firstName,
      lastName,
      preferences,
      source: source || 'website'
    });

    res.status(201).json({
      status: 'success',
      message: 'Thank you for subscribing! Please check your email to verify your subscription.',
      data: {
        email: subscriber.email,
        firstName: subscriber.firstName,
        isVerified: subscriber.isVerified
      }
    });
  });

  /**
   * Verify subscriber email
   */
  verifySubscriber = catchAsync(async (req, res, next) => {
    const subscriber = await subscriberService.verifySubscriber(req.params.token);

    res.status(200).json({
      status: 'success',
      message: 'Email verification successful! You are now subscribed to our newsletter.',
      data: {
        email: subscriber.email,
        isVerified: subscriber.isVerified
      }
    });
  });

  /**
   * Update subscriber preferences
   */
  updatePreferences = catchAsync(async (req, res, next) => {
    const { preferences } = req.body;

    if (!preferences) {
      return next(new AppError('Preferences are required', 400));
    }

    const subscriber = await subscriberService.updateSubscriberPreferences(
      req.params.id,
      preferences
    );

    res.status(200).json({
      status: 'success',
      message: 'Your preferences have been updated successfully.',
      data: subscriber.preferences
    });
  });

  /**
   * Unsubscribe from newsletter
   */
  unsubscribe = catchAsync(async (req, res, next) => {
    const { email, token } = req.body;

    if (!email || !token) {
      return next(new AppError('Email and token are required', 400));
    }

    const result = await subscriberService.unsubscribe(email, token);

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  /**
   * Unsubscribe by email (admin or self-service)
   */
  unsubscribeByEmail = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    const result = await subscriberService.unsubscribeByEmail(email);

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  /**
   * Delete a subscriber
   */
  deleteSubscriber = catchAsync(async (req, res, next) => {
    await subscriberService.deleteSubscriber(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
}

module.exports = new SubscriberController();
