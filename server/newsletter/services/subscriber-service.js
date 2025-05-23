/**
 * Newsletter Subscriber Service
 * Handles business logic for newsletter subscribers
 */
const Subscriber = require('../models/subscriber-model');
const emailService = require('../../services/email-service');
const config = require('../../config/config');
const { AppError } = require('../../utils/app-error');
const crypto = require('crypto');

class SubscriberService {
  /**
   * Get all subscribers with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{subscribers: Array, total: Number, page: Number, limit: Number}>}
   */
  async getAllSubscribers(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-subscribedAt' } = options;
    const skip = (page - 1) * limit;

    // Count total before applying pagination
    const total = await Subscriber.countDocuments(filter);

    // Get subscribers with pagination
    const subscribers = await Subscriber.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    return {
      subscribers,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get active subscribers
   * @returns {Promise<Array>} Array of subscriber emails
   */
  async getActiveSubscriberEmails() {
    const subscribers = await Subscriber.find({
      status: 'active',
      isVerified: true
    }).select('email');

    return subscribers.map(subscriber => subscriber.email);
  }

  /**
   * Get subscriber by ID
   * @param {String} subscriberId - Subscriber ID
   * @returns {Promise<Subscriber>}
   */
  async getSubscriberById(subscriberId) {
    const subscriber = await Subscriber.findById(subscriberId);

    if (!subscriber) {
      throw new AppError('Subscriber not found', 404);
    }

    return subscriber;
  }

  /**
   * Get subscriber by email
   * @param {String} email - Subscriber email
   * @returns {Promise<Subscriber>}
   */
  async getSubscriberByEmail(email) {
    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    return subscriber;
  }

  /**
   * Create a new subscriber
   * @param {Object} subscriberData - Subscriber data
   * @returns {Promise<Subscriber>}
   */
  async createSubscriber(subscriberData) {
    // Check if subscriber already exists
    const existingSubscriber = await this.getSubscriberByEmail(subscriberData.email);

    if (existingSubscriber) {
      // If already subscribed, return the existing subscriber
      if (existingSubscriber.status === 'active') {
        return existingSubscriber;
      }

      // If unsubscribed, reactivate the subscription
      if (existingSubscriber.status === 'unsubscribed') {
        existingSubscriber.status = 'active';
        await existingSubscriber.save();
        return existingSubscriber;
      }
    }

    // Create a new subscriber
    const subscriber = await Subscriber.create(subscriberData);

    // Create verification token
    const verificationToken = subscriber.createVerificationToken();
    await subscriber.save();

    // Send verification email
    const verificationUrl = `${config.CLIENT_URL}/newsletter/verify/${verificationToken}`;
    await emailService.sendVerificationEmail(
      subscriber.email,
      subscriber.firstName || 'there',
      verificationUrl
    );

    return subscriber;
  }

  /**
   * Verify subscriber email
   * @param {String} token - Verification token
   * @returns {Promise<Subscriber>}
   */
  async verifySubscriber(token) {
    // Hash the token for comparison
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find subscriber with the token
    const subscriber = await Subscriber.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!subscriber) {
      throw new AppError('Invalid or expired token', 400);
    }

    // Update subscriber verification status
    subscriber.isVerified = true;
    subscriber.verificationToken = undefined;
    subscriber.verificationTokenExpiry = undefined;
    subscriber.status = 'active';

    await subscriber.save();

    return subscriber;
  }

  /**
   * Update subscriber preferences
   * @param {String} subscriberId - Subscriber ID
   * @param {Object} preferences - Subscriber preferences
   * @returns {Promise<Subscriber>}
   */
  async updateSubscriberPreferences(subscriberId, preferences) {
    const subscriber = await this.getSubscriberById(subscriberId);

    subscriber.preferences = {
      ...subscriber.preferences,
      ...preferences
    };

    await subscriber.save();

    return subscriber;
  }

  /**
   * Unsubscribe a subscriber
   * @param {String} email - Subscriber email
   * @param {String} token - Unsubscribe token
   * @returns {Promise<{message: String}>}
   */
  async unsubscribe(email, token) {
    const subscriber = await Subscriber.findOne({
      email: email.toLowerCase(),
      unsubscribeToken: token
    });

    if (!subscriber) {
      throw new AppError('Invalid unsubscribe request', 400);
    }

    subscriber.status = 'unsubscribed';
    await subscriber.save();

    return { message: 'Successfully unsubscribed from the newsletter' };
  }

  /**
   * Unsubscribe by email only (for admin or self-service)
   * @param {String} email - Subscriber email
   * @returns {Promise<{message: String}>}
   */
  async unsubscribeByEmail(email) {
    const subscriber = await Subscriber.findOne({
      email: email.toLowerCase()
    });

    if (!subscriber) {
      throw new AppError('Subscriber not found', 404);
    }

    subscriber.status = 'unsubscribed';
    await subscriber.save();

    return { message: 'Successfully unsubscribed from the newsletter' };
  }

  /**
   * Delete a subscriber
   * @param {String} subscriberId - Subscriber ID
   * @returns {Promise<{message: String}>}
   */
  async deleteSubscriber(subscriberId) {
    const result = await Subscriber.findByIdAndDelete(subscriberId);

    if (!result) {
      throw new AppError('Subscriber not found', 404);
    }

    return { message: 'Subscriber deleted successfully' };
  }
}

module.exports = new SubscriberService();
