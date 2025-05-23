/**
 * Newsletter Campaign Service
 * Handles business logic for newsletter campaigns
 */
const Campaign = require('../models/campaign-model');
const Subscriber = require('../models/subscriber-model');
const emailService = require('../../services/email-service');
const { AppError } = require('../../utils/app-error');

class CampaignService {
  /**
   * Get all campaigns with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<{campaigns: Array, total: Number, page: Number, limit: Number}>}
   */
  async getAllCampaigns(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt', populate = '' } = options;
    const skip = (page - 1) * limit;

    // Count total before applying pagination
    const total = await Campaign.countDocuments(filter);

    // Get campaigns with pagination
    let query = Campaign.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Apply population if specified
    if (populate) {
      query = query.populate(populate);
    }

    const campaigns = await query;

    return {
      campaigns,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get a campaign by ID
   * @param {String} campaignId - Campaign ID
   * @param {String} populate - Fields to populate
   * @returns {Promise<Campaign>}
   */
  async getCampaignById(campaignId, populate = '') {
    let query = Campaign.findById(campaignId);

    if (populate) {
      query = query.populate(populate);
    }

    const campaign = await query;

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    return campaign;
  }

  /**
   * Create a new campaign
   * @param {Object} campaignData - Campaign data
   * @param {String} userId - User ID of the creator
   * @returns {Promise<Campaign>}
   */
  async createCampaign(campaignData, userId) {
    const campaign = await Campaign.create({
      ...campaignData,
      createdBy: userId
    });

    return campaign;
  }

  /**
   * Update a campaign
   * @param {String} campaignId - Campaign ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Campaign>}
   */
  async updateCampaign(campaignId, updateData) {
    // Don't allow updating a campaign that has already been sent
    const existingCampaign = await this.getCampaignById(campaignId);

    if (existingCampaign.status === 'sent') {
      throw new AppError('Cannot update a campaign that has already been sent', 400);
    }

    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    return campaign;
  }

  /**
   * Delete a campaign
   * @param {String} campaignId - Campaign ID
   * @returns {Promise<{message: String}>}
   */
  async deleteCampaign(campaignId) {
    // Don't allow deleting a campaign that has already been sent
    const existingCampaign = await this.getCampaignById(campaignId);

    if (existingCampaign.status === 'sent') {
      throw new AppError('Cannot delete a campaign that has already been sent', 400);
    }

    const campaign = await Campaign.findByIdAndDelete(campaignId);

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    return { message: 'Campaign deleted successfully' };
  }

  /**
   * Schedule a campaign
   * @param {String} campaignId - Campaign ID
   * @param {Date} scheduledFor - Date to send the campaign
   * @returns {Promise<Campaign>}
   */
  async scheduleCampaign(campaignId, scheduledFor) {
    const campaign = await this.getCampaignById(campaignId);

    if (campaign.status !== 'draft') {
      throw new AppError(`Cannot schedule a campaign with status: ${campaign.status}`, 400);
    }

    if (new Date(scheduledFor) <= new Date()) {
      throw new AppError('Scheduled date must be in the future', 400);
    }

    campaign.status = 'scheduled';
    campaign.scheduledFor = scheduledFor;

    await campaign.save();

    return campaign;
  }

  /**
   * Send a campaign immediately
   * @param {String} campaignId - Campaign ID
   * @returns {Promise<Campaign>}
   */
  async sendCampaign(campaignId) {
    const campaign = await this.getCampaignById(campaignId);

    if (campaign.status === 'sent') {
      throw new AppError('Campaign has already been sent', 400);
    }

    if (campaign.status === 'sending') {
      throw new AppError('Campaign is already being sent', 400);
    }

    // Get subscribers based on campaign target groups
    const subscriberQuery = {
      status: 'active',
      isVerified: true
    };

    // Filter by preferences if not targeting all groups
    if (!Object.values(campaign.targetGroups).every(val => val === true)) {
      const preferenceFilters = [];

      Object.entries(campaign.targetGroups).forEach(([key, value]) => {
        if (value) {
          preferenceFilters.push({ [`preferences.${key}`]: true });
        }
      });

      if (preferenceFilters.length > 0) {
        subscriberQuery.$or = preferenceFilters;
      }
    }

    const subscribers = await Subscriber.find(subscriberQuery).select('email');
    const subscriberEmails = subscribers.map(s => s.email);

    if (subscriberEmails.length === 0) {
      throw new AppError('No subscribers match the target criteria', 400);
    }

    // Update campaign status to sending
    campaign.status = 'sending';
    await campaign.save();

    try {
      // Send the newsletter
      await emailService.sendNewsletter(
        subscriberEmails,
        campaign.subject,
        campaign.content
      );

      // Update campaign status and stats
      campaign.status = 'sent';
      campaign.sentAt = Date.now();
      campaign.stats.totalSent = subscriberEmails.length;

      await campaign.save();

      // Update subscriber records
      const bulkOps = subscriberEmails.map(email => ({
        updateOne: {
          filter: { email },
          update: {
            $set: { lastEmailSent: new Date() },
            $push: {
              campaigns: {
                campaignId: campaign._id,
                sent: new Date()
              }
            }
          }
        }
      }));

      await Subscriber.bulkWrite(bulkOps);

      return campaign;
    } catch (error) {
      // If sending fails, revert to draft status
      campaign.status = 'draft';
      await campaign.save();

      throw new AppError(`Failed to send campaign: ${error.message}`, 500);
    }
  }

  /**
   * Process scheduled campaigns (to be run by a cron job)
   * @returns {Promise<Array>} Array of sent campaigns
   */
  async processScheduledCampaigns() {
    const now = new Date();

    // Find campaigns that are scheduled to be sent now or in the past
    const scheduledCampaigns = await Campaign.find({
      status: 'scheduled',
      scheduledFor: { $lte: now }
    });

    const results = [];

    for (const campaign of scheduledCampaigns) {
      try {
        const sentCampaign = await this.sendCampaign(campaign._id);
        results.push({
          campaignId: sentCampaign._id,
          name: sentCampaign.name,
          status: 'sent',
          recipientCount: sentCampaign.stats.totalSent
        });
      } catch (error) {
        results.push({
          campaignId: campaign._id,
          name: campaign.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get campaign statistics
   * @param {String} campaignId - Campaign ID
   * @returns {Promise<Object>} Campaign statistics
   */
  async getCampaignStats(campaignId) {
    const campaign = await this.getCampaignById(campaignId);

    return campaign.stats;
  }
}

module.exports = new CampaignService();
