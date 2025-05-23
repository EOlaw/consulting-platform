/**
 * Newsletter Campaign Controller
 * Handles HTTP requests related to newsletter campaigns
 */
const campaignService = require('../services/campaign-service');
const { catchAsync } = require('../../utils/catch-async');
const { AppError } = require('../../utils/app-error');

class CampaignController {
  /**
   * Get all campaigns with filtering and pagination
   */
  getAllCampaigns = catchAsync(async (req, res, next) => {
    const filter = { ...req.query };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      populate: req.query.populate
    };

    // Remove pagination and sorting options from filter
    ['page', 'limit', 'sort', 'populate'].forEach(el => delete filter[el]);

    const result = await campaignService.getAllCampaigns(filter, options);

    res.status(200).json({
      status: 'success',
      data: result.campaigns,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  });

  /**
   * Get campaign by ID
   */
  getCampaignById = catchAsync(async (req, res, next) => {
    const campaign = await campaignService.getCampaignById(
      req.params.id,
      req.query.populate || 'createdBy'
    );

    res.status(200).json({
      status: 'success',
      data: campaign
    });
  });

  /**
   * Create a new campaign
   */
  createCampaign = catchAsync(async (req, res, next) => {
    const { name, subject, content, targetGroups } = req.body;

    if (!name || !subject || !content) {
      return next(new AppError('Name, subject, and content are required', 400));
    }

    const campaign = await campaignService.createCampaign(
      { name, subject, content, targetGroups },
      req.user.id
    );

    res.status(201).json({
      status: 'success',
      data: campaign
    });
  });

  /**
   * Update a campaign
   */
  updateCampaign = catchAsync(async (req, res, next) => {
    const { name, subject, content, targetGroups } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (subject) updateData.subject = subject;
    if (content) updateData.content = content;
    if (targetGroups) updateData.targetGroups = targetGroups;

    const campaign = await campaignService.updateCampaign(req.params.id, updateData);

    res.status(200).json({
      status: 'success',
      data: campaign
    });
  });

  /**
   * Delete a campaign
   */
  deleteCampaign = catchAsync(async (req, res, next) => {
    await campaignService.deleteCampaign(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Schedule a campaign
   */
  scheduleCampaign = catchAsync(async (req, res, next) => {
    const { scheduledFor } = req.body;

    if (!scheduledFor) {
      return next(new AppError('Scheduled date is required', 400));
    }

    const campaign = await campaignService.scheduleCampaign(
      req.params.id,
      new Date(scheduledFor)
    );

    res.status(200).json({
      status: 'success',
      message: `Campaign scheduled for ${campaign.scheduledFor}`,
      data: campaign
    });
  });

  /**
   * Send a campaign immediately
   */
  sendCampaign = catchAsync(async (req, res, next) => {
    const campaign = await campaignService.sendCampaign(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Campaign sent successfully',
      data: {
        id: campaign._id,
        name: campaign.name,
        status: campaign.status,
        sentAt: campaign.sentAt,
        recipientCount: campaign.stats.totalSent
      }
    });
  });

  /**
   * Get campaign statistics
   */
  getCampaignStats = catchAsync(async (req, res, next) => {
    const stats = await campaignService.getCampaignStats(req.params.id);

    res.status(200).json({
      status: 'success',
      data: stats
    });
  });

  /**
   * Process scheduled campaigns (admin only)
   */
  processScheduledCampaigns = catchAsync(async (req, res, next) => {
    const results = await campaignService.processScheduledCampaigns();

    res.status(200).json({
      status: 'success',
      message: `Processed ${results.length} scheduled campaigns`,
      data: results
    });
  });
}

module.exports = new CampaignController();
